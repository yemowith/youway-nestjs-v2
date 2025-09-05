/*
  Warnings:

  - A unique constraint covering the columns `[sellerId,packageId]` on the table `SellerPackage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SellerPackage_sellerId_packageId_key" ON "youwayapp"."SellerPackage"("sellerId", "packageId");
