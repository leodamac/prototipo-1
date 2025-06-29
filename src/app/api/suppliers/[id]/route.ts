import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { data: updatedSupplier, error } = await supabase
      .from('Supplier')
      .update(body)
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { error } = await supabase
      .from('Supplier')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
