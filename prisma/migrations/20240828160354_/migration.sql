-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Playlist',
    "userId" INTEGER NOT NULL,
    "guildId" INTEGER,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlaylistToTrack" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_url_key" ON "Track"("url");

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistToTrack_AB_unique" ON "_PlaylistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistToTrack_B_index" ON "_PlaylistToTrack"("B");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToTrack" ADD CONSTRAINT "_PlaylistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToTrack" ADD CONSTRAINT "_PlaylistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
