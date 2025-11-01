const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addCorporateUser() {
  console.log('🔐 Adding corporate user...');

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('ABcd123#', 12);
    
    // Create the user
    const user = await prisma.user.upsert({
      where: { email: 'corporateagent@slt.lk' },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        email: 'corporateagent@slt.lk',
        password: hashedPassword,
        role: 'AGENT',
        isActive: true,
      },
    });

    console.log('👤 User created/updated:', user.email);

    // Create the agent profile
    const agent = await prisma.agent.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: 'SLT Corporate Agent',
        companyName: 'Sri Lanka Telecom Corporate',
        email: 'corporateagent@slt.lk',
        phone: '+94112345567',
        address: 'Lotus Road, Colombo 01',
        isActive: true,
      },
    });

    console.log('🏢 Agent profile created:', agent.companyName);
    console.log('✅ Corporate user setup completed!');
    console.log('📧 Email: corporateagent@slt.lk');
    console.log('🔑 Password: ABcd123#');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCorporateUser();