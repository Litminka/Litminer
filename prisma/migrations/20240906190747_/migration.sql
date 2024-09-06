/*
  Warnings:

  - You are about to drop the column `url` on the `Track` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identifier]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Track_url_key";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "url",
ADD COLUMN     "identifier" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Track_identifier_key" ON "Track"("identifier");
