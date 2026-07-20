import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * Guards every /studio route. Refreshes the Supabase session cookie on each
 * request, sends signed-out visitors to /studio/login, and keeps signed-in
 * users out of the login page.
 */
async function handleStudio(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLoginPage = request.nextUrl.pathname === "/studio/login";

  // Without credentials nothing can authenticate — keep the panel closed
  // and let the login page explain what's missing.
  if (!url || !anonKey) {
    return isLoginPage
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL("/studio/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/studio/login", request.url));
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }
  return response;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/studio")) {
    return handleStudio(request);
  }
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/studio/:path*"],
};
