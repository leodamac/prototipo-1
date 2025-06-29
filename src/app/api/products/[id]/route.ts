import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { supplier, sales, ...productData } = body; // Exclude relations
    const { data: updatedProduct, error } = await supabase
      .from('Product')
      .update(productData)
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
