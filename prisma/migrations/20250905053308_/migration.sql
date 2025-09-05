-- CreateEnum
CREATE TYPE "youwayapp"."PageMenuItemType" AS ENUM ('PAGE', 'CUSTOM_LINK');

-- AlterTable
ALTER TABLE "youwayapp"."PageMenu" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "youwayapp"."PageMenuItem" ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "youwayapp"."PageMenuItemType" DEFAULT 'PAGE',
ALTER COLUMN "pageId" DROP NOT NULL;
