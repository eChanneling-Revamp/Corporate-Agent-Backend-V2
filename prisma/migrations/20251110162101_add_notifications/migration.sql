-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_RECEIVED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "appointmentId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_agentId_isRead_idx" ON "notifications"("agentId", "isRead");
