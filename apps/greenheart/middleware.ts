import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get('prototype-auth')
  const isAuthenticated = authCookie?.value === 'authenticated'
  
  // Allow access to the home page without auth
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Protect all other routes except public assets and Next.js internals
  if (!pathname.startsWith('/_next') && 
      !pathname.startsWith('/assets') && 
      !pathname.startsWith('/api') &&
      pathname !== '/favicon.ico') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle case-insensitive redirects for SEVIS-USER
  if (pathname === '/SEVIS-USER' || pathname.startsWith('/SEVIS-USER/')) {
    const newUrl = new URL(pathname.toLowerCase(), request.url)
    return NextResponse.redirect(newUrl, 308) // 308 is Permanent Redirect
  }

  if (pathname === '/Sevis-User' || pathname.startsWith('/Sevis-User/')) {
    const newUrl = new URL(pathname.toLowerCase(), request.url)
    return NextResponse.redirect(newUrl, 308)
  }

  // Redirect old /sevis routes to /sevis-user
  if (pathname === '/sevis' || pathname.startsWith('/sevis/')) {
    // Don't redirect /sevis/sevis to avoid loops
    if (pathname === '/sevis/sevis-view' || pathname.startsWith('/sevis/sevis-view/')) {
      const parts = pathname.split('/sevis/sevis-view')
      const newPath = '/sevis-user/sevis' + (parts[1] || '')
      const newUrl = new URL(newPath, request.url)
      return NextResponse.redirect(newUrl, 308)
    } else {
      const newPath = pathname.replace('/sevis', '/sevis-user')
      const newUrl = new URL(newPath, request.url)
      return NextResponse.redirect(newUrl, 308)
    }
  }

  // Handle legacy uppercase paths for backward compatibility
  if (pathname === '/SEVIS' || pathname.startsWith('/SEVIS/')) {
    const newPath = pathname.toLowerCase().replace('/sevis', '/sevis-user')
    const newUrl = new URL(newPath, request.url)
    return NextResponse.redirect(newUrl, 308)
  }

  if (pathname === '/Sevis' || pathname.startsWith('/Sevis/')) {
    const newPath = pathname.toLowerCase().replace('/sevis', '/sevis-user')
    const newUrl = new URL(newPath, request.url)
    return NextResponse.redirect(newUrl, 308)
  }

  return NextResponse.next()
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 