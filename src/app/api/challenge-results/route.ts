import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: challengeSessions, error } = await supabase
      .from('ChallengeSession')
      .select('*')
      .not('comments', 'is', null)
      .order('startTime', { ascending: false });

    if (error) throw error;
    return NextResponse.json(challengeSessions);
  } catch (error) {
    console.error('Error fetching challenge sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge sessions' }, { status: 500 });
  }
}
