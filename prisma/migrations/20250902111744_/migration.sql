/*
  Warnings:

  - Added the required column `sellerId` to the `SellerPackage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "youwayapp"."SellerPackage" DROP CONSTRAINT "SellerPackage_sellerProfileId_fkey";

-- AlterTable
ALTER TABLE "youwayapp"."SellerPackage" ADD COLUMN     "sellerId" UUID NOT NULL,
ALTER COLUMN "sellerProfileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
