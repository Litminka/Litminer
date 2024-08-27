import { Prisma, } from "@prisma/client";
import { Track } from "lavalink-client";
import prisma from "../db";

const extention = Prisma.defineExtension({
    name: 'TrackModel',
    model: {
        track: {
            async addTrack(track: Track) {
                await prisma.track.create({
                    data: {
                        name: track.info.title,
                        url: track.info.uri,
                        duration: track.info.duration,
                        author: track.info.author
                    }
                })
            }
        }
    }
});

export { extention as TrackExt }