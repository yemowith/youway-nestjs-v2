-- CreateTable
CREATE TABLE "youwayapp"."CustomSellerAvailability" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTime" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSellerAvailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "youwayapp"."CustomSellerAvailability" ADD CONSTRAINT "CustomSellerAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
