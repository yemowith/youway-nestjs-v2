/*
  Warnings:

  - You are about to drop the column `price` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PackagePrice` table. All the data in the column will be lost.
  - Added the required column `priceMax` to the `PackagePrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceMin` to the `PackagePrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "youwayapp"."Package" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "youwayapp"."PackagePrice" DROP COLUMN "price",
ADD COLUMN     "priceMax" DECIMAL(10,6) NOT NULL,
ADD COLUMN     "priceMin" DECIMAL(10,6) NOT NULL;

-- CreateTable
CREATE TABLE "youwayapp"."SellerPackage" (
    "id" UUID NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "price" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPackage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "youwayapp"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
