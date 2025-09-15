/*
  Warnings:

  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "amount",
DROP COLUMN "createdAt",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "apiKey",
DROP COLUMN "createdAt";
