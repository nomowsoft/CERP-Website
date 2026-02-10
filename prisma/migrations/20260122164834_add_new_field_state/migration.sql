/*
  Warnings:

  - Added the required column `status` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PROGRES', 'DONE', 'CANCEL');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "status" "Status" NOT NULL;
