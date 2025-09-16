/*
  Warnings:

  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "youwayapp"."Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "youwayapp"."User" DROP COLUMN "birthDate",
ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "sex" "youwayapp"."Sex";
