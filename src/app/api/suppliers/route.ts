import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { id } from 'date-fns/locale';

export async function GET() {
  try {
    const { data: suppliers, error } = await supabase
      .from('Supplier')
      .select('*, Product(*)'); // Assuming 'Product' is the related table name in Supabase

    if (error) throw error;
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email } = body;
    const supplierData = { name, phone, email, id };

    const { data, error } = await supabase
      .from('Supplier')
      .insert(supplierData)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
