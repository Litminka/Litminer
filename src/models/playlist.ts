import { Playlist, Prisma } from "@prisma/client";
import prisma from "../db";
import { Track } from "lavalink-client";
import { User } from "discord.js";

const extention = Prisma.defineExtension({
    name: 'PlaylistModel',
    model: {
        playlist: {
            async createPlaylist(name: string, user: User) {
                await prisma.playlist.create({
                    data: {
                        name,
                        user: {
                            connect: {
                                discordId: user.id
                            }
                        }
                    }
                })
            },
            async addTracks(list: Playlist, tracks: Track[]) {
                await prisma.playlist.update({
                    where: {
                        id: list.id
                    },
                    data: {
                        tracks: {
                            connectOrCreate: tracks.map((track) => {
                                return {
                                    where: {
                                        url: track.info.uri
                                    },
                                    create: {
                                        name: track.info.title,
                                        url: track.info.uri,
                                        duration: track.info.duration,
                                        author: track.info.author
                                    }
                                };
                            })
                        }
                    }
                })
            }
        }
    }
});

export { extention as PlaylistExt }