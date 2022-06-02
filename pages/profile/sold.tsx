import type { NextPage } from "next";
import Layout from "@components/layout";
import ProductList from "@components/product-list";

const Sold: NextPage = () => {
  return (
    <Layout seoTitle="Sold" canGoBack title="판매내역">
      <div className="flex flex-col space-y-5 px-6">
        <ProductList kind="sales" />
      </div>
    </Layout>
  );
};

export default Sold;
