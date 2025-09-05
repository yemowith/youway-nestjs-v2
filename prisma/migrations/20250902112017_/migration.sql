/*
  Warnings:

  - You are about to drop the column `sellerProfileId` on the `SellerPackage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "youwayapp"."SellerPackage" DROP CONSTRAINT "SellerPackage_sellerProfileId_fkey";

-- AlterTable
ALTER TABLE "youwayapp"."SellerPackage" DROP COLUMN "sellerProfileId";
