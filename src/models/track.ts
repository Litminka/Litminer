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
                        identifier: track.info.identifier,
                        duration: track.info.duration,
                        author: track.info.author,
                        source: track.info.sourceName
                    }
                })
            }
        }
    }
});

export { extention as TrackExt }