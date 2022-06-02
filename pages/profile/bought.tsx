import type { NextPage } from "next";
import Item from "@components/item";
import Layout from "@components/layout";
import ProductList from "@components/product-list";

const Bought: NextPage = () => {
  return (
    <Layout seoTitle="Bought" canGoBack title="구매내역">
      <div className="flex flex-col space-y-5 px-6">
        <ProductList kind="purchases" />
      </div>
    </Layout>
  );
};

export default Bought;
