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
    query: { id },
    session: { user },
  } = req;
  const exsistChatRoom = await client.chatRoom.findUnique({
    where: {
      id: +id.toString(),
    },
    select: {
      id: true,
      createdById: true,
      createdForId: true,
      productId: true,
    },
  });

  if (!exsistChatRoom) {
    return res.json({ ok: false });
  } else {
    if (
      exsistChatRoom.createdById === user?.id ||
      exsistChatRoom.createdForId === user?.id
    ) {
      const chatRoomMessages = await client.chatRoomMessage.findMany({
        where: {
          chatRoomId: +id.toString(),
        },
        select: {
          id: true,
          userId: true,
          message: true,
          user: {
            select: {
              avatar: true,
            },
          },
        },
      });
      const product = await client.product.findUnique({
        where: {
          id: exsistChatRoom.productId,
        },
        select: {
          purchaseCheck: true,
          saleCheck: true,
          name: true,
        },
      });
      return res
        .status(200)
        .json({ ok: true, chatRoomMessages, product, exsistChatRoom });
    } else {
      return res.json({ ok: false });
    }
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
