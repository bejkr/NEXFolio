import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'lib', 'settings.json');

export async function GET(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ activeStoreIds: ['ebay', 'alza', 'sparky'] });
    }
}

export async function POST(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    try {
        const { activeStoreIds } = await req.json();

        if (!Array.isArray(activeStoreIds)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const settings = { activeStoreIds };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));

        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
