const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating demo user for corporateagent@slt.lk...\n');

  try {
    // Hash the password: ABcd123#
    const hashedPassword = await bcrypt.hash('ABcd123#', 12);
    console.log('✓ Password hashed successfully');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'corporateagent@slt.lk' },
      include: { agent: true }
    });

    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating password...');
      
      // Update user password
      await prisma.user.update({
        where: { email: 'corporateagent@slt.lk' },
        data: {
          password: hashedPassword,
          name: 'SLT Corporate Agent',
          isActive: true,
        },
      });

      console.log('✓ Password updated successfully');
      console.log('\n✅ Demo user ready!');
      console.log('   Email: corporateagent@slt.lk');
      console.log('   Password: ABcd123#');
      
      if (existingUser.agent) {
        console.log(`   Agent Name: ${existingUser.agent.name}`);
        console.log(`   Company: ${existingUser.agent.companyName || 'N/A'}`);
      }
    } else {
      console.log('\n📝 Creating new user...');
      
      // Create user and agent in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: 'corporateagent@slt.lk',
            password: hashedPassword,
            name: 'SLT Corporate Agent',
            role: 'AGENT',
            isActive: true,
          },
        });
        console.log('✓ User created');

        // Create agent profile
        const agent = await tx.agent.create({
          data: {
            userId: user.id,
            name: 'SLT Corporate Agent',
            companyName: 'Sri Lanka Telecom',
            email: 'corporateagent@slt.lk',
            phone: '+94112345000',
            address: 'Lotus Road, Colombo 01',
            isActive: true,
          },
        });
        console.log('✓ Agent profile created');

        return { user, agent };
      });

      console.log('\n✅ Demo user created successfully!');
      console.log('   Email: corporateagent@slt.lk');
      console.log('   Password: ABcd123#');
      console.log(`   Agent ID: ${result.agent.id}`);
      console.log(`   Agent Name: ${result.agent.name}`);
      console.log(`   Company: ${result.agent.companyName}`);
    }

    // Count total users
    const userCount = await prisma.user.count();
    const agentCount = await prisma.agent.count();
    console.log(`\n📊 Database Status:`);
    console.log(`   Total Users: ${userCount}`);
    console.log(`   Total Agents: ${agentCount}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
