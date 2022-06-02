import type { NextApiRequest, NextPage, NextPageContext } from "next";
import Layout from "@components/layout";
import useSWR, { SWRConfig } from "swr";
import client from "@libs/server/client";
import { useRouter } from "next/router";
import { Product, Review, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { cls } from "@libs/client/utils";

interface Fallback {
  [url: string]: {
    ok: boolean;
    user: UserWithOther;
  };
}

interface ReviewWithUser extends Review {
  createBy: User;
}

interface UserWithOther extends User {
  products: Product[];
  receivedReviews: ReviewWithUser[];
}

interface Profile {
  ok: true;
  user: UserWithOther;
}

const UsersProfile: NextPage = () => {
  const router = useRouter();
  const { data } = useSWR<Profile>(`/api/users/profile/${router.query.id}`);
  return (
    <Layout
      seoTitle={`${data?.user.name}'s Profile`}
      canGoBack
      title={`${data?.user.name}'s Profile`}
    >
      <div className="px-6">
        <div className="relative pb-60">
          <Image
            src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${data?.user?.avatar}/avatar`}
            className="h-60 bg-slate-300 object-cover"
            layout="fill"
          />
        </div>
        <div className="flex flex-col space-y-5 px-6">
          <div className="text-center">{data?.user.name}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {data?.user?.receivedReviews.map((review) => (
              <div key={review.id} className="mt-5">
                <div className="flex items-center space-x-4">
                  <Image
                    width={48}
                    height={48}
                    src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${review.createBy?.avatar}/avatar`}
                    className="w-12 h-12 rounded-full bg-slate-300"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {review.createBy?.name}
                    </h4>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={cls(
                            "h-5 w-5",
                            review.score >= star
                              ? "text-yellow-400"
                              : "text-gray-400"
                          )}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 text-gray-600 text-sm">
                    <p>{review.review}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {data?.user?.products.map((product) => (
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
      </div>
    </Layout>
  );
};

const Page: NextPage<{ fallback: Fallback }> = ({ fallback }) => {
  console.log(fallback);
  return (
    <SWRConfig
      value={{
        fallback,
      }}
    >
      <UsersProfile />
    </SWRConfig>
  );
};

export async function getServerSideProps(req: NextApiRequest) {
  const {
    query: { id },
  } = req;
  const url = `/api/users/profile/${id}`;

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
      },
    },
  });
  const fallback = {
    [url]: {
      ok: true,
      user,
    },
  };
  return {
    props: {
      fallback: JSON.parse(JSON.stringify(fallback)),
    },
  };
}

export default Page;
