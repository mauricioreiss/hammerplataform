import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAlunoRoute = pathname.startsWith("/aluno");
  const isLoginRoute = pathname === "/login";

  // Logged-in user on /login → redirect to dashboard
  if (user && isLoginRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const url = request.nextUrl.clone();

    if (role === "admin") {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (role === "student") {
      url.pathname = "/aluno";
      return NextResponse.redirect(url);
    }
  }

  // Not authenticated on protected route → redirect to /login
  if (!user && (isAdminRoute || isAlunoRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && (isAdminRoute || isAlunoRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "student" ? "/aluno" : "/login";
      return NextResponse.redirect(url);
    }

    if (isAlunoRoute && role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/aluno/:path*", "/login"],
};
