import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.notification.deleteMany({});

  // Create demo suppliers
  const supplier1 = await prisma.supplier.create({
    data: { id: '1', name: 'Lácteos del Valle', phone: '555-0001', email: 'lacteos@example.com' },
  });
  const supplier2 = await prisma.supplier.create({
    data: { id: '2', name: 'Panadería Central', phone: '555-0002', email: 'panaderia@example.com' },
  });
  const supplier3 = await prisma.supplier.create({
    data: { id: '3', name: 'Frutas Frescas', phone: '555-0003', email: 'frutas@example.com' },
  });

  // Create demo products
  const productsData = [
    { id: '1', name: 'Leche Entera', entryDate: subDays(new Date(), 5), expirationDate: addDays(new Date(), 2), price: 2.5, stock: 15, type: 'Lácteos', image: '', qrCode: 'QR001', barcode: 'BAR001', supplierId: supplier1.id },
    { id: '2', name: 'Pan Integral', entryDate: subDays(new Date(), 2), expirationDate: addDays(new Date(), 3), price: 1.8, stock: 25, type: 'Panadería', image: '', qrCode: 'QR002', barcode: 'BAR002', supplierId: supplier2.id },
    { id: '3', name: 'Manzanas', entryDate: subDays(new Date(), 7), expirationDate: addDays(new Date(), 10), price: 3.2, stock: 40, type: 'Frutas', image: '', qrCode: 'QR003', barcode: 'BAR003', supplierId: supplier3.id },
    { id: '4', name: 'Yogurt Natural', entryDate: subDays(new Date(), 3), expirationDate: addDays(new Date(), 1), price: 1.5, stock: 8, type: 'Lácteos', image: '', qrCode: 'QR004', barcode: 'BAR004', supplierId: supplier1.id },
    { id: '5', name: 'Cereal', entryDate: subDays(new Date(), 10), expirationDate: addDays(new Date(), 60), price: 4.5, stock: 30, type: 'Abarrotes', image: '', qrCode: 'QR005', barcode: 'BAR005', supplierId: supplier2.id },
    { id: '6', name: 'Queso Fresco', entryDate: subDays(new Date(), 1), expirationDate: addDays(new Date(), 0), price: 5.0, stock: 5, type: 'Lácteos', image: '', qrCode: 'QR006', barcode: 'BAR006', supplierId: supplier1.id },
  ];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }

  // Create demo sales
  const demoSales = [];
  const allProducts = await prisma.product.findMany();
  for (let i = 0; i < 30; i++) {
    demoSales.push({
      productId: allProducts[Math.floor(Math.random() * allProducts.length)].id,
      quantity: Math.floor(Math.random() * 5) + 1,
      date: subDays(new Date(), Math.floor(Math.random() * 30)),
      type: Math.random() > 0.9 ? 'disposal' : 'sale'
    });
  }

  for (const sale of demoSales) {
    await prisma.sale.create({ data: sale });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
