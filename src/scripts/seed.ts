import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@echannelling.com' },
    update: {},
    create: {
      email: 'admin@echannelling.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('👤 Created admin user:', admin.email);

  // Create sample corporate agent
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@corporate.com' },
    update: {},
    create: {
      email: 'agent@corporate.com',
      password: await bcrypt.hash('agent123', 12),
      role: 'AGENT',
      isActive: true,
    },
  });

  const agent = await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      name: 'John Smith',
      companyName: 'Corporate Health Solutions Ltd',
      phone: '+94771234567',
      address: '123 Business District, Colombo 03',
      registrationNumber: 'CHS001',
      contactPerson: 'John Smith',
      isActive: true,
    },
  });

  console.log('🏢 Created corporate agent:', agent.companyName);

  // Create sample doctors
  const doctors = [
    {
      name: 'Dr. Saman Perera',
      specialty: 'Cardiology',
      hospital: 'National Hospital of Sri Lanka',
      phone: '+94112345678',
      email: 'saman.perera@echannelling.com',
      consultationFee: 3000,
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        wednesday: ['09:00', '10:00', '11:00'],
        friday: ['14:00', '15:00', '16:00'],
      },
    },
    {
      name: 'Dr. Nimal Fernando',
      specialty: 'Dermatology',
      hospital: 'Colombo South Teaching Hospital',
      phone: '+94112345679',
      email: 'nimal.fernando@echannelling.com',
      consultationFee: 2500,
      availability: {
        monday: ['08:00', '09:00', '10:00'],
        wednesday: ['08:00', '09:00', '10:00', '14:00'],
        thursday: ['14:00', '15:00', '16:00'],
        saturday: ['08:00', '09:00', '10:00'],
      },
    },
    {
      name: 'Dr. Kamala Silva',
      specialty: 'Pediatrics',
      hospital: 'Lady Ridgeway Hospital',
      phone: '+94112345680',
      email: 'kamala.silva@echannelling.com',
      consultationFee: 2800,
      availability: {
        tuesday: ['09:00', '10:00', '11:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '15:00'],
        friday: ['09:00', '10:00', '11:00'],
        saturday: ['09:00', '10:00', '11:00'],
      },
    },
    {
      name: 'Dr. Rajesh Gupta',
      specialty: 'Orthopedic Surgery',
      hospital: 'Asiri Central Hospital',
      phone: '+94112345681',
      email: 'rajesh.gupta@echannelling.com',
      consultationFee: 4000,
      availability: {
        monday: ['15:00', '16:00', '17:00'],
        wednesday: ['15:00', '16:00', '17:00'],
        friday: ['15:00', '16:00', '17:00'],
      },
    },
  ];

  for (const doctorData of doctors) {
    const doctor = await prisma.doctor.upsert({
      where: { email: doctorData.email },
      update: {},
      create: doctorData,
    });
    console.log('👨‍⚕️ Created doctor:', doctor.name);
  }

  // Create sample appointments
  const sampleAppointments = [
    {
      agentId: agent.id,
      doctorId: (await prisma.doctor.findFirst({ where: { specialty: 'Cardiology' } }))!.id,
      patientName: 'Sunil Rathnayake',
      patientEmail: 'sunil.rathnayake@email.com',
      patientPhone: '+94771111111',
      date: new Date('2024-01-15'),
      timeSlot: '09:00',
      amount: 3000,
      status: 'CONFIRMED' as const,
    },
    {
      agentId: agent.id,
      doctorId: (await prisma.doctor.findFirst({ where: { specialty: 'Dermatology' } }))!.id,
      patientName: 'Mala Jayawardena',
      patientEmail: 'mala.jayawardena@email.com',
      patientPhone: '+94772222222',
      date: new Date('2024-01-16'),
      timeSlot: '10:00',
      amount: 2500,
      status: 'PENDING' as const,
    },
  ];

  for (const appointmentData of sampleAppointments) {
    const appointment = await prisma.appointment.create({
      data: appointmentData,
    });
    console.log('📅 Created appointment for:', appointment.patientName);
  }

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATABASE',
      entityType: 'SYSTEM',
      details: {
        message: 'Database seeded with initial data',
        timestamp: new Date(),
      },
    },
  });

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });