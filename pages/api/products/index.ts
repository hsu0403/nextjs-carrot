// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withHandler, { ResponseType } from "@libs/server/withHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

const MAX_PRODUCT = 10;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const {
      query: { page },
    } = req;
    const skipPage = +page.toString() - 1;
    const productCount = await client.product.count();
    const products = await client.product.findMany({
      include: {
        _count: {
          select: {
            favs: true,
            chatRooms: true,
          },
        },
      },
      take: MAX_PRODUCT,
      skip: MAX_PRODUCT * skipPage,
    });
    res.status(200).json({
      ok: true,
      products,
      productCount,
    });
  }
  if (req.method === "POST") {
    const { name, price, description, photoId } = req.body;
    const { user } = req.session;
    const product = await client.product.create({
      data: {
        name,
        description,
        price: +price,
        image: photoId,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    res.status(200).json({
      ok: true,
      product,
    });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
