/*
  Warnings:

  - You are about to drop the `UserLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UserLink";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "discordId" TEXT NOT NULL,
    "litminkaId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isNotifiable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" SERIAL NOT NULL,
    "guildId" INTEGER NOT NULL,
    "isNotifiable" BOOLEAN NOT NULL DEFAULT false,
    "notifyChannelId" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_litminkaId_key" ON "User"("litminkaId");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");
