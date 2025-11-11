const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgent() {
  try {
    // The agentId from the logs is 93ab7c6b-1f99-4f8a-aec0-1a150c2aed81
    const agentId = '93ab7c6b-1f99-4f8a-aec0-1a150c2aed81';
    
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true }
    });
    
    console.log('\n=== Agent Info ===');
    console.log('Name:', agent?.name);
    console.log('Email:', agent?.email);
    console.log('User Email:', agent?.user?.email);
    
    // Count appointments for this agent
    const totalAppts = await prisma.appointment.count({
      where: { agentId: agentId }
    });
    
    console.log('\n=== Appointments for this agent ===');
    console.log('Total:', totalAppts);
    
    // Count in date range Oct 11 - Nov 11, 2025
    const oct11 = new Date('2025-10-11T00:00:00.000Z');
    const nov11 = new Date('2025-11-11T23:59:59.999Z');
    
    const inRange = await prisma.appointment.count({
      where: {
        agentId: agentId,
        date: {
          gte: oct11,
          lte: nov11
        }
      }
    });
    
    console.log('In range (Oct 11 - Nov 11):', inRange);
    
    // Show some sample appointments
    const samples = await prisma.appointment.findMany({
      where: {
        agentId: agentId,
        date: {
          gte: oct11,
          lte: nov11
        }
      },
      take: 5,
      orderBy: { date: 'desc' },
      select: { date: true, patientName: true, status: true, amount: true }
    });
    
    console.log('\n=== Sample appointments in range ===');
    samples.forEach(apt => {
      console.log(`- ${apt.patientName}: ${apt.date.toISOString().split('T')[0]}, ${apt.status}, Rs. ${apt.amount}`);
    });
    
    // Also check: Are there other agents?
    const allAgents = await prisma.agent.findMany({
      select: { id: true, name: true, email: true, _count: { select: { appointments: true } } }
    });
    
    console.log('\n=== All Agents in Database ===');
    allAgents.forEach(a => {
      console.log(`- ${a.name} (${a.email}): ${a._count.appointments} appointments`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgent();
