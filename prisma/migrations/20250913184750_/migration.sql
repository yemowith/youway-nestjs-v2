/*
  Warnings:

  - Added the required column `questionKey` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "youwayapp"."Question" ADD COLUMN     "questionKey" VARCHAR(255) NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
