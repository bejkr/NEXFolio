import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

const prisma = new PrismaClient();

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        // Delete the asset ensure it belongs to the user
        await prisma.userAsset.delete({
            where: {
                id: id,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API /api/collection/[id] DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete asset', details: error.message }, { status: 500 });
    }
}
