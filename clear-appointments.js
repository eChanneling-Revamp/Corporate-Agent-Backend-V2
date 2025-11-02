const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestAppointments() {
  try {
    console.log('🧹 Clearing existing appointments for testing...');

    // Delete appointments for the specific date/time you're trying to book
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        date: new Date('2025-11-03'),
        timeSlot: '12:00 PM'
      }
    });

    console.log(`✅ Deleted ${deletedAppointments.count} conflicting appointments`);
    console.log('📅 Time slot 2025-11-03 at 12:00 PM is now available');

  } catch (error) {
    console.error('❌ Error clearing appointments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestAppointments();