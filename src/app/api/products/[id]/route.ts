import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
