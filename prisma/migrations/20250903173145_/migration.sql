/*
  Warnings:

  - You are about to drop the column `startTime` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "youwayapp"."OrderItem_startTime_idx";

-- AlterTable
ALTER TABLE "youwayapp"."OrderItem" DROP COLUMN "startTime",
ADD COLUMN     "hour" TEXT;
