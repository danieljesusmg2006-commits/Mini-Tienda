import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("mini_store_auth")?.value;
  const isAuthenticated = authCookie === "authenticated";

  // Check admin routes protection
  if (pathname.startsWith("/admin")) {
    const isLoginRoute = pathname === "/admin/login";

    // If trying to access admin pages while unauthenticated -> redirect to /admin/login
    if (!isAuthenticated && !isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // If trying to access /admin/login while already authenticated -> redirect to /admin
    if (isAuthenticated && isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
