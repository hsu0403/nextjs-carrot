import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import TextArea from "@components/textarea";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { useRouter } from "next/router";

interface UploadItemForm {
  name: string;
  price: number;
  description: string;
  photo: FileList;
}

interface UploadItemMutation {
  ok: boolean;
  product: Product;
}

const Upload: NextPage = () => {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState("");
  const { register, handleSubmit, watch } = useForm<UploadItemForm>();
  const [uploadItem, { loading, data }] =
    useMutation<UploadItemMutation>("/api/products");
  const onValid = async ({
    description,
    name,
    photo,
    price,
  }: UploadItemForm) => {
    if (loading) return;
    if (photo && photo.length > 0) {
      const { uploadURL } = await (await fetch(`/api/files`)).json();
      const form = new FormData();
      form.append("file", photo[0], name);
      const {
        result: { id },
      } = await (await fetch(uploadURL, { method: "POST", body: form })).json();
      uploadItem({ description, name, price, photoId: id });
    } else {
      uploadItem({ description, name, price });
    }
  };
  useEffect(() => {
    if (data?.ok) {
      router.push(`/products/${data.product.id}`);
    }
  }, [data, router]);
  const photo = watch("photo");
  useEffect(() => {
    if (photo && photo.length > 0) {
      const file = photo[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, [photo]);
  return (
    <Layout seoTitle="Upload Product" canGoBack title="Upload Product">
      <form className="px-6 flex flex-col" onSubmit={handleSubmit(onValid)}>
        <div>
          {photoPreview ? (
            <img
              src={photoPreview}
              className="w-full h-46 rounded-md text-gray-600"
            />
          ) : (
            <label className="w-full cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 py-6 h-48 rounded-md mb-10 text-gray-600 hover:text-orange-500 hover:border-orange-400">
              <svg
                className="h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                {...register("photo", { required: true })}
                accept="image/*"
                className="hidden"
                type="file"
                required
              />
            </label>
          )}
        </div>
        <div className="my-5">
          <Input
            register={register("name", { required: true })}
            name="name"
            label="Name"
            type="text"
            required
          />
          <Input
            register={register("price", { required: true })}
            required
            name="price"
            label="Price"
            type="number"
            kind="price"
          />
        </div>
        <TextArea
          register={register("description", { required: true })}
          required
          placeholder="Write your product description..."
          name="description"
          label="Description"
        />
        <Button text={loading ? "Loading..." : "Upload Product"} />
      </form>
    </Layout>
  );
};

export default Upload;
