
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { comments } = body;

    const { data, error } = await supabase
      .from('ChallengeSession')
      .update({
        endTime: new Date(),
        comments,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating challenge session ${id}:`, errorMessage);
    return NextResponse.json({ error: 'Failed to update challenge session', details: errorMessage }, { status: 500 });
  }
}
