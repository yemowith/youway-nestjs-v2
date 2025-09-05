-- CreateEnum
CREATE TYPE "youwayapp"."AppointmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "youwayapp"."SellerPackage" ADD COLUMN     "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY';

-- CreateTable
CREATE TABLE "youwayapp"."Appointment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTime" TIMESTAMPTZ(3) NOT NULL,
    "status" "youwayapp"."AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."DefaultAvailability" (
    "id" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."SellerAvailability" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerAvailability_userId_idx" ON "youwayapp"."SellerAvailability"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerAvailability_userId_dayOfWeek_key" ON "youwayapp"."SellerAvailability"("userId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerPackage" ADD CONSTRAINT "SellerPackage_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Appointment" ADD CONSTRAINT "Appointment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Appointment" ADD CONSTRAINT "Appointment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "youwayapp"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerAvailability" ADD CONSTRAINT "SellerAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
