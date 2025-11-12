require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createSLTAgent() {
  console.log('\n=== Creating corporateagent@slt.lk User ===\n');

  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: 'corporateagent@slt.lk' }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('slt123', 12);
      user = await prisma.user.create({
        data: {
          email: 'corporateagent@slt.lk',
          password: hashedPassword,
          role: 'AGENT',
          isActive: true
        }
      });
      console.log('✅ Created user:', user.email);
    } else {
      console.log('✅ User already exists:', user.email);
    }

    // Check if agent exists
    let agent = await prisma.agent.findUnique({
      where: { userId: user.id }
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          userId: user.id,
          name: 'SLT Corporate Agent',
          companyName: 'Sri Lanka Telecom',
          email: 'corporateagent@slt.lk',
          phone: '+94112121212',
          address: 'SLT Head Office, Colombo',
          isActive: true
        }
      });
      console.log('✅ Created agent:', agent.companyName);
    } else {
      console.log('✅ Agent already exists:', agent.companyName);
    }

    console.log('\n✅ SLT Agent setup complete!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Agent ID: ${agent.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSLTAgent().catch(console.error);
