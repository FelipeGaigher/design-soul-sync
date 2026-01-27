/*
  Warnings:

  - The values [BORDER,ANIMATION] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[figmaId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('COLOR', 'SPACING', 'TYPOGRAPHY', 'BORDER_RADIUS', 'SHADOW', 'FONT_SIZE', 'FONT_WEIGHT', 'LINE_HEIGHT', 'Z_INDEX', 'OPACITY', 'OTHER');
ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "alertsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "colorsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "componentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "effectsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "figmaFileUrl" TEXT,
ADD COLUMN     "importErrorMessage" TEXT,
ADD COLUMN     "importProgress" INTEGER DEFAULT 0,
ADD COLUMN     "importStatus" TEXT,
ADD COLUMN     "lastImportedAt" TIMESTAMP(3),
ADD COLUMN     "typographyCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "figmaId" TEXT,
ADD COLUMN     "githubAccessToken" TEXT,
ADD COLUMN     "googleAccessToken" TEXT;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "companies_ownerId_idx" ON "companies"("ownerId");

-- CreateIndex
CREATE INDEX "projects_companyId_idx" ON "projects"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "users_figmaId_key" ON "users"("figmaId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
