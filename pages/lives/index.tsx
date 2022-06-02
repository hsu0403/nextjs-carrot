import type { NextPage } from "next";
import Link from "next/link";
import FloatingButton from "@components/floating-button";
import Layout from "@components/layout";
import { LiveProduct } from "@prisma/client";
import useSWR from "swr";
import { useState } from "react";
import Paging from "@components/paging";
import Image from "next/image";

interface LiveProducts {
  ok: boolean;
  liveProducts: LiveProduct[];
  productCount: number;
}

const PAGING_BTN = 5;
const PAGING_PRODUCT = 10;

const Lives: NextPage = () => {
  const [page, setPage] = useState(1);
  const [viewBtn, setViewBtn] = useState(0);
  const { data } = useSWR<LiveProducts>(`/api/lives?page=${page}`);
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
    <Layout seoTitle="Lives" title="라이브" hasTabBar>
      <div className="divide-y-3 space-y-3">
        {data?.liveProducts?.map((live) => (
          <Link href={`/lives/${live.id}`} key={live.id}>
            <a className="pt-4 px-6">
              <div className="w-full relative overflow-hidden rounded-md shadow-sm bg-slate-300 aspect-video">
                <Image
                  layout="fill"
                  src={`https://videodelivery.net/${live.cloudflareId}/thumbnails/thumbnail.jpg?height=320`}
                />
              </div>
              <h1 className="font-bold text-gray-900 text-lg mt-2">
                {live.name}
              </h1>
            </a>
          </Link>
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
        <FloatingButton href="/lives/create">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </FloatingButton>
      </div>
    </Layout>
  );
};

export default Lives;
