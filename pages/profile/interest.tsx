import type { NextPage } from "next";
import Layout from "@components/layout";
import ProductList from "@components/product-list";

const Interest: NextPage = () => {
  return (
    <Layout seoTitle="Interesting" canGoBack title="관심목록">
      <div className="flex flex-col space-y-5 px-6">
        <ProductList kind="favs" />
      </div>
    </Layout>
  );
};

export default Interest;
