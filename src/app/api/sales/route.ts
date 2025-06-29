import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const { product, ...saleData } = body; // Exclude relation
    const { data, error } = await supabase
      .from('Sale')
      .insert({
        ...saleData,
        date: new Date(saleData.date),
      })
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
