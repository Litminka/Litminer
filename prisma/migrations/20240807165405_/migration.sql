-- CreateTable
CREATE TABLE "UserLink" (
    "id" SERIAL NOT NULL,
    "discordId" INTEGER NOT NULL,
    "litminkaId" INTEGER NOT NULL,

    CONSTRAINT "UserLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLink_discordId_key" ON "UserLink"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLink_litminkaId_key" ON "UserLink"("litminkaId");
