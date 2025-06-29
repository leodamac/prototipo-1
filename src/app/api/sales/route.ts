import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: sales, error } = await supabase
      .from('Sale')
      .select(`
        *,
        product:Product(*)
      `);

    if (error) throw error;
    return NextResponse.json(sales);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching sales:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch sales', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, type, unitPrice } = body;

    if (!productId || !quantity || !type || unitPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Iniciar transacción
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const newStock = product.stock - quantity;

    // Crear el registro de venta
    const { data: saleData, error: saleError } = await supabase
      .from('Sale')
      .insert({
        productId,
        quantity,
        type,
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (saleError) {
      throw saleError;
    }

    // Actualizar el stock del producto
    const { data: updatedProduct, error: updateError } = await supabase
      .from('Product')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      // Si la actualización del producto falla, intentar revertir la venta (opcional pero recomendado)
      // En un sistema real, aquí se manejaría la reversión.
      // Por simplicidad, aquí solo lanzamos el error.
      throw updateError;
    }

    return NextResponse.json(saleData, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating sale:', errorMessage);
    return NextResponse.json({ error: 'Failed to create sale', details: errorMessage }, { status: 500 });
  }
}
