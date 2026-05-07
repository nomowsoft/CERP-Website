/*
  Warnings:

  - The `image` column on the `Package` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `image` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('RENEW', 'UPGRADE', 'ADD_SYSTEM');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'SAR',
ADD COLUMN     "description_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "description_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;

-- AlterTable
ALTER TABLE "PackageFeature" ADD COLUMN     "text_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "text_en" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'SAR',
ADD COLUMN     "description_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "description_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;

-- AlterTable
ALTER TABLE "ServiceType" ADD COLUMN     "name_ar" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name_en" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "instanceUrl" TEXT,
ADD COLUMN     "packageId" INTEGER;

-- CreateTable
CREATE TABLE "SubscriptionRequest" (
    "id" SERIAL NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "type" "RequestType" NOT NULL,
    "packageId" INTEGER,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "bankReceipt" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "licenseFile" TEXT,

    CONSTRAINT "SubscriptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutId" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL DEFAULT '',
    "name_en" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "description_ar" TEXT NOT NULL DEFAULT '',
    "description_en" TEXT NOT NULL DEFAULT '',
    "icon" BYTEA,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SystemToSubscription" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SystemToSubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PackageToSystem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PackageToSystem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SystemToSubscriptionRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SystemToSubscriptionRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ServiceToSubscription" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ServiceToSubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ServiceToSubscriptionRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ServiceToSubscriptionRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_checkoutId_key" ON "Payment"("checkoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "_SystemToSubscription_B_index" ON "_SystemToSubscription"("B");

-- CreateIndex
CREATE INDEX "_PackageToSystem_B_index" ON "_PackageToSystem"("B");

-- CreateIndex
CREATE INDEX "_SystemToSubscriptionRequest_B_index" ON "_SystemToSubscriptionRequest"("B");

-- CreateIndex
CREATE INDEX "_ServiceToSubscription_B_index" ON "_ServiceToSubscription"("B");

-- CreateIndex
CREATE INDEX "_ServiceToSubscriptionRequest_B_index" ON "_ServiceToSubscriptionRequest"("B");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionRequest" ADD CONSTRAINT "SubscriptionRequest_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionRequest" ADD CONSTRAINT "SubscriptionRequest_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SystemToSubscription" ADD CONSTRAINT "_SystemToSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SystemToSubscription" ADD CONSTRAINT "_SystemToSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToSystem" ADD CONSTRAINT "_PackageToSystem_A_fkey" FOREIGN KEY ("A") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToSystem" ADD CONSTRAINT "_PackageToSystem_B_fkey" FOREIGN KEY ("B") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SystemToSubscriptionRequest" ADD CONSTRAINT "_SystemToSubscriptionRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "SubscriptionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SystemToSubscriptionRequest" ADD CONSTRAINT "_SystemToSubscriptionRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToSubscription" ADD CONSTRAINT "_ServiceToSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToSubscription" ADD CONSTRAINT "_ServiceToSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToSubscriptionRequest" ADD CONSTRAINT "_ServiceToSubscriptionRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToSubscriptionRequest" ADD CONSTRAINT "_ServiceToSubscriptionRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "SubscriptionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
