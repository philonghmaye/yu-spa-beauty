export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getVietnamNow } from '@/lib/utils';
import StatsClient from './StatsClient';

async function getStatsData() {
  try {
    const now = getVietnamNow();

    // --- Daily data: last 30 days ---
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyStart = thirtyDaysAgo.toISOString().split('T')[0];
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // --- Monthly data: last 6 months ---
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthStart = sixMonthsAgo.toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [allAppointments, serviceStats, staffStats, totalRevenue, totalAppointments, totalCustomers] = await Promise.all([
      prisma.appointment.findMany({
        where: { status: 'COMPLETED' },
        select: { appointmentDate: true, finalAmount: true },
      }),
      prisma.appointmentService.groupBy({
        by: ['serviceId'],
        _count: true,
        _sum: { price: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take: 5,
      }),
      prisma.appointment.groupBy({
        by: ['employeeId'],
        where: { status: 'COMPLETED', employeeId: { not: null } },
        _count: true,
        _sum: { finalAmount: true },
        orderBy: { _count: { employeeId: 'desc' } },
        take: 5,
      }),
      prisma.appointment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalAmount: true },
      }),
      prisma.appointment.count(),
      prisma.customer.count(),
    ]);

    // --- Group by DAY (last 30 days) ---
    const dailyMap = new Map<string, { value: number; count: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyMap.set(dateKey, { value: 0, count: 0 });
    }

    // --- Group by MONTH (last 6 months) ---
    const monthlyMap = new Map<string, { value: number; count: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `T${d.getMonth() + 1}/${d.getFullYear()}`;
      monthlyMap.set(key, { value: 0, count: 0 });
    }

    // --- Group by YEAR ---
    const yearlyMap = new Map<string, { value: number; count: number }>();

    allAppointments.forEach((a) => {
      const [year, month, day] = a.appointmentDate.split('-');

      // Daily
      const dailyEntry = dailyMap.get(a.appointmentDate);
      if (dailyEntry) {
        dailyEntry.value += a.finalAmount;
        dailyEntry.count += 1;
      }

      // Monthly
      const monthKey = `T${parseInt(month)}/${year}`;
      const monthEntry = monthlyMap.get(monthKey);
      if (monthEntry) {
        monthEntry.value += a.finalAmount;
        monthEntry.count += 1;
      }

      // Yearly
      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, { value: 0, count: 0 });
      }
      const yearEntry = yearlyMap.get(year)!;
      yearEntry.value += a.finalAmount;
      yearEntry.count += 1;
    });

    const dailyData = Array.from(dailyMap.entries()).map(([dateKey, data]) => {
      const [y, m, d] = dateKey.split('-');
      return { date: `${d}/${m}`, ...data };
    });

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month, ...data,
    }));

    const yearlyData = Array.from(yearlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, data]) => ({ year, ...data }));

    // Batch fetch service & staff names concurrently
    const serviceIds = serviceStats.map((s) => s.serviceId);
    const employeeIds = staffStats.filter((s) => s.employeeId).map((s) => s.employeeId!);

    const [servicesList, employeesList] = await Promise.all([
      serviceIds.length > 0
        ? prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      employeeIds.length > 0
        ? prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            include: { user: { select: { name: true } } },
          })
        : Promise.resolve([]),
    ]);

    const servicesMap = new Map(servicesList.map((s) => [s.id, s.name]));
    const employeesMap = new Map(employeesList.map((e) => [e.id, e.user.name]));

    const topServices = serviceStats.map((s) => ({
      name: servicesMap.get(s.serviceId) || 'Unknown',
      count: s._count,
      revenue: s._sum.price || 0,
    }));



    const topStaff = staffStats
      .filter((s) => s.employeeId)
      .map((s) => ({
        name: employeesMap.get(s.employeeId!) || 'Unknown',
        appointments: s._count,
        revenue: s._sum.finalAmount || 0,
      }));

    return {
      dailyData,
      monthlyData,
      yearlyData,
      topServices,
      topStaff,
      totalRevenue: totalRevenue._sum.finalAmount || 0,
      totalAppointments,
      totalCustomers,
    };
  } catch (e) {
    console.error('Stats error:', e);
    return {
      dailyData: [],
      monthlyData: [],
      yearlyData: [],
      topServices: [],
      topStaff: [],
      totalRevenue: 0,
      totalAppointments: 0,
      totalCustomers: 0,
    };
  }
}

export default async function StatsPage() {
  const data = await getStatsData();
  return <StatsClient data={data} />;
}
