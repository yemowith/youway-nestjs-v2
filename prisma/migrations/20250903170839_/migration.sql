/*
  Warnings:

  - Added the required column `packageId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "youwayapp"."OrderItem" ADD COLUMN     "packageId" UUID NOT NULL;
