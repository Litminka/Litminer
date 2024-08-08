import { PrismaClient } from '@prisma/client';
import { UserLinkExt } from './models/UserLink';

const prismaClientSingleton = () => {
    return new PrismaClient()
        .$extends(UserLinkExt)
};

declare global {
    // eslint-disable-next-line no-var
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'prod') globalThis.prismaGlobal = prisma;

export default prisma;