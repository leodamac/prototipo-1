import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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
    const { data: newSupplier, error } = await supabase
      .from('Supplier')
      .insert(body)
      .single();

    if (error) throw error;
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
