/*
  Warnings:

  - You are about to drop the column `areaExpertise` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "youwayapp"."Application" DROP COLUMN "areaExpertise",
ADD COLUMN     "highLevelLicenseName" VARCHAR(20);

-- CreateTable
CREATE TABLE "youwayapp"."ApplicationTherapy" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "therapyId" UUID NOT NULL,

    CONSTRAINT "ApplicationTherapy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."ApplicationTherapySchool" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "therapySchoolId" UUID NOT NULL,

    CONSTRAINT "ApplicationTherapySchool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationTherapy_applicationId_idx" ON "youwayapp"."ApplicationTherapy"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationTherapy_therapyId_idx" ON "youwayapp"."ApplicationTherapy"("therapyId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTherapy_applicationId_therapyId_key" ON "youwayapp"."ApplicationTherapy"("applicationId", "therapyId");

-- CreateIndex
CREATE INDEX "ApplicationTherapySchool_applicationId_idx" ON "youwayapp"."ApplicationTherapySchool"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationTherapySchool_therapySchoolId_idx" ON "youwayapp"."ApplicationTherapySchool"("therapySchoolId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationTherapySchool_applicationId_therapySchoolId_key" ON "youwayapp"."ApplicationTherapySchool"("applicationId", "therapySchoolId");

-- AddForeignKey
ALTER TABLE "youwayapp"."ApplicationTherapy" ADD CONSTRAINT "ApplicationTherapy_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "youwayapp"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."ApplicationTherapy" ADD CONSTRAINT "ApplicationTherapy_therapyId_fkey" FOREIGN KEY ("therapyId") REFERENCES "youwayapp"."Therapy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."ApplicationTherapySchool" ADD CONSTRAINT "ApplicationTherapySchool_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "youwayapp"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."ApplicationTherapySchool" ADD CONSTRAINT "ApplicationTherapySchool_therapySchoolId_fkey" FOREIGN KEY ("therapySchoolId") REFERENCES "youwayapp"."TherapySchool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
