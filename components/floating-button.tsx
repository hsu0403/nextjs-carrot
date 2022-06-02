import Link from "next/link";
import React from "react";

interface FloatingButton {
  children: React.ReactNode;
  href: string;
}

export default function FloatingButton({ children, href }: FloatingButton) {
  return (
    <div className="max-w-lg w-full fixed bottom-36">
      <Link href={href}>
        <a className="absolute right-10 shadow-xl bg-orange-400 hover:bg-orange-600 transition-colors rounded-full p-4 text-white">
          {children}
        </a>
      </Link>
    </div>
  );
}
