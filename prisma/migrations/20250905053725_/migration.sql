-- CreateTable
CREATE TABLE "youwayapp"."Setting" (
    "id" UUID NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "group" VARCHAR(255) NOT NULL DEFAULT 'general',
    "type" VARCHAR(50) NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "youwayapp"."Setting"("key");
