/*
  Warnings:

  - You are about to drop the `TracksInPlaylists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TracksInPlaylists" DROP CONSTRAINT "TracksInPlaylists_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "TracksInPlaylists" DROP CONSTRAINT "TracksInPlaylists_trackId_fkey";

-- DropTable
DROP TABLE "TracksInPlaylists";

-- CreateTable
CREATE TABLE "_PlaylistToTrack" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistToTrack_AB_unique" ON "_PlaylistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistToTrack_B_index" ON "_PlaylistToTrack"("B");

-- AddForeignKey
ALTER TABLE "_PlaylistToTrack" ADD CONSTRAINT "_PlaylistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToTrack" ADD CONSTRAINT "_PlaylistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
