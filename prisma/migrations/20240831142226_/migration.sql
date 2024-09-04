/*
  Warnings:

  - You are about to drop the `_PlaylistToTrack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlaylistToTrack" DROP CONSTRAINT "_PlaylistToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToTrack" DROP CONSTRAINT "_PlaylistToTrack_B_fkey";

-- DropTable
DROP TABLE "_PlaylistToTrack";

-- CreateTable
CREATE TABLE "TracksInPlaylists" (
    "trackId" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "TracksInPlaylists_pkey" PRIMARY KEY ("trackId","playlistId")
);

-- AddForeignKey
ALTER TABLE "TracksInPlaylists" ADD CONSTRAINT "TracksInPlaylists_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracksInPlaylists" ADD CONSTRAINT "TracksInPlaylists_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
