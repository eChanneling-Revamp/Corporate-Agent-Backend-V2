const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    // Find the demo agent
    const agent = await prisma.agent.findFirst({
      where: {
        user: {
          email: 'corporateagent@slt.lk'
        }
      },
      include: {
        user: true
      }
    });

    if (!agent) {
      console.log('Agent not found');
      return;
    }

    console.log('Agent found:');
    console.log('  ID:', agent.id);
    console.log('  User ID:', agent.userId);
    console.log('  Company:', agent.companyName);
    console.log('  Email:', agent.user.email);
    console.log('');

    // Get all notifications for this user
    const notifications = await prisma.notifications.findMany({
      where: {
        userId: agent.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Total notifications:', notifications.length);
    console.log('');

    if (notifications.length > 0) {
      console.log('Notifications:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Read: ${notif.isRead}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log('');
      });

      const unreadCount = notifications.filter(n => !n.isRead).length;
      console.log(`Unread notifications: ${unreadCount}`);
    } else {
      console.log('No notifications found');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
