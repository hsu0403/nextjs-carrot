import Layout from "@components/layout";
import { ChatRoom, ChatRoomMessage } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import useSWR from "swr";
import useUser from "@libs/client/useUser";
import Image from "next/image";

interface ChatRoomMessageWithM extends ChatRoomMessage {
  message: string;
}

interface ChatRoomWithUser extends ChatRoom {
  id: number;
  createBy: {
    id: number;
    name: string;
    avatar: string;
  };
  createdFor: {
    id: number;
    name: string;
    avatar: string;
  };
  product: {
    name: string;
  };
  chatRoomMessage: ChatRoomMessageWithM[];
}

interface ChatRooms {
  ok: boolean;
  chatRooms: ChatRoomWithUser[];
}

const Chats: NextPage = () => {
  const { user } = useUser();
  const { data } = useSWR<ChatRooms>("/api/chats");
  return (
    <Layout seoTitle={`${user?.name}'s Chats`} title="채팅" hasTabBar>
      <div className="px-6 divide-y-2">
        {data?.chatRooms?.map((room) => (
          <Link
            href={{
              pathname: `chats/[id]`,
              query: {
                chatName: JSON.stringify(room.product.name),
              },
            }}
            as={`chats/${room.id}`}
            key={room.id}
          >
            <a className="flex cursor-pointer py-3 items-center space-x-3">
              {user?.id === room.createBy?.id ? (
                room.createdFor?.avatar !== null ? (
                  <Image
                    src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${room.createdFor.avatar}/avatar`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full bg-slate-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-300" />
                )
              ) : room.createBy?.avatar !== null ? (
                <Image
                  src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${room.createBy.avatar}/avatar`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full bg-slate-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-300" />
              )}
              <div>
                <p className="text-gray-700">
                  {user?.id === room.createBy?.id
                    ? room.createdFor?.name
                    : room.createBy?.name}
                  {`'s ${room.product.name}`}
                </p>
                <p className="text-sm text-gray-500">
                  {room.chatRoomMessage[0]?.message}
                </p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default Chats;
