require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updatePassword() {
  console.log('\n=== Updating Password for corporateagent@slt.lk ===\n');

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'corporateagent@slt.lk' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    const newPassword = 'ABcd123#';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: 'corporateagent@slt.lk' },
      data: { password: hashedPassword }
    });

    console.log('✅ Password updated successfully!');
    console.log('   Email: corporateagent@slt.lk');
    console.log('   Password: ABcd123#');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword().catch(console.error);
