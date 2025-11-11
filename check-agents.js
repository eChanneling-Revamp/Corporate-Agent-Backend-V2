const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgents() {
  try {
    const agents = await prisma.agent.findMany({
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\n=== AGENTS IN DATABASE ===');
    console.log(`Total agents found: ${agents.length}\n`);
    
    agents.forEach((agent, index) => {
      console.log(`Agent ${index + 1}:`);
      console.log(`  ID: ${agent.id}`);
      console.log(`  Name: ${agent.name}`);
      console.log(`  Company: ${agent.companyName}`);
      console.log(`  Email: ${agent.email}`);
      console.log(`  Phone: ${agent.phone}`);
      console.log(`  Created: ${agent.createdAt}`);
      console.log('');
    });
    
    // Test what findFirst returns
    const firstAgent = await prisma.agent.findFirst();
    console.log('=== WHAT findFirst() RETURNS ===');
    console.log(`Name: ${firstAgent.name}`);
    console.log(`Company: ${firstAgent.companyName}`);
    console.log('');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgents();
