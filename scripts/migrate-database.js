/**
 * Database Migration Script
 * Migrates data from old NeonDB to centralized NeonDB
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const OLD_DB_URL = 'postgresql://neondb_owner:npg_Oc3jv9SIHGnf@ep-blue-pine-a84ccjv8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';
const NEW_DB_URL = 'postgresql://neondb_owner:npg_hS4GMgiPZA5F@ep-billowing-bush-a880wp07-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: OLD_DB_URL,
    },
  },
});

const newDb = new PrismaClient({
  datasources: {
    db: {
      url: NEW_DB_URL,
    },
  },
});

async function deploySchema() {
  console.log('📋 Deploying schema to new database...');
  try {
    execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
      env: { ...process.env, DATABASE_URL: NEW_DB_URL },
      stdio: 'inherit'
    });
    console.log('✅ Schema deployed successfully\n');
  } catch (error) {
    console.error('❌ Failed to deploy schema:', error.message);
    throw error;
  }
}

async function migrateData() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Step 1: Deploy schema to new database
    await deploySchema();

    // Step 1: Deploy schema to new database
    await deploySchema();
    
    // Step 2: Test connections
    console.log('📡 Testing database connections...');
    await oldDb.$connect();
    console.log('✅ Connected to OLD database');
    
    await newDb.$connect();
    console.log('✅ Connected to NEW centralized database\n');

    // Migrate Users
    console.log('👥 Migrating Users...');
    const users = await oldDb.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      await newDb.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // Migrate Agents
    console.log('🏢 Migrating Agents...');
    const agents = await oldDb.agent.findMany();
    console.log(`Found ${agents.length} agents to migrate`);
    
    for (const agent of agents) {
      await newDb.agent.upsert({
        where: { id: agent.id },
        update: agent,
        create: agent,
      });
    }
    console.log(`✅ Migrated ${agents.length} agents\n`);

    // Migrate Doctors
    console.log('👨‍⚕️ Migrating Doctors...');
    const doctors = await oldDb.doctor.findMany();
    console.log(`Found ${doctors.length} doctors to migrate`);
    
    for (const doctor of doctors) {
      await newDb.doctor.upsert({
        where: { id: doctor.id },
        update: doctor,
        create: doctor,
      });
    }
    console.log(`✅ Migrated ${doctors.length} doctors\n`);

    // Migrate Payments BEFORE Appointments (foreign key dependency)
    console.log('💰 Migrating Payments...');
    const payments = await oldDb.payment.findMany();
    console.log(`Found ${payments.length} payments to migrate`);
    
    for (const payment of payments) {
      await newDb.payment.upsert({
        where: { id: payment.id },
        update: payment,
        create: payment,
      });
    }
    console.log(`✅ Migrated ${payments.length} payments\n`);

    // Migrate Appointments (depends on Payments)
    console.log('📅 Migrating Appointments...');
    const appointments = await oldDb.appointment.findMany();
    console.log(`Found ${appointments.length} appointments to migrate`);
    
    for (const appointment of appointments) {
      await newDb.appointment.upsert({
        where: { id: appointment.id },
        update: appointment,
        create: appointment,
      });
    }
    console.log(`✅ Migrated ${appointments.length} appointments\n`);

    // Migrate Notifications
    console.log('🔔 Migrating Notifications...');
    const notifications = await oldDb.notification.findMany();
    console.log(`Found ${notifications.length} notifications to migrate`);
    
    for (const notification of notifications) {
      await newDb.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification,
      });
    }
    console.log(`✅ Migrated ${notifications.length} notifications\n`);

    // Migrate Integrations
    console.log('🔗 Migrating Integrations...');
    const integrations = await oldDb.integration.findMany();
    console.log(`Found ${integrations.length} integrations to migrate`);
    
    for (const integration of integrations) {
      await newDb.integration.upsert({
        where: { id: integration.id },
        update: integration,
        create: integration,
      });
    }
    console.log(`✅ Migrated ${integrations.length} integrations\n`);

    // Migrate Reports
    console.log('📊 Migrating Reports...');
    const reports = await oldDb.report.findMany();
    console.log(`Found ${reports.length} reports to migrate`);
    
    for (const report of reports) {
      await newDb.report.upsert({
        where: { id: report.id },
        update: report,
        create: report,
      });
    }
    console.log(`✅ Migrated ${reports.length} reports\n`);

    // Migrate Corporate tables if they exist
    try {
      console.log('🏢 Migrating Corporate Agents...');
      const corporateAgents = await oldDb.corporateAgent.findMany();
      console.log(`Found ${corporateAgents.length} corporate agents to migrate`);
      
      for (const agent of corporateAgents) {
        await newDb.corporateAgent.upsert({
          where: { id: agent.id },
          update: agent,
          create: agent,
        });
      }
      console.log(`✅ Migrated ${corporateAgents.length} corporate agents\n`);

      console.log('🏢 Migrating Corporate Bookings...');
      const corporateBookings = await oldDb.corporateBooking.findMany();
      console.log(`Found ${corporateBookings.length} corporate bookings to migrate`);
      
      for (const booking of corporateBookings) {
        await newDb.corporateBooking.upsert({
          where: { id: booking.id },
          update: booking,
          create: booking,
        });
      }
      console.log(`✅ Migrated ${corporateBookings.length} corporate bookings\n`);

      console.log('🏢 Migrating Corporate Employees...');
      const corporateEmployees = await oldDb.corporateEmployee.findMany();
      console.log(`Found ${corporateEmployees.length} corporate employees to migrate`);
      
      for (const employee of corporateEmployees) {
        await newDb.corporateEmployee.upsert({
          where: { id: employee.id },
          update: employee,
          create: employee,
        });
      }
      console.log(`✅ Migrated ${corporateEmployees.length} corporate employees\n`);
    } catch (error) {
      console.log('⚠️  Corporate tables not found or already migrated');
    }

    console.log('✨ Database migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Agents: ${agents.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Payments: ${payments.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log(`   Integrations: ${integrations.length}`);
    console.log(`   Reports: ${reports.length}`);
    console.log('\n✅ You can now update your .env file to use the new database URL');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

migrateData()
  .then(() => {
    console.log('\n🎉 Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
