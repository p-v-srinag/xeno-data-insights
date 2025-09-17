/*
  Warnings:

  - A unique constraint covering the columns `[invitationCode]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationCode` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "invitationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_invitationCode_key" ON "public"."Tenant"("invitationCode");
