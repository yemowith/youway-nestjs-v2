/*
  Warnings:

  - You are about to drop the column `packageId` on the `Commission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,appointmentId]` on the table `Commission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentId` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "youwayapp"."Commission" DROP CONSTRAINT "Commission_packageId_fkey";

-- AlterTable
ALTER TABLE "youwayapp"."Commission" DROP COLUMN "packageId",
ADD COLUMN     "appointmentId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Commission_userId_appointmentId_key" ON "youwayapp"."Commission"("userId", "appointmentId");

-- AddForeignKey
ALTER TABLE "youwayapp"."Commission" ADD CONSTRAINT "Commission_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "youwayapp"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
