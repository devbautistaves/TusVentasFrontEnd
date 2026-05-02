import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Check if the request is coming from grupojv.tusventas.digital
  if (hostname.includes('grupojv.tusventas.digital') || hostname.includes('grupojv.')) {
    // If accessing the root or /login, rewrite to /grupojv/login (URL stays the same in browser)
    if (url.pathname === '/' || url.pathname === '' || url.pathname === '/login') {
      url.pathname = '/grupojv/login'
      return NextResponse.rewrite(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
