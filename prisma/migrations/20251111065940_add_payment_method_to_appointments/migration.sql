-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'BILL_TO_PHONE';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "paymentMethod" "PaymentMethod" DEFAULT 'CARD';
