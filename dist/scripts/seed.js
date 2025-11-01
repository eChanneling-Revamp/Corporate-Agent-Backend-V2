"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create admin user
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
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
            password: await bcryptjs_1.default.hash('agent123', 12),
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
            email: 'agent@corporate.com',
            phone: '+94771234567',
            address: '123 Business District, Colombo 03',
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
            rating: 4.8,
            description: 'Experienced cardiologist with 15+ years of practice',
            availableDates: {
                monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
                tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
                wednesday: ['09:00', '10:00', '11:00'],
                friday: ['14:00', '15:00', '16:00'],
            },
            isActive: true,
        },
        {
            name: 'Dr. Nimal Fernando',
            specialty: 'Dermatology',
            hospital: 'Colombo South Teaching Hospital',
            phone: '+94112345679',
            email: 'nimal.fernando@echannelling.com',
            consultationFee: 2500,
            rating: 4.6,
            description: 'Specialist in skin conditions and cosmetic treatments',
            availableDates: {
                monday: ['08:00', '09:00', '10:00'],
                wednesday: ['08:00', '09:00', '10:00', '14:00'],
                thursday: ['14:00', '15:00', '16:00'],
                saturday: ['08:00', '09:00', '10:00'],
            },
            isActive: true,
        },
        {
            name: 'Dr. Kamala Silva',
            specialty: 'Pediatrics',
            hospital: 'Lady Ridgeway Hospital',
            phone: '+94112345680',
            email: 'kamala.silva@echannelling.com',
            consultationFee: 2800,
            rating: 4.9,
            description: 'Pediatric specialist focusing on child healthcare',
            availableDates: {
                tuesday: ['09:00', '10:00', '11:00', '15:00'],
                thursday: ['09:00', '10:00', '11:00', '15:00'],
                friday: ['09:00', '10:00', '11:00'],
                saturday: ['09:00', '10:00', '11:00'],
            },
            isActive: true,
        },
        {
            name: 'Dr. Rajesh Gupta',
            specialty: 'Orthopedic Surgery',
            hospital: 'Asiri Central Hospital',
            phone: '+94112345681',
            email: 'rajesh.gupta@echannelling.com',
            consultationFee: 4000,
            rating: 4.7,
            description: 'Orthopedic surgeon specializing in joint replacements',
            availableDates: {
                monday: ['15:00', '16:00', '17:00'],
                wednesday: ['15:00', '16:00', '17:00'],
                friday: ['15:00', '16:00', '17:00'],
            },
            isActive: true,
        },
    ];
    for (const doctorData of doctors) {
        const existingDoctor = await prisma.doctor.findFirst({
            where: { email: doctorData.email },
        });
        if (!existingDoctor) {
            const doctor = await prisma.doctor.create({
                data: doctorData,
            });
            console.log('👨‍⚕️ Created doctor:', doctor.name);
        }
        else {
            console.log('👨‍⚕️ Doctor already exists:', existingDoctor.name);
        }
    }
    // Create sample appointments
    const sampleAppointments = [
        {
            agentId: agent.id,
            doctorId: (await prisma.doctor.findFirst({ where: { specialty: 'Cardiology' } })).id,
            patientName: 'Sunil Rathnayake',
            patientEmail: 'sunil.rathnayake@email.com',
            patientPhone: '+94771111111',
            date: new Date('2024-01-15'),
            timeSlot: '09:00',
            amount: 3000,
            status: 'CONFIRMED',
        },
        {
            agentId: agent.id,
            doctorId: (await prisma.doctor.findFirst({ where: { specialty: 'Dermatology' } })).id,
            patientName: 'Mala Jayawardena',
            patientEmail: 'mala.jayawardena@email.com',
            patientPhone: '+94772222222',
            date: new Date('2024-01-16'),
            timeSlot: '10:00',
            amount: 2500,
            status: 'PENDING',
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
            entity: 'SYSTEM',
            newData: {
                message: 'Database seeded with initial data',
                timestamp: new Date(),
                recordsCreated: {
                    users: 2,
                    agents: 1,
                    doctors: 4,
                    appointments: 2,
                },
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
//# sourceMappingURL=seed.js.map