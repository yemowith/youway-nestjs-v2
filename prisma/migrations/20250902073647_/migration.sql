-- CreateTable
CREATE TABLE "youwayapp"."SellerSetting" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxDailyAppointments" INTEGER NOT NULL DEFAULT 30,
    "durationBetweenAppointments" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerSetting_userId_idx" ON "youwayapp"."SellerSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerSetting_userId_key" ON "youwayapp"."SellerSetting"("userId");

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerSetting" ADD CONSTRAINT "SellerSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
