import Image from "next/image";
import { cls } from "../libs/client/utils";

interface MessageProps {
  message: string;
  reversed?: boolean;
  avatarUrl?: string;
}

export default function Message({
  message,
  reversed,
  avatarUrl,
}: MessageProps) {
  return (
    <div
      className={cls(
        "flex items-start space-x-2 -z-10",
        reversed ? "flex-row-reverse space-x-reverse" : ""
      )}
    >
      {avatarUrl !== null ? (
        <Image
          height={48}
          width={48}
          src={`https://imagedelivery.net/JCL3J8XgW7eVfzwyrjWhSQ/${avatarUrl}/avatar`}
          className="-z-10 w-8 h-8 rounded-full bg-slate-300"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-300" />
      )}
      <div className="w-1/2 text-sm text-gray-700 p-2 border border-gray-300 rounded-md">
        <p>{message}</p>
      </div>
    </div>
  );
}
