// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withHandler, { ResponseType } from "@libs/server/withHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;
  const chatRooms = await client.chatRoom.findMany({
    where: {
      OR: [{ createdForId: user?.id }, { createdById: user?.id }],
    },
    select: {
      id: true,
      createBy: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      createdFor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      chatRoomMessage: {
        select: {
          message: true,
        },
        take: 1,
        orderBy: {
          id: "desc",
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  res.status(200).json({ ok: true, chatRooms });
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
