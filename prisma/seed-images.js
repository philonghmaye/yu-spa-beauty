const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedImages() {
  // Get all employees
  const employees = await prisma.employee.findMany({
    include: { user: true, images: true },
    orderBy: { createdAt: 'asc' },
  });

  if (employees.length === 0) {
    console.log('No employees found. Please add employees first.');
    return;
  }

  const staffImages = [
    '/uploads/staff-1.png',
    '/uploads/staff-2.png',
    '/uploads/staff-3.png',
    '/uploads/staff-4.png',
    '/uploads/staff-5.png',
  ];

  // Distribute images across employees
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    
    // Skip if already has images
    if (emp.images.length > 0) {
      console.log(`${emp.user.name} already has ${emp.images.length} images, skipping.`);
      continue;
    }

    // Give each employee 2-3 images
    const startIdx = i % staffImages.length;
    const imgCount = 2 + (i % 2); // 2 or 3 images
    const selectedImages = [];
    for (let j = 0; j < imgCount; j++) {
      selectedImages.push(staffImages[(startIdx + j) % staffImages.length]);
    }

    for (let j = 0; j < selectedImages.length; j++) {
      await prisma.employeeImage.create({
        data: {
          employeeId: emp.id,
          url: selectedImages[j],
          sortOrder: j,
        },
      });
    }
    console.log(`Added ${selectedImages.length} images to ${emp.user.name}`);
  }

  console.log('Done!');
}

seedImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
