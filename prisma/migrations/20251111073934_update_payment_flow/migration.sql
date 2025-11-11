/*
  Warnings:

  - The values [CARD,BANK_TRANSFER,CASH,WALLET] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `paymentMethod` on table `appointments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('BILL_TO_PHONE', 'DEDUCT_FROM_SALARY');
ALTER TABLE "appointments" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "appointments" ALTER COLUMN "paymentMethod" SET DEFAULT 'BILL_TO_PHONE';
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'BILL_TO_PHONE';
COMMIT;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "employeeNIC" TEXT,
ADD COLUMN     "patientNIC" TEXT,
ADD COLUMN     "sltPhoneNumber" TEXT,
ALTER COLUMN "paymentMethod" SET NOT NULL,
ALTER COLUMN "paymentMethod" SET DEFAULT 'BILL_TO_PHONE';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'BILL_TO_PHONE';
