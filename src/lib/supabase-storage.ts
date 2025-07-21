import { supabase } from './supabase';

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('product-images') // Replace with your bucket name
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not get public URL for uploaded image.');
  }

  return publicUrlData.publicUrl;
};