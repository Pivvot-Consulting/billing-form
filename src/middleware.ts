import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isOperatorRoute = req.nextUrl.pathname.startsWith('/operator');
  const isLoginPage = req.nextUrl.pathname === '/operator/login';

  // Si es una ruta de operador (excepto login) y NO está autenticado
  if (isOperatorRoute && !isLoginPage && !session) {
    const redirectUrl = new URL('/operator/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si está autenticado y trata de acceder al login, redirigir al dashboard
  if (isLoginPage && session) {
    const redirectUrl = new URL('/operator/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configurar qué rutas debe proteger el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
