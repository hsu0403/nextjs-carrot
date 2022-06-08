import type { NextPage } from "next";

import Layout from "@components/layout";
import Message from "@components/message";
import useSWR from "swr";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ChatRoom, ChatRoomMessage, Product } from "@prisma/client";
import useUser from "@libs/client/useUser";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";

interface ChatRoomMessageWithUser extends ChatRoomMessage {
  id: number;
  userId: number;
  message: string;
  user: {
    avatar: string;
  };
}

interface chatRoomMessageResponse {
  ok: boolean;
  chatRoomMessages: ChatRoomMessageWithUser[];
  product: Product;
  exsistChatRoom: ChatRoom;
}

interface MessageForm {
  message: string;
}

interface PurchaseResponse {
  ok: boolean;
}

const ChatDetail: NextPage = () => {
  const { register, reset, handleSubmit } = useForm<MessageForm>();
  const { user } = useUser();
  const router = useRouter();
  const { chatName } = router.query;
  const [otherUser, setOtherUser] = useState<string>();
  const { data, mutate } = useSWR<chatRoomMessageResponse>(
    router.query.id ? `/api/chats/${router.query.id}` : null,
    {
      refreshInterval: 1000,
    }
  );
  const [sendMessage, { loading, data: sendMessageData }] = useMutation(
    `/api/chats/${router.query.id}/messages`
  );
  const [
    confirmPurchase,
    { loading: purchaseLoading, data: confirmPurchaseData },
  ] = useMutation<PurchaseResponse>(
    `/api/chats/${router.query.id}/confirmPurchase`
  );
  const [confirmSale, { loading: saleLoading }] = useMutation(
    `/api/chats/${router.query.id}/confirmSale`
  );
  useEffect(() => {
    if (!chatName) return;
    setOtherUser(JSON.parse(chatName.toString()));
    if (data?.ok === false) {
      router.replace("/");
    }
  }, [data, router, chatName]);

  const onValid = (form: MessageForm) => {
    if (loading) return;
    reset();
    mutate(
      (prev) =>
        prev &&
        ({
          ...prev,
          chatRoomMessages: [
            ...prev.chatRoomMessages,
            {
              id: Date.now(),
              message: form.message,
              user: { ...user },
              userId: user?.id,
            },
          ],
        } as any),
      false
    );
    sendMessage(form);
  };

  const onConfirmPurchase = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (purchaseLoading) return;
    confirmPurchase({ productId: event.currentTarget.name });
  };

  const onConfirmSale = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (saleLoading) return;
    confirmSale({ productId: event.currentTarget.name });
  };

  useEffect(() => {
    if (confirmPurchaseData?.ok === true) {
      router.push(`/users/review/${data?.exsistChatRoom?.createdForId}`);
    }
  }, [confirmPurchaseData, router, data]);

  return (
    <Layout
      seoTitle={
        (otherUser && `${otherUser}'s ChatRoom`) ||
        `${data?.product?.name}'s ChatRoom`
      }
      canGoBack
      title={(otherUser && `${otherUser}`) || `${data?.product?.name}`}
    >
      <div className="mb-12">
        {data?.exsistChatRoom?.createdById === user?.id &&
          (data?.product?.purchaseCheck ? (
            data.product?.saleCheck ? (
              <span className="text-white text-center top-12 max-w-xl w-full fixed bg-orange-500 rounded-md p-1">
                구매 완료
              </span>
            ) : (
              <span className="text-white text-center top-12 max-w-xl w-full fixed bg-orange-500 rounded-md p-1">
                구매중...ㄱㄷㄱㄷ
              </span>
            )
          ) : (
            <button
              name={data?.exsistChatRoom.productId + ""}
              onClick={onConfirmPurchase}
              className="top-12 max-w-xl w-full fixed bg-orange-500 hover:bg-orange-600 rounded-md text-white p-1"
            >
              구매 확정
            </button>
          ))}
        {data?.exsistChatRoom?.createdForId === user?.id &&
          (data?.product?.purchaseCheck ? (
            data?.product?.saleCheck ? (
              <span className="text-white text-center top-12 max-w-xl w-full fixed bg-orange-500 rounded-md p-1">
                판매 완료
              </span>
            ) : (
              <button
                name={data?.exsistChatRoom.productId + ""}
                onClick={onConfirmSale}
                className="top-12 max-w-xl w-full fixed bg-orange-500 hover:bg-orange-600 rounded-md text-white p-1"
              >
                판매 확정
              </button>
            )
          ) : (
            ""
          ))}
      </div>
      <div className="px-6 space-y-4 pb-16">
        {data?.chatRoomMessages.map((message) => (
          <Message
            key={message.id}
            message={message.message}
            reversed={message.userId === user?.id}
            avatarUrl={message.user.avatar}
          />
        ))}
        {data?.product.saleCheck === true ? (
          <span className="text-center fixed py-2 text-red-500 bottom-0 inset-x-0">
            == 대화 종료 ==
          </span>
        ) : (
          <form
            onSubmit={handleSubmit(onValid)}
            className="fixed py-2 bg-white  bottom-0 inset-x-0"
          >
            <div className="flex relative max-w-md items-center  w-full mx-auto">
              <input
                {...register("message", { required: true })}
                type="text"
                className="shadow-sm rounded-full w-full border-gray-300 focus:ring-orange-500 focus:outline-none pr-12 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 flex py-1.5 pr-1.5 right-0">
                <button className="flex focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 items-center bg-orange-500 rounded-full px-3 hover:bg-orange-600 text-sm text-white">
                  &rarr;
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ChatDetail;
