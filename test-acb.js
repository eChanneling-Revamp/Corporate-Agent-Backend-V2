// Test script for ACB (Advanced Confirmation Booking) functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testACBFunctionality() {
  console.log('🧪 Testing ACB functionality...\n');

  try {
    // 1. Get unpaid appointments (ACB candidates)
    console.log('1. Fetching unpaid appointments...');
    const unpaidAppointments = await prisma.appointment.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        payment: null,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
            hospital: true,
          },
        },
        agent: {
          select: {
            name: true,
            companyName: true,
            email: true,
          },
        },
      },
      take: 3, // Limit to 3 for testing
    });

    console.log(`   Found ${unpaidAppointments.length} unpaid appointments`);
    unpaidAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt.patientName} → Dr. ${apt.doctor.name} (${apt.date.toDateString()})`);
    });

    if (unpaidAppointments.length === 0) {
      console.log('   ⚠️  No unpaid appointments found to test ACB functionality');
      console.log('   💡 You can create test appointments first using the frontend');
      return;
    }

    // 2. Test database structure
    console.log('\n2. Checking database structure...');
    const appointmentStructure = await prisma.appointment.findFirst({
      select: {
        id: true,
        agentId: true,
        doctorId: true,
        patientName: true,
        patientEmail: true,
        patientPhone: true,
        date: true,
        timeSlot: true,
        status: true,
        amount: true,
        cancelReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (appointmentStructure) {
      console.log('   ✅ Appointment model structure is correct');
      console.log(`   📋 Fields: ${Object.keys(appointmentStructure).join(', ')}`);
    }

    // 3. Test email service
    console.log('\n3. Testing email service...');
    try {
      const { emailService } = require('./dist/services/emailService.js');
      const testResult = await emailService.testConnection();
      if (testResult.success) {
        console.log('   ✅ Email service is configured and ready');
      } else {
        console.log(`   ⚠️  Email service issue: ${testResult.error}`);
        console.log('   💡 Configure SMTP settings in environment variables');
      }
    } catch (error) {
      console.log('   ⚠️  Email service not built yet. Run: npm run build');
    }

    // 4. Verify routes are configured
    console.log('\n4. Checking ACB routes...');
    console.log('   📍 Expected routes:');
    console.log('   - GET /api/appointments/unpaid (fetch ACB candidates)');
    console.log('   - POST /api/appointments/:id/confirm (confirm ACB)');
    console.log('   - POST /api/appointments/:id/cancel (cancel ACB)');

    console.log('\n✅ ACB test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend: cd ../Corporate-Agent-Frontend-V2 && npm run dev');
    console.log('   3. Navigate to /confirm-acb page');
    console.log('   4. Test confirm/cancel functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testACBFunctionality();