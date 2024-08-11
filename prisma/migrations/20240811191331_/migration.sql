-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '';
