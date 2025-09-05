/*
  Warnings:

  - You are about to drop the column `userId` on the `SellerAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SellerSetting` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SellerUnavailability` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sellerId,dayOfWeek]` on the table `SellerAvailability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sellerId]` on the table `SellerSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerId` to the `SellerAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `SellerSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `SellerUnavailability` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "youwayapp"."SellerAvailability" DROP CONSTRAINT "SellerAvailability_userId_fkey";

-- DropForeignKey
ALTER TABLE "youwayapp"."SellerSetting" DROP CONSTRAINT "SellerSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "youwayapp"."SellerUnavailability" DROP CONSTRAINT "SellerUnavailability_userId_fkey";

-- DropIndex
DROP INDEX "youwayapp"."SellerAvailability_userId_dayOfWeek_key";

-- DropIndex
DROP INDEX "youwayapp"."SellerAvailability_userId_idx";

-- DropIndex
DROP INDEX "youwayapp"."SellerSetting_userId_idx";

-- DropIndex
DROP INDEX "youwayapp"."SellerSetting_userId_key";

-- AlterTable
ALTER TABLE "youwayapp"."SellerAvailability" DROP COLUMN "userId",
ADD COLUMN     "sellerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "youwayapp"."SellerSetting" DROP COLUMN "userId",
ADD COLUMN     "sellerId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "youwayapp"."SellerUnavailability" DROP COLUMN "userId",
ADD COLUMN     "sellerId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "SellerAvailability_sellerId_idx" ON "youwayapp"."SellerAvailability"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerAvailability_sellerId_dayOfWeek_key" ON "youwayapp"."SellerAvailability"("sellerId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "SellerSetting_sellerId_idx" ON "youwayapp"."SellerSetting"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerSetting_sellerId_key" ON "youwayapp"."SellerSetting"("sellerId");

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerAvailability" ADD CONSTRAINT "SellerAvailability_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerUnavailability" ADD CONSTRAINT "SellerUnavailability_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerSetting" ADD CONSTRAINT "SellerSetting_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
