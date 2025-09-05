-- DropForeignKey
ALTER TABLE "youwayapp"."SellerPackage" DROP CONSTRAINT "SellerPackage_packageId_fkey";

-- DropForeignKey
ALTER TABLE "youwayapp"."SellerPackage" DROP CONSTRAINT "SellerPackage_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "youwayapp"."SellerSetting" DROP CONSTRAINT "SellerSetting_sellerId_fkey";

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "youwayapp"."Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerSetting" ADD CONSTRAINT "SellerSetting_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
