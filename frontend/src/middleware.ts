import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // If root path, redirect based on auth
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/feed", request.url));
    } else {
      return NextResponse.redirect(new URL("/signup", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};