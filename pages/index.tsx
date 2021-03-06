import type { NextPage } from "next";
import FloatingButton from "@components/floating-button";
import Item from "@components/item";
import Layout from "@components/layout";
import useSWR, { SWRConfig } from "swr";
import { Product } from "@prisma/client";
import client from "@libs/server/client";
import { useState } from "react";
import Paging from "@components/paging";

export interface ProductWithFav extends Product {
  _count: {
    favs: number;
    chatRooms: number;
  };
}

interface ProductsResponse {
  ok: boolean;
  products: ProductWithFav[];
  productCount: number;
}

const PAGING_BTN = 5;
const PAGING_PRODUCT = 10;

const Home: NextPage = () => {
  const [page, setPage] = useState(1);
  const [viewBtn, setViewBtn] = useState(0);
  const { data } = useSWR<ProductsResponse>(`/api/products?page=${page}`);

  const viewPage = Math.ceil(
    data?.productCount ? data.productCount / PAGING_PRODUCT : 0
  );
  const countView = Math.floor(viewPage / PAGING_BTN);
  const onValid = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPage(+event.currentTarget.value);
  };
  const onLeftClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewBtn((prev) => prev - 1);
    setPage((viewBtn - 1) * PAGING_BTN + PAGING_BTN);
  };
  const onRightClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewBtn((prev) => prev + 1);
    setPage((viewBtn + 1) * PAGING_BTN + 1);
  };
  return (
    <Layout seoTitle="Home" title="홈" hasTabBar>
      <div className="flex flex-col space-y-5 px-6">
        {data?.products?.map((product) => (
          <Item
            id={product.id}
            key={product.id}
            title={product.name}
            price={product.price}
            comments={product._count?.chatRooms || 0}
            hearts={product._count?.favs || 0}
            image={product.image}
          />
        ))}
        <br />
        {!data ? (
          <div className="flex justify-center items-center">Loading...</div>
        ) : (
          <Paging
            page={page}
            viewBtn={viewBtn}
            viewPage={viewPage}
            countView={countView}
            onLeftClick={onLeftClick}
            onRightClick={onRightClick}
            onValid={onValid}
          />
        )}
        <FloatingButton href="/products/upload">
          <svg
            className="h-6 w-6"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </FloatingButton>
      </div>
    </Layout>
  );
};

const Page: NextPage<{ products: ProductWithFav[] }> = ({ products }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/products": {
            ok: true,
            products,
          },
        },
      }}
    >
      <Home />
    </SWRConfig>
  );
};

export async function getServerSideProps() {
  const products = await client.product.findMany({});
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default Page;
