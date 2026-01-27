/**
 * Quick Database Connection Test
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing connection to centralized database...\n');
    
    await prisma.$connect();
    console.log('✅ Successfully connected to centralized NeonDB!');
    
    const userCount = await prisma.user.count();
    const agentCount = await prisma.agent.count();
    
    console.log(`\n📊 Quick Stats:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Agents: ${agentCount}`);
    
    console.log('\n✅ Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
