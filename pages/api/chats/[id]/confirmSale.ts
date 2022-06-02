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
    body: { productId },
    session: { user },
    query: { id },
  } = req;

  const product = await client.product.update({
    where: {
      id: +productId.toString(),
    },
    data: {
      saleCheck: true,
    },
  });

  const chatRoom = await client.chatRoom.findUnique({
    where: {
      id: +id.toString(),
    },
    select: {
      createdById: true,
      createdForId: true,
    },
  });

  await client.sale.create({
    data: {
      user: {
        connect: {
          id: chatRoom?.createdForId,
        },
      },
      product: {
        connect: {
          id: +productId.toString(),
        },
      },
    },
  });

  await client.purchase.create({
    data: {
      user: {
        connect: {
          id: chatRoom?.createdById,
        },
      },
      product: {
        connect: {
          id: +productId.toString(),
        },
      },
    },
  });

  res.status(200).json({ ok: true });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
