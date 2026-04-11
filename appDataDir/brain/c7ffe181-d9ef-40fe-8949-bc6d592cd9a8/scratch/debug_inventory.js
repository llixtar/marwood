const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProducts() {
  console.log('Checking products...');
  const { data, error } = await supabase
    .from('products')
    .select('id, sku, stock_by_size, sizes')
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Sample Products:');
  data.forEach(p => {
    console.log(`ID: ${p.id} (Type: ${typeof p.id}), SKU: ${p.sku}, Stock: ${JSON.stringify(p.stock_by_size)}, Sizes: ${JSON.stringify(p.sizes)}`);
  });

  const testId = data[0].id;
  console.log(`\nTesting update for ID: ${testId}`);
  const { data: updateData, error: updateError } = await supabase
    .from('products')
    .update({ stock_by_size: { 'S': 99 } })
    .eq('id', testId)
    .select();

  if (updateError) {
    console.error('Update Error:', updateError);
  } else {
    console.log('Update Success:', updateData);
  }
}

checkProducts();
