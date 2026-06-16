import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isPublicApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/docs");

  if (isPublicApi) {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
