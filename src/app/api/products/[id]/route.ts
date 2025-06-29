import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { supplier, sales, ...productData } = body; // Exclude relations
    const { data, error } = await supabase
      .from('Product')
      .update({
        ...productData,
        ...(productData.entryDate && { entryDate: new Date(productData.entryDate) }),
        ...(productData.expirationDate && { expirationDate: new Date(productData.expirationDate) }),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { error } = await supabase
      .from('Product')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
