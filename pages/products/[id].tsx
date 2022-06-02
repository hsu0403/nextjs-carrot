import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Button from "@components/button";
import Layout from "@components/layout";
import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import { ChatRoom, Product, User } from "@prisma/client";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import Image from "next/image";
import { useEffect } from "react";
import client from "@libs/server/client";

interface ProductWithUser extends Product {
  user: User;
}

interface ProductDetailResponse {
  ok: boolean;
  product: ProductWithUser;
  relatedProducts: Product[];
  isLiked: boolean;
  isOwner: boolean;
}

interface ChatRoomResponse {
  ok: boolean;
  room: ChatRoom;
}

const ProductDetail: NextPage = () => {
  const router = useRouter();
  const { data, mutate } = useSWR<ProductDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  const [toggleFav, { loading }] = useMutation(
    `/api/products/${router.query.id}/fav`
  );
  const onFavClick = () => {
    if (!data) return;
    mutate({ ...data, isLiked: !data.isLiked }, false);
    if (!loading) {
      toggleFav({});
    }
  };
  const [chat, { loading: chatLoading, data: chatData }] =
    useMutation<ChatRoomResponse>(`/api/products/${router.query.id}`);
  const onTalkClick = () => {
    if (!data) return;
    if (!chatLoading) {
      chat({ productId: data.product.id });
    }
  };
  useEffect(() => {
    if (chatData && chatData.ok === true) {
      router.push(`/chats/${chatData.room.id}`);
    }
  }, [chatData, router]);
  return (
    <Layout seoTitle={`${data?.product?.name}`} canGoBack>
      <div className="px-6">
        <div className="mb-6">
          <div className="relative pb-80">
            <Image
              src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${data?.product?.image}/public`}
              className="h-96 bg-slate-300 object-cover"
              layout="fill"
            />
          </div>
          <div className="flex cursor-pointer py-3 border-t border-b items-center space-x-3">
            <Image
              width={48}
              height={48}
              src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${data?.product?.user?.avatar}/avatar`}
              className="w-12 h-12 rounded-full bg-slate-300"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {!data ? "Loading..." : data.product?.user?.name}
              </p>
              <Link href={`/users/profile/${data?.product?.user?.id}`}>
                <a className="text-xs font-medium text-gray-500">
                  View profile &rarr;
                </a>
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <h1 className="text-3xl font-bold text-gray-900">
              {!data ? "Loading..." : data.product?.name}
            </h1>
            <span className="text-3xl mt-3 text-gray-900 block">
              &#8361;{!data ? "Loading..." : data.product?.price}
            </span>
            <p className="text-base my-6 text-gray-700">
              {!data ? "Loading..." : data.product?.description}
            </p>
            <div className="flex items-center justify-between space-x-2">
              {data?.product?.saleCheck ? (
                <span
                  className={
                    "text-center w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white  px-4 border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none"
                  }
                >
                  판매 완료
                </span>
              ) : data?.isOwner ? (
                <span
                  className={
                    "text-center w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white  px-4 border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none"
                  }
                >
                  I am a seller.
                </span>
              ) : (
                <Button
                  onClick={onTalkClick}
                  text={chatLoading ? "Loading..." : "Talk to seller"}
                  large
                />
              )}
              <button
                onClick={onFavClick}
                className={cls(
                  "p-3 rounded-md flex items-center justify-center hover:bg-gray-100",
                  data?.isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-gray-500"
                )}
              >
                {data?.isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 "
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Similar items</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {data?.relatedProducts?.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <a>
                  <div className="relative pb-56">
                    <Image
                      src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${product.image}/public`}
                      className="h-56 bg-slate-300 object-cover"
                      layout="fill"
                    />
                  </div>
                  <div className="flex justify-around items-center">
                    <h3 className="text-gray-700 -mb-1">{product.name}</h3>
                    <span className="text-sm font-medium text-gray-900">
                      &#8361;{product.price}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

/*
const ProductDetail: NextPage<ProductDetailResponse> = ({
  product,
  relatedProducts,
  isLiked,
  isOwner,
}) => {
  const router = useRouter();
  const { data, mutate } = useSWR<ProductDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  const [toggleFav, { loading }] = useMutation(
    `/api/products/${router.query.id}/fav`
  );
  const onFavClick = () => {
    if (!data) return;
    mutate({ ...data, isLiked: !data.isLiked }, false);
    if (!loading) {
      toggleFav({});
    }
  };
  const [chat, { loading: chatLoading, data: chatData }] =
    useMutation<ChatRoomResponse>(`/api/products/${router.query.id}`);
  const onTalkClick = () => {
    if (!data) return;
    if (!chatLoading) {
      chat({ productId: data.product.id });
    }
  };
  useEffect(() => {
    if (chatData && chatData.ok === true) {
      router.push(`/chats/${chatData.room.id}`);
    }
  }, [chatData, router]);
  return (
    <Layout seoTitle={`${product?.name}`} canGoBack>
      <div className="px-6">
        <div className="mb-6">
          <div className="relative pb-80">
            <Image
              src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${product?.image}/public`}
              className="h-96 bg-slate-300 object-cover"
              layout="fill"
            />
          </div>
          <div className="flex cursor-pointer py-3 border-t border-b items-center space-x-3">
            <Image
              width={48}
              height={48}
              src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${product?.user?.avatar}/avatar`}
              className="w-12 h-12 rounded-full bg-slate-300"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {!product ? "Loading..." : product.user?.name}
              </p>
              <Link href={`/users/profile/${product?.user?.id}`}>
                <a className="text-xs font-medium text-gray-500">
                  View profile &rarr;
                </a>
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <h1 className="text-3xl font-bold text-gray-900">
              {!product ? "Loading..." : product.name}
            </h1>
            <span className="text-3xl mt-3 text-gray-900 block">
              &#8361;{!product ? "Loading..." : product.price}
            </span>
            <p className="text-base my-6 text-gray-700">
              {!product ? "Loading..." : product.description}
            </p>
            <div className="flex items-center justify-between space-x-2">
              {isOwner ? (
                <Button text="I am a seller." large />
              ) : (
                <Button
                  onClick={onTalkClick}
                  text={chatLoading ? "Loading..." : "Talk to seller"}
                  large
                />
              )}
              <button
                onClick={onFavClick}
                className={cls(
                  "p-3 rounded-md flex items-center justify-center hover:bg-gray-100",
                  isLiked
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-gray-500"
                )}
              >
                {isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 "
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Similar items</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {relatedProducts?.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <a>
                  <div className="h-56 w-full mb-4 bg-slate-300" />
                  <h3 className="text-gray-700 -mb-1">{product.name}</h3>
                  <span className="text-sm font-medium text-gray-900">
                    &#8361;{product.price}
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  if (!ctx?.params?.id) {
    return {
      props: {},
    };
  }
  const product = await client.product.findUnique({
    where: {
      id: +ctx.params.id.toString(),
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
  const isOwner = false;
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
  const isLiked = false;
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
      isLiked,
      isOwner,
    },
  };
};
*/

export default ProductDetail;
