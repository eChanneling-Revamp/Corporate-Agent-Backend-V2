const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Creating sample doctors...\n');

  try {
    // Define the doctors from the frontend
    const doctors = [
      {
        name: 'Dr. Saman Perera',
        email: 'saman.perera@hospital.lk',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        phonenumber: '+94112345001',
        consultationFee: 3000,
        rating: 4.8,
        description: 'Experienced cardiologist with over 15 years of practice specializing in heart conditions and cardiovascular health.',
        languages: ['English', 'Sinhala'],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
        isActive: true,
        status: 'APPROVED',
      },
      {
        name: 'Dr. Nimal Fernando',
        email: 'nimal.fernando@hospital.lk',
        specialization: 'Neurology',
        qualification: 'MBBS, MD (Neurology)',
        experience: 18,
        phonenumber: '+94112345002',
        consultationFee: 3500,
        rating: 4.9,
        description: 'Board-certified neurologist specializing in brain and nervous system disorders with advanced training in neuromuscular diseases.',
        languages: ['English', 'Sinhala', 'Tamil'],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        isActive: true,
        status: 'APPROVED',
      },
      {
        name: 'Dr. Kamala Silva',
        email: 'kamala.silva@hospital.lk',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 12,
        phonenumber: '+94112345003',
        consultationFee: 2800,
        rating: 4.7,
        description: 'Orthopedic surgeon specializing in joint replacements, sports injuries, and musculoskeletal conditions.',
        languages: ['English', 'Sinhala', 'Tamil'],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        isActive: true,
        status: 'APPROVED',
      },
      {
        name: 'Dr. Rajesh Gunawardena',
        email: 'rajesh.gunawardena@hospital.lk',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 10,
        phonenumber: '+94112345004',
        consultationFee: 2500,
        rating: 4.6,
        description: 'Pediatric specialist focusing on child healthcare, vaccinations, and developmental assessments.',
        languages: ['English', 'Sinhala', 'Tamil'],
        availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
        isActive: true,
        status: 'APPROVED',
      },
      {
        name: 'Dr. Priya Wickramasinghe',
        email: 'priya.wickramasinghe@hospital.lk',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 14,
        phonenumber: '+94112345005',
        consultationFee: 2700,
        rating: 4.5,
        description: 'Dermatologist specializing in skin conditions, cosmetic treatments, and laser therapy.',
        languages: ['English', 'Sinhala'],
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
        isActive: true,
        status: 'APPROVED',
      },
      {
        name: 'Dr. Anura Jayasinghe',
        email: 'anura.jayasinghe@hospital.lk',
        specialization: 'General Surgery',
        qualification: 'MBBS, MS (General Surgery)',
        experience: 20,
        phonenumber: '+94112345006',
        consultationFee: 4000,
        rating: 4.9,
        description: 'Senior general surgeon with expertise in minimally invasive and laparoscopic surgical procedures.',
        languages: ['English', 'Sinhala', 'Tamil'],
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        isActive: true,
        status: 'APPROVED',
      },
    ];

    // Create each doctor
    for (const doctorData of doctors) {
      // Check if doctor already exists
      const existingDoctor = await prisma.doctor.findFirst({
        where: { email: doctorData.email },
      });

      if (existingDoctor) {
        console.log(`⚠️  Doctor already exists: ${doctorData.name}`);
        continue;
      }

      const doctor = await prisma.doctor.create({
        data: doctorData,
      });

      console.log(`✓ Created: ${doctor.name}`);
      console.log(`  Specialization: ${doctor.specialization}`);
      console.log(`  Qualification: ${doctor.qualification}`);
      console.log(`  Fee: Rs. ${doctor.consultationFee.toLocaleString()}`);
      console.log(`  Rating: ${doctor.rating}/5.0`);
      console.log('');
    }

    // Show final stats
    const totalDoctors = await prisma.doctor.count();
    console.log(`\n📊 Total Doctors in Database: ${totalDoctors}`);

    // List all doctors
    const allDoctors = await prisma.doctor.findMany({
      select: {
        name: true,
        specialization: true,
        consultationFee: true,
        isActive: true,
      },
    });

    console.log('\n📋 Current Doctors:');
    allDoctors.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.name} - ${doc.specialization} (Rs. ${doc.consultationFee})`);
    });

    console.log('\n✅ Sample doctors created successfully!');

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
