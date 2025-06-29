import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data: notifications, error } = await supabase
      .from('Notification')
      .select('*');

    if (error) throw error;
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data: newNotification, error } = await supabase
      .from('Notification')
      .insert({
        ...body,
        date: new Date(body.date),
      })
      .single();

    if (error) throw error;
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
