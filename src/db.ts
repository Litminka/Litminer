import { PrismaClient } from '@prisma/client';
import { UserExt } from './models/user';
import { GuildExt } from './models/guild';
import { PlaylistExt } from './models/playlist';
import { TrackExt } from './models/track';

const prismaClientSingleton = () => {
    return new PrismaClient()
        .$extends(UserExt)
        .$extends(GuildExt)
        .$extends(TrackExt)
        .$extends(PlaylistExt)
};

declare global {
    // eslint-disable-next-line no-var
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'prod') globalThis.prismaGlobal = prisma;

export default prisma;