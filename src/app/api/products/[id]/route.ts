import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { data: updatedProduct, error } = await supabase
      .from('Product')
      .update(body)
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
