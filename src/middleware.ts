import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname === "/onboarding";
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("auth-token"));

  // Fast path: if no auth cookie, avoid expensive auth roundtrip.
  if (!hasAuthCookie) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isProtectedRoute) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin route protection
  if (isAdminRoute) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !user || user.email !== adminEmail) {
      // Silent redirect to home — don't reveal admin page exists
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 1. Protected Routes
  if (isProtectedRoute) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // 2. Prevent logged in users from visiting auth pages
  if (isAuthRoute && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/onboarding",
    "/admin/:path*",
  ],
};
