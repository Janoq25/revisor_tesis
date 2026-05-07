/*
  Warnings:

  - Added the required column `usuarioId` to the `Tesis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tesis" ADD COLUMN "usuarioId" TEXT;

-- UpdateTable - Assign default userId to existing records for testing purposes
UPDATE "Tesis" SET "usuarioId" = '00000000-0000-0000-0000-000000000000' WHERE "usuarioId" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "Tesis" ALTER COLUMN "usuarioId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Tesis_usuarioId_idx" ON "Tesis"("usuarioId");

