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
  } = req;
  const user = await client.user.findUnique({
    where: {
      id: +id.toString(),
    },
    include: {
      products: {
        take: 4,
      },
      receivedReviews: {
        take: 4,
        include: {
          createBy: true,
        },
      },
    },
  });
  res.status(200).json({ ok: true, user });
}

export default withApiSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
