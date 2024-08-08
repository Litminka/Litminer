import { Prisma } from "@prisma/client";
import prisma from "../db";

const extention = Prisma.defineExtension({
    name: 'UserLinkModel',
    model: {
        userLink: {
            /**
             * @param litminkaId
             */
            async getDiscordId(litminkaId: string) {
                return await prisma.userLink.findFirst({
                    where: {
                        litminkaId
                    }
                });
            }
        }
    }
});

export { extention as UserLinkExt }