import type { NextRequest, NextFetchEvent } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.ua?.isBot) {
    return new Response("Plz don't be a bot. Be human.", { status: 403 });
  }

  if (!req.url.includes("/api")) {
    if (!req.url.includes("/enter") && !req.cookies.carrotsession) {
      // const url = req.nextUrl.clone();
      // url.pathname = "/enter";
      // return NextResponse.redirect(url);
      return NextResponse.redirect(
        new URL(`${req.nextUrl.origin}/enter`, req.url)
      );
    }
    if (req.cookies.carrotsession && req.url.includes("/enter")) {
      return NextResponse.redirect(new URL(`${req.nextUrl.origin}`, req.url));
    }
  }
}
