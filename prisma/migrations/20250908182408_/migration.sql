/*
  Warnings:

  - Added the required column `packageId` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percent` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "youwayapp"."Commission" ADD COLUMN     "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
ADD COLUMN     "packageId" UUID NOT NULL,
ADD COLUMN     "percent" DECIMAL(10,6) NOT NULL;

-- AddForeignKey
ALTER TABLE "youwayapp"."Commission" ADD CONSTRAINT "Commission_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Commission" ADD CONSTRAINT "Commission_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "youwayapp"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
