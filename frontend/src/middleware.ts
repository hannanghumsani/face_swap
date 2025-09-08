import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith("/_next/") || // Next.js static files
        pathname.startsWith("/static/") || // Public static files
        pathname.startsWith("/favicon.ico") || // Favicon
        pathname.startsWith("/logo.svg") || // Any other static assets
        pathname.startsWith("/api/") // API routes
    ) {
        return NextResponse.next();
    }

    if (pathname === "/" || pathname === "/register") {
        if (token) {
            return NextResponse.redirect(new URL("/detail", req.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/((?!_next/static|_next/image|favicon.ico|logo.svg).*)",
};
