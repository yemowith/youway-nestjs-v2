-- CreateTable
CREATE TABLE "youwayapp"."Package" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "commission" DECIMAL(10,6) DEFAULT 0,
    "image" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "price" DECIMAL(10,6) NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "canBeReplayed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PackagePrice" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "price" DECIMAL(10,6) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackagePrice_packageId_currencyCode_key" ON "youwayapp"."PackagePrice"("packageId", "currencyCode");

-- AddForeignKey
ALTER TABLE "youwayapp"."PackagePrice" ADD CONSTRAINT "PackagePrice_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "youwayapp"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."PackagePrice" ADD CONSTRAINT "PackagePrice_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
