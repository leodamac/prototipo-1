import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('Product')
      .select(`
        *,
        supplier:Supplier (*)
      `);

    if (error) throw error;
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, supplier, sales, ...productData } = body; // Exclude id and relations
    const { data, error } = await supabase
      .from('Product')
      .insert({
        ...productData,
        entryDate: new Date(productData.entryDate),
        expirationDate: new Date(productData.expirationDate),
      })
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
