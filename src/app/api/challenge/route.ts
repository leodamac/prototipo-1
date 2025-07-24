
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantName, participantLastName, participantRole, mail, telephone, mode } = body;
    console.log('Received data:', { participantName, participantLastName, participantRole, mail, telephone, mode });
    if (!participantName || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ChallengeSession')
      .insert({
        participantName,
        participantLastName,
        participantRole,
        mail,
        telephone,
        mode,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating challenge session:', errorMessage);
    return NextResponse.json({ error: 'Failed to create challenge session', details: errorMessage }, { status: 500 });
  }
}
