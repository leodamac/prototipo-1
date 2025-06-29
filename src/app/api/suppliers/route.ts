import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const { products, ...supplierData } = body; // Destructure to exclude products
    const { data: newSupplier, error } = await supabase
      .from('Supplier')
      .insert(supplierData)
      .single();

    if (error) throw error;
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
