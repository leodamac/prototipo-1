import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnnufiqlxnvrmfbkyzcz.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await supabase.from('Sale').delete().neq('id', '0');
  await supabase.from('Product').delete().neq('id', '0');
  await supabase.from('Supplier').delete().neq('id', '0');
  await supabase.from('Notification').delete().neq('id', '0');

  // Create demo suppliers
  const { error: error1 } = await supabase.from('Supplier').insert({ id: '1', name: 'Lácteos del Valle', phone: '555-0001', email: 'lacteos@example.com' });
  if (error1) { console.error('Error inserting supplier1:', error1); throw error1; }
  const { data: supplier1, error: fetchError1 } = await supabase.from('Supplier').select('*').eq('id', '1').single();
  if (fetchError1) { console.error('Error fetching supplier1 after insert:', fetchError1); throw fetchError1; }
  if (!supplier1) { console.error('Supplier1 data is null after insert and fetch.'); throw new Error('Supplier1 insert returned null data.'); }
  console.log('Created supplier1:', supplier1);

  const { error: error2 } = await supabase.from('Supplier').insert({ id: '2', name: 'Panadería Central', phone: '555-0002', email: 'panaderia@example.com' });
  if (error2) { console.error('Error inserting supplier2:', error2); throw error2; }
  const { data: supplier2, error: fetchError2 } = await supabase.from('Supplier').select('*').eq('id', '2').single();
  if (fetchError2) { console.error('Error fetching supplier2 after insert:', fetchError2); throw fetchError2; }
  if (!supplier2) { console.error('Supplier2 data is null after insert and fetch.'); throw new Error('Supplier2 insert returned null data.'); }
  console.log('Created supplier2:', supplier2);

  const { error: error3 } = await supabase.from('Supplier').insert({ id: '3', name: 'Frutas Frescas', phone: '555-0003', email: 'frutas@example.com' });
  if (error3) { console.error('Error inserting supplier3:', error3); throw error3; }
  const { data: supplier3, error: fetchError3 } = await supabase.from('Supplier').select('*').eq('id', '3').single();
  if (fetchError3) { console.error('Error fetching supplier3 after insert:', fetchError3); throw fetchError3; }
  if (!supplier3) { console.error('Supplier3 data is null after insert and fetch.'); throw new Error('Supplier3 insert returned null data.'); }
  console.log('Created supplier3:', supplier3);

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
    const { error } = await supabase.from('Product').insert(product);
    if (error) throw error;
    console.log('Inserted product:', product.name);
  }

  // Create demo sales
  const demoSales = [];
  const { data: allProducts, error: productsError } = await supabase.from('Product').select('id');
  if (productsError) throw productsError;
  console.log('Fetched products for sales:', allProducts);

  for (let i = 0; i < 30; i++) {
    demoSales.push({
      id: uuidv4(), // Generate a unique ID for each sale
      productId: allProducts[Math.floor(Math.random() * allProducts.length)].id,
      quantity: Math.floor(Math.random() * 5) + 1,
      date: subDays(new Date(), Math.floor(Math.random() * 30)),
      type: Math.random() > 0.9 ? 'disposal' : 'sale'
    });
  }

  for (const sale of demoSales) {
    const { error } = await supabase.from('Sale').insert(sale);
    if (error) throw error;
  }

  console.log('All data operations completed.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e.message || e.code || e.details || e.hint || e);
    process.exit(1);
  })
  .finally(async () => {
    // No need to disconnect Supabase client
  });
