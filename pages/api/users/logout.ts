// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withHandler, { ResponseType } from "@libs/server/withHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  await req.session.destroy();
  res.status(200).json({
    ok: true,
  });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handler, isPrivate: false })
);
