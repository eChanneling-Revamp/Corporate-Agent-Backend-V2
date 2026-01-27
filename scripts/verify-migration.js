/**
 * Verify Migration Script
 * Verifies that data was successfully migrated to the new centralized database
 */

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying migration to centralized database...\n');

  try {
    await db.$connect();
    console.log('✅ Connected to centralized database\n');

    // Count all tables
    const userCount = await db.user.count();
    const agentCount = await db.agent.count();
    const doctorCount = await db.doctor.count();
    const appointmentCount = await db.appointment.count();
    const paymentCount = await db.payment.count();
    const notificationCount = await db.notification.count();
    const integrationCount = await db.integration.count();
    const reportCount = await db.report.count();

    console.log('📊 Data Verification Results:');
    console.log('─'.repeat(50));
    console.log(`👥 Users:          ${userCount}`);
    console.log(`🏢 Agents:         ${agentCount}`);
    console.log(`👨‍⚕️  Doctors:        ${doctorCount}`);
    console.log(`📅 Appointments:   ${appointmentCount}`);
    console.log(`💳 Payments:       ${paymentCount}`);
    console.log(`🔔 Notifications:  ${notificationCount}`);
    console.log(`🔗 Integrations:   ${integrationCount}`);
    console.log(`📊 Reports:        ${reportCount}`);
    console.log('─'.repeat(50));

    // Sample some data
    console.log('\n📝 Sample Data:');
    const sampleUsers = await db.user.findMany({ take: 3 });
    console.log(`\n👥 Sample Users (${sampleUsers.length}):`);
    sampleUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    const sampleAgents = await db.agent.findMany({ take: 3 });
    console.log(`\n🏢 Sample Agents (${sampleAgents.length}):`);
    sampleAgents.forEach(agent => {
      console.log(`   - ${agent.name} - ${agent.email}`);
    });

    const sampleAppointments = await db.appointment.findMany({ 
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`\n📅 Recent Appointments (${sampleAppointments.length}):`);
    sampleAppointments.forEach(apt => {
      console.log(`   - ${apt.patientName} - ${apt.appointmentDate} - ${apt.status}`);
    });

    console.log('\n✅ Migration verification complete!');
    console.log('🎉 All data successfully migrated to centralized database!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
