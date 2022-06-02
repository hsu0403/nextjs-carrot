import type { NextPage } from "next";
import Layout from "@components/layout";
import Message from "@components/message";
import useSWR from "swr";
import { useRouter } from "next/router";
import { LiveProduct } from "@prisma/client";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";

interface LiveMessage {
  message: string;
  id: number;
  user: {
    avatar?: string;
    id: number;
  };
}

interface LiveProductWithMessages extends LiveProduct {
  messages: LiveMessage[];
}

interface LiveResponse {
  ok: boolean;
  liveProduct: LiveProductWithMessages;
}

interface MessageForm {
  message: string;
}

const LiveDetail: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<MessageForm>();
  const { data, mutate } = useSWR<LiveResponse>(
    router.query.id ? `/api/lives/${router.query.id}` : null,
    {
      refreshInterval: 1000,
    }
  );
  const [sendMessage, { loading, data: sendMessageData }] = useMutation(
    `/api/lives/${router.query.id}/messages`
  );
  const onValid = (form: MessageForm) => {
    if (loading) return;
    reset();
    mutate(
      (prev) =>
        prev &&
        ({
          ...prev,
          liveProduct: {
            ...prev.liveProduct,
            messages: [
              ...prev.liveProduct.messages,
              { id: Date.now(), message: form.message, user: { ...user } },
            ],
          },
        } as any),
      false
    );
    sendMessage(form);
  };

  return (
    <Layout seoTitle={`${data?.liveProduct.name}`} canGoBack>
      <div className="px-6 space-y-3">
        <iframe
          className="w-full aspect-video rounded-md shadow-sm"
          src={`https://iframe.videodelivery.net/${data?.liveProduct.cloudflareId}`}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        ></iframe>
        <div className="mt-5">
          <h1 className="text-3xl font-bold text-gray-900">
            {!data ? "Loading..." : data.liveProduct?.name}
          </h1>
          <span className="text-2xl block mt-3 text-gray-900">
            ${!data ? "Loading..." : data.liveProduct?.price}
          </span>
          <p className=" my-6 text-gray-700">
            {!data ? "Loading..." : data.liveProduct?.description}
          </p>
          <div className="bg-orange-400 p-5 rounded-md overflow-scroll flex flex-col space-y-3">
            <span>LiveProduct Keys (secret)</span>
            <span className="text-white">
              <span className="font-medium text-gray-800">URL:</span>{" "}
              {data?.liveProduct?.cloudflareUrl}
            </span>
            <span className="text-white">
              <span className="font-medium text-gray-800">Key:</span>{" "}
              {data?.liveProduct?.cloudflareKey}
            </span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Chat</h2>
          <div className="py-10 pb-16 h-[50vh] scrollbar-hide overflow-y-scroll  px-4 space-y-4">
            {data?.liveProduct?.messages.map((message) => (
              <Message
                key={message.id}
                message={message.message}
                reversed={message.user?.id === user?.id}
              />
            ))}
          </div>
          <div className="fixed w-full mx-auto max-w-md bottom-3 inset-x-0">
            <form
              onSubmit={handleSubmit(onValid)}
              className="flex items-center relative"
            >
              <input
                {...register("message", { required: true })}
                type="text"
                className="shadow-sm rounded-full w-full pr-12 border-gray-400 focus:ring-orange-500 focus:outline-none focus:border-orange-500"
              />
              <div className="absolute flex py-1.5 pr-1.5 right-0 inset-y-0">
                <button className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 hover:bg-orange-700 rounded-full px-3 text-sm text-white">
                  &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveDetail;
