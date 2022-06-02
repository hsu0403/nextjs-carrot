import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { LiveProduct } from "@prisma/client";

interface CreateForm {
  name: string;
  price: number;
  description: string;
}

interface CreateResponse {
  ok: boolean;
  liveProduct: LiveProduct;
}

const Create: NextPage = () => {
  const router = useRouter();
  const [createLive, { data, loading }] =
    useMutation<CreateResponse>(`/api/lives`);
  const { register, handleSubmit } = useForm<CreateForm>();
  const onValid = (form: CreateForm) => {
    if (loading) return;
    createLive(form);
  };
  useEffect(() => {
    if (data && data.ok) {
      router.push(`/lives/${data.liveProduct.id}`);
    }
  }, [data, router]);
  return (
    <Layout seoTitle="Create Live" canGoBack title="Create Live">
      <form onSubmit={handleSubmit(onValid)} className="space-y-5 px-6">
        <Input
          type="text"
          register={register("name", { required: true })}
          label="Name"
          name="input"
          required
        />
        <Input
          register={register("price", { required: true, valueAsNumber: true })}
          required
          label="Price"
          name="price"
          kind="price"
          type="number"
        />
        <TextArea
          register={register("description", { required: true, minLength: 5 })}
          required
          placeholder="Write your product description..."
          name="description"
          label="Description"
        />
        <Button text={loading ? "Loading..." : "Create Live"} />
      </form>
    </Layout>
  );
};

export default Create;
