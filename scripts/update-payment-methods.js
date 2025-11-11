require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePaymentMethods() {
  console.log('\n=== Updating Payment Methods to New Values ===\n');

  try {
    // Update all CARD payments to BILL_TO_PHONE
    const updatedAppointments = await prisma.$executeRaw`
      UPDATE appointments 
      SET "paymentMethod" = 'BILL_TO_PHONE' 
      WHERE "paymentMethod" IN ('CARD', 'BANK_TRANSFER', 'CASH', 'WALLET')
    `;
    
    const updatedPayments = await prisma.$executeRaw`
      UPDATE payments 
      SET method = 'BILL_TO_PHONE' 
      WHERE method IN ('CARD', 'BANK_TRANSFER', 'CASH', 'WALLET')
    `;

    console.log(`✅ Updated ${updatedAppointments} appointments`);
    console.log(`✅ Updated ${updatedPayments} payments`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentMethods().catch(console.error);
