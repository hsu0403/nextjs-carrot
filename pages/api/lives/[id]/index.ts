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
  const liveProduct = await client.liveProduct.findUnique({
    where: {
      id: +id.toString(),
    },
    include: {
      messages: {
        select: {
          id: true,
          message: true,
          user: {
            select: {
              avatar: true,
              id: true,
            },
          },
        },
      },
    },
  });
  const isOwner = liveProduct?.userId === user?.id;
  if (liveProduct && !isOwner) {
    liveProduct.cloudflareKey = "xxx";
    liveProduct.cloudflareUrl = "xxx";
  }
  res.status(200).json({ ok: true, liveProduct });
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
