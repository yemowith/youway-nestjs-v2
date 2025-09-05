/*
  Warnings:

  - You are about to drop the `CustomSellerAvailability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "youwayapp"."CustomSellerAvailability" DROP CONSTRAINT "CustomSellerAvailability_userId_fkey";

-- DropTable
DROP TABLE "youwayapp"."CustomSellerAvailability";

-- CreateTable
CREATE TABLE "youwayapp"."SellerUnavailability" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTime" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerUnavailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerUnavailability" ADD CONSTRAINT "SellerUnavailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
