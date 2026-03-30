import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const challengeCode = request.nextUrl.searchParams.get('challenge_code');

    if (!challengeCode) {
        return new Response('OK', { status: 200 });
    }

    const verificationToken = process.env.EBAY_VERIFICATION_TOKEN;
    const endpoint = process.env.EBAY_NOTIFICATION_ENDPOINT;

    if (!verificationToken || !endpoint) {
        console.error('Missing eBay verification configuration');
        return new Response('Missing configuration', { status: 500 });
    }

    // eBay requires hashing (challengeCode + verificationToken + endpoint)
    const hash = createHash('sha256');
    hash.update(challengeCode);
    hash.update(verificationToken);
    hash.update(endpoint);
    const responseHash = hash.digest('hex');

    return NextResponse.json({
        challengeResponse: responseHash
    });
}

export async function POST(req: Request) {
    // This is where real notifications will arrive
    return new Response('OK', { status: 200 });
}
