import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data: sales, error } = await supabase
      .from('Sale')
      .select('*');

    if (error) throw error;
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data: newSale, error } = await supabase
      .from('Sale')
      .insert({
        ...body,
        date: new Date(body.date),
      })
      .single();

    if (error) throw error;
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
