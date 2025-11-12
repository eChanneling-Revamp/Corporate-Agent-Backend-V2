require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate a random Sri Lankan NIC (old format: 9 digits + V)
function generateRandomNIC() {
  const year = Math.floor(Math.random() * 50) + 50; // 50-99 (1950-1999)
  const days = Math.floor(Math.random() * 365) + 1;
  const serial = Math.floor(Math.random() * 999) + 1;
  
  return `${year}${String(days).padStart(3, '0')}${String(serial).padStart(4, '0')}V`;
}

async function addNICsToExistingAppointments() {
  console.log('\n=== Adding Random NICs to Existing Appointments ===\n');

  try {
    // Get all appointments
    const appointments = await prisma.$queryRaw`SELECT id, "patientName", "patientNIC" FROM appointments`;
    
    console.log(`Found ${appointments.length} appointments to update\n`);

    let updated = 0;
    for (const apt of appointments) {
      if (!apt.patientNIC) {
        const randomNIC = generateRandomNIC();
        await prisma.$executeRaw`UPDATE appointments SET "patientNIC" = ${randomNIC} WHERE id = ${apt.id}`;
        console.log(`✅ Updated ${apt.patientName}: ${randomNIC}`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} appointments with random NICs`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addNICsToExistingAppointments().catch(console.error);
