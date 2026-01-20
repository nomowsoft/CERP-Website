/*
  Warnings:

  - You are about to drop the column `charityname` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "charityname",
ADD COLUMN     "charityName" TEXT;
