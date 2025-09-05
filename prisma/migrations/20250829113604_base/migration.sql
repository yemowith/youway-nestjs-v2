-- CreateEnum
CREATE TYPE "youwayapp"."UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "youwayapp"."UserType" AS ENUM ('CORPORATE', 'INDIVIDUAL', 'SELLER');

-- CreateEnum
CREATE TYPE "youwayapp"."AuthProvider" AS ENUM ('EMAIL', 'PHONE', 'GOOGLE');

-- CreateEnum
CREATE TYPE "youwayapp"."OtpType" AS ENUM ('PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN', 'TWO_FACTOR_AUTHENTICATION');

-- CreateEnum
CREATE TYPE "youwayapp"."Status" AS ENUM ('pending', 'confirmed', 'rejected');

-- CreateEnum
CREATE TYPE "youwayapp"."CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "youwayapp"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "youwayapp"."TransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "youwayapp"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "youwayapp"."Log" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."User" (
    "id" UUID NOT NULL,
    "type" "youwayapp"."UserType" NOT NULL DEFAULT 'INDIVIDUAL',
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "status" "youwayapp"."UserStatus" NOT NULL DEFAULT 'PENDING',
    "password" TEXT,
    "profileImage" VARCHAR(255),
    "about" TEXT,
    "birthDate" DATE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Identity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "youwayapp"."AuthProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Device" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."RefreshToken" (
    "id" UUID NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Otp" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "youwayapp"."OtpType" NOT NULL,
    "target" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Attempt" (
    "id" UUID NOT NULL,
    "target" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."BlockedTarget" (
    "id" UUID NOT NULL,
    "target" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."UserOption" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "optionKey" VARCHAR(100) NOT NULL,
    "optionVal" VARCHAR(255) NOT NULL,

    CONSTRAINT "UserOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Notification" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSON,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."UserReferral" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "referralId" UUID,
    "referralCode" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."UserLocation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "countryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Therapy" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Therapy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."SellerProfileTherapy" (
    "id" UUID NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "therapyId" UUID NOT NULL,

    CONSTRAINT "SellerProfileTherapy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."TherapySchool" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapySchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."SellerProfileTherapySchool" (
    "id" UUID NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "therapySchoolId" UUID NOT NULL,

    CONSTRAINT "SellerProfileTherapySchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."SellerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "about" TEXT,
    "jobTitle" VARCHAR(255),
    "educationInfo" VARCHAR(255),
    "experienceInfo" VARCHAR(255),
    "certificateInfo" VARCHAR(255),
    "website" VARCHAR(255),
    "videoUrl" VARCHAR(255),
    "address" VARCHAR(255),
    "status" "youwayapp"."Status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Message" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "type" VARCHAR(50) DEFAULT 'text',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isReadAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Comment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sellerProfileId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stars" INTEGER DEFAULT 0,
    "status" "youwayapp"."CommentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Admin" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Payment" (
    "id" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "orderId" UUID,
    "orderNumber" VARCHAR(255),
    "amount" DECIMAL(10,6) NOT NULL,
    "status" "youwayapp"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "description" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PaymentMethod" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "providerKey" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PaymentSetting" (
    "id" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Currency" (
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "isoCode" VARCHAR(3) NOT NULL,
    "leftCode" VARCHAR(3) NOT NULL,
    "rightCode" VARCHAR(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "youwayapp"."Balance" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "balance" DECIMAL(15,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Transaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "type" "youwayapp"."TransactionType" NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "amount" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "balance" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Deposit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "amount" DECIMAL(15,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Withdrawal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "amount" DECIMAL(15,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Commission" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(15,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Country" (
    "id" UUID NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "code" VARCHAR(2) NOT NULL DEFAULT 'TR',
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Order" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "orderNumber" TEXT NOT NULL,
    "status" "youwayapp"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(15,6) NOT NULL,
    "taxAmount" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,6) NOT NULL,
    "customerName" VARCHAR(255),
    "customerEmail" VARCHAR(255),
    "customerPhone" VARCHAR(20),
    "notes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "packageName" VARCHAR(255) NOT NULL,
    "packageDuration" INTEGER NOT NULL,
    "unitPrice" DECIMAL(15,6) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(15,6) NOT NULL,
    "appointmentId" UUID,
    "startTime" TIMESTAMP(3),
    "details" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Application" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "licenseName" VARCHAR(20) NOT NULL,
    "highLevelLicense" BOOLEAN NOT NULL DEFAULT false,
    "areaExpertise" VARCHAR(255) NOT NULL,
    "cvUrl" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PageCategory" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."Page" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "categoryId" UUID NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'default',
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "image" VARCHAR(255),
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "seoKeywords" VARCHAR(255),
    "seoImage" VARCHAR(255),
    "seoUrl" VARCHAR(255),
    "seoCanonical" VARCHAR(255),
    "seoRobots" VARCHAR(255),
    "type" TEXT NOT NULL DEFAULT 'page',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PageMenu" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PageMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youwayapp"."PageMenuItem" (
    "id" UUID NOT NULL,
    "titleItem" VARCHAR(255) NOT NULL,
    "link" VARCHAR(255),
    "menuId" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_provider_providerId_key" ON "youwayapp"."Identity"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "youwayapp"."RefreshToken"("hashedToken");

-- CreateIndex
CREATE INDEX "Otp_target_type_idx" ON "youwayapp"."Otp"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_target_type_key" ON "youwayapp"."Attempt"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedTarget_target_type_key" ON "youwayapp"."BlockedTarget"("target", "type");

-- CreateIndex
CREATE INDEX "UserOption_userId_optionKey_idx" ON "youwayapp"."UserOption"("userId", "optionKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserOption_userId_optionKey_key" ON "youwayapp"."UserOption"("userId", "optionKey");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "youwayapp"."Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReferral_userId_key" ON "youwayapp"."UserReferral"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReferral_referralCode_key" ON "youwayapp"."UserReferral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_key" ON "youwayapp"."UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "youwayapp"."UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_countryId_idx" ON "youwayapp"."UserLocation"("countryId");

-- CreateIndex
CREATE INDEX "SellerProfileTherapy_sellerProfileId_idx" ON "youwayapp"."SellerProfileTherapy"("sellerProfileId");

-- CreateIndex
CREATE INDEX "SellerProfileTherapy_therapyId_idx" ON "youwayapp"."SellerProfileTherapy"("therapyId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfileTherapy_sellerProfileId_therapyId_key" ON "youwayapp"."SellerProfileTherapy"("sellerProfileId", "therapyId");

-- CreateIndex
CREATE INDEX "SellerProfileTherapySchool_sellerProfileId_idx" ON "youwayapp"."SellerProfileTherapySchool"("sellerProfileId");

-- CreateIndex
CREATE INDEX "SellerProfileTherapySchool_therapySchoolId_idx" ON "youwayapp"."SellerProfileTherapySchool"("therapySchoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfileTherapySchool_sellerProfileId_therapySchoolId_key" ON "youwayapp"."SellerProfileTherapySchool"("sellerProfileId", "therapySchoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "youwayapp"."SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_slug_key" ON "youwayapp"."SellerProfile"("slug");

-- CreateIndex
CREATE INDEX "SellerProfile_userId_idx" ON "youwayapp"."SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "youwayapp"."Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "youwayapp"."Admin"("userId");

-- CreateIndex
CREATE INDEX "Payment_currencyCode_idx" ON "youwayapp"."Payment"("currencyCode");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "youwayapp"."Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "youwayapp"."PaymentMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_providerKey_key" ON "youwayapp"."PaymentMethod"("providerKey");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSetting_paymentMethodId_key_key" ON "youwayapp"."PaymentSetting"("paymentMethodId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "youwayapp"."Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_name_key" ON "youwayapp"."Currency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_isoCode_key" ON "youwayapp"."Currency"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_leftCode_key" ON "youwayapp"."Currency"("leftCode");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_rightCode_key" ON "youwayapp"."Currency"("rightCode");

-- CreateIndex
CREATE INDEX "Currency_code_idx" ON "youwayapp"."Currency"("code");

-- CreateIndex
CREATE INDEX "Currency_name_idx" ON "youwayapp"."Currency"("name");

-- CreateIndex
CREATE INDEX "Currency_isoCode_idx" ON "youwayapp"."Currency"("isoCode");

-- CreateIndex
CREATE INDEX "Balance_userId_currencyCode_idx" ON "youwayapp"."Balance"("userId", "currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_currencyCode_key" ON "youwayapp"."Balance"("userId", "currencyCode");

-- CreateIndex
CREATE INDEX "Transaction_currencyCode_idx" ON "youwayapp"."Transaction"("currencyCode");

-- CreateIndex
CREATE INDEX "Deposit_currencyCode_idx" ON "youwayapp"."Deposit"("currencyCode");

-- CreateIndex
CREATE INDEX "Withdrawal_currencyCode_idx" ON "youwayapp"."Withdrawal"("currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "youwayapp"."Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "youwayapp"."Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "youwayapp"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "youwayapp"."Order"("userId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "youwayapp"."Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_currencyCode_idx" ON "youwayapp"."Order"("currencyCode");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "youwayapp"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "youwayapp"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "youwayapp"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "youwayapp"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_appointmentId_idx" ON "youwayapp"."OrderItem"("appointmentId");

-- CreateIndex
CREATE INDEX "OrderItem_startTime_idx" ON "youwayapp"."OrderItem"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "youwayapp"."Page"("slug");

-- AddForeignKey
ALTER TABLE "youwayapp"."Identity" ADD CONSTRAINT "Identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."RefreshToken" ADD CONSTRAINT "RefreshToken_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "youwayapp"."Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserOption" ADD CONSTRAINT "UserOption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserReferral" ADD CONSTRAINT "UserReferralToUser" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserReferral" ADD CONSTRAINT "UserReferralToReferral" FOREIGN KEY ("referralId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserReferral" ADD CONSTRAINT "UserReferral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."UserLocation" ADD CONSTRAINT "UserLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "youwayapp"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfileTherapy" ADD CONSTRAINT "SellerProfileTherapy_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfileTherapy" ADD CONSTRAINT "SellerProfileTherapy_therapyId_fkey" FOREIGN KEY ("therapyId") REFERENCES "youwayapp"."Therapy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfileTherapySchool" ADD CONSTRAINT "SellerProfileTherapySchool_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfileTherapySchool" ADD CONSTRAINT "SellerProfileTherapySchool_therapySchoolId_fkey" FOREIGN KEY ("therapySchoolId") REFERENCES "youwayapp"."TherapySchool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Comment" ADD CONSTRAINT "Comment_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "youwayapp"."SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "youwayapp"."PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Payment" ADD CONSTRAINT "Payment_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "youwayapp"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."PaymentSetting" ADD CONSTRAINT "PaymentSetting_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "youwayapp"."PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Balance" ADD CONSTRAINT "Balance_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Transaction" ADD CONSTRAINT "Transaction_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Deposit" ADD CONSTRAINT "Deposit_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Withdrawal" ADD CONSTRAINT "Withdrawal_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Commission" ADD CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Country" ADD CONSTRAINT "Country_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "youwayapp"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Order" ADD CONSTRAINT "Order_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "youwayapp"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "youwayapp"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."Page" ADD CONSTRAINT "Page_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "youwayapp"."PageCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."PageMenuItem" ADD CONSTRAINT "PageMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "youwayapp"."PageMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youwayapp"."PageMenuItem" ADD CONSTRAINT "PageMenuItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "youwayapp"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
