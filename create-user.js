const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('🔧 Creating user: corporateagent@slt.lk');

    // Create user
    const hashedPassword = await bcrypt.hash('ABcd123#', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'corporateagent@slt.lk' },
      update: {
        password: hashedPassword,
        isActive: true,
      },
      create: {
        email: 'corporateagent@slt.lk',
        password: hashedPassword,
        role: 'AGENT',
        isActive: true,
      },
    });

    console.log('👤 User created/updated:', user.email);

    // Create agent profile
    const agent = await prisma.agent.upsert({
      where: { userId: user.id },
      update: {
        email: 'corporateagent@slt.lk',
        isActive: true,
      },
      create: {
        userId: user.id,
        name: 'SLT Corporate Agent',
        companyName: 'Sri Lanka Telecom Corporate Division',
        email: 'corporateagent@slt.lk',
        phone: '+94112123456',
        address: 'Lotus Road, Colombo 01',
        isActive: true,
      },
    });

    console.log('🏢 Agent profile created/updated:', agent.companyName);
    console.log('✅ User setup completed successfully!');
    console.log('📧 Email: corporateagent@slt.lk');
    console.log('🔑 Password: ABcd123#');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();