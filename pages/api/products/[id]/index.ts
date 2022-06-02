// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withHandler, { ResponseType } from "@libs/server/withHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { id } = req.query;
  const { user } = req.session;
  if (req.method === "GET") {
    const product = await client.product.findUnique({
      where: {
        id: +id.toString(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    const isOwner = product?.user?.id === user?.id;
    const terms = product?.name.split(" ").map((word) => ({
      name: {
        contains: word,
      },
    }));
    const relatedProducts = await client.product.findMany({
      where: {
        OR: terms,
        AND: {
          id: {
            not: product?.id,
          },
        },
      },
      take: 6,
    });
    const isLiked = Boolean(
      await client.fav.findFirst({
        where: {
          productId: product?.id,
          userId: user?.id,
        },
        select: {
          id: true,
        },
      })
    );
    res.json({ ok: true, product, isLiked, relatedProducts, isOwner });
  }
  if (req.method === "POST") {
    const {
      body: { productId },
    } = req;
    let room;

    const findSellUser = await client.product.findUnique({
      where: {
        id: +id.toString(),
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    const isOwner = findSellUser?.user?.id === user?.id;
    if (!isOwner) {
      const existsChat = await client.chatRoom.findFirst({
        where: {
          AND: [
            { productId },
            { createdById: user?.id },
            { createdForId: findSellUser?.user?.id },
          ],
        },
        select: {
          id: true,
        },
      });
      if (existsChat) {
        room = await client.chatRoom.findUnique({
          where: {
            id: existsChat.id,
          },
        });
      } else {
        room = await client.chatRoom.create({
          data: {
            createBy: {
              connect: {
                id: user?.id,
              },
            },
            createdFor: {
              connect: {
                id: findSellUser?.user?.id,
              },
            },
            product: {
              connect: {
                id: productId,
              },
            },
          },
        });
      }
    }
    res.status(200).json({ ok: true, room });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handler,
  })
);
