-- CreateTable
CREATE TABLE "youwayapp"."SellerProfileImage" (
    "id" UUID NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "originalUrl" VARCHAR(255),
    "thumbnailUrl" VARCHAR(255),
    "coverUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SellerProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfileImage_sellerProfileId_key" ON "youwayapp"."SellerProfileImage"("sellerProfileId");

-- CreateIndex
CREATE INDEX "SellerProfileImage_sellerProfileId_idx" ON "youwayapp"."SellerProfileImage"("sellerProfileId");

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfileImage" ADD CONSTRAINT "SellerProfileImage_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
