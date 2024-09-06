import { Playlist, Prisma } from "@prisma/client";
import prisma from "../db";
import { Track } from "lavalink-client";
import BaseError from "../errors/BaseError";
import { LitminerDebug } from "../utils/LitminerDebug";
import { client } from "../app";

const extention = Prisma.defineExtension({
    name: 'PlaylistModel',
    model: {
        playlist: {
            async createPlaylist(name: string, discordId: string) {
                const dsUser = await client.users.fetch(discordId);
                await prisma.playlist.create({
                    data: {
                        name,
                        user: {
                            connectOrCreate: {
                                where:{
                                    discordId
                                },
                                create:{
                                    discordId,
                                    icon: dsUser.avatarURL(),
                                    username: dsUser.username
                                }
                            }
                        }
                    }
                })
            },
            async deletePlaylist(id: number, discordId: string) {
                const user = await prisma.user.getSettings(discordId);
                if (!user) throw new BaseError(`User not registered`);
                await prisma.playlist.delete({
                    where: {
                        id,
                        user: {
                            id: user.id
                        }

                    }
                })
            },
            async findTracks(list: Playlist, searchTracks: Track[]) {
                return await prisma.playlist.findMany({
                    where: {
                        id: list.id,
                        tracks: {
                            every:{
                                identifier:{
                                    in: searchTracks.map((track) => {
                                        return track.info.identifier
                                    })
                                }
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
                                        identifier: track.info.identifier
                                    },
                                    create: {
                                        name: track.info.title,
                                        identifier: track.info.identifier,
                                        duration: track.info.duration,
                                        author: track.info.author,
                                        source: track.info.sourceName
                                    }
                                };
                            })
                        }
                    }
                })
            },
            async getTracks(playlist: Playlist) {
                const playlistTracks = await prisma.playlist.findFirst({
                    where: {
                        id: playlist?.id
                    },
                    select:{
                        tracks: true
                    }
                });
                return playlistTracks?.tracks ?? [];
            },
            async removeTracks(list: Playlist, tracks: Track[]) {
                await prisma.playlist.update({
                    where: {
                        id: list.id
                    },
                    data: {
                        tracks: {
                            disconnect: tracks.map((track) => {
                                return {
                                    identifier: track.info.identifier
                                }
                            })
                        }
                    }
                })
            },
            async getPlaylists(discordId: string) {
                return await prisma.playlist.findMany({
                    where: {
                        user: {
                            discordId
                        }
                    },
                    include: {
                        tracks: true
                    }
                })
            }
        }
    }
});

export { extention as PlaylistExt }