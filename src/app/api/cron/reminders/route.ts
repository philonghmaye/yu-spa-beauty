import { NextResponse } from 'next/server';
import { processReminders } from '@/actions/notifications';

/**
 * Cron endpoint for processing appointment reminders
 * 
 * Can be called by:
 * - Vercel Cron Jobs (vercel.json config)
 * - External cron service (e.g., cron-job.org)
 * - Manual trigger via GET /api/cron/reminders
 * 
 * Recommended schedule: every 30 minutes
 */
export async function GET(request: Request) {
  // Optional: verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await processReminders();
    
    console.log(`⏰ Reminders processed: 24h=${results.sent24h}, 2h=${results.sent2h}, errors=${results.errors}`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
