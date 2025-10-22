// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// 1. Get the username and password from our Vercel Environment Variables
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS;

export function middleware(req: NextRequest) {
    // 2. If auth isn't set up in Vercel, skip protection
    if (!BASIC_AUTH_USER || !BASIC_AUTH_PASS) {
        return NextResponse.next();
    }

    // 3. Get the auth header from the user's request
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        // 4. Decode the header and check if the credentials match
        const authValue = basicAuth.split(' ')[1];
        // atob() decodes Base64
        const [user, pass] = atob(authValue).split(':');

        if (user === BASIC_AUTH_USER && pass === BASIC_AUTH_PASS) {
            // If they match, let them see the page
            return NextResponse.next();
        }
    }

    // 5. If they fail, show the login prompt
    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

// This tells the middleware to ONLY protect the /stats page
export const config = {
    matcher: '/stats',
};