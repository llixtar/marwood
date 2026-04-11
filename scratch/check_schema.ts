import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'products' });
  if (error) {
    // If RPC doesn't exist, try a simple select
    const { data: sample, error: selectError } = await supabase.from('products').select('*').limit(1);
    if (selectError) {
      console.error(selectError);
    } else {
      console.log('Sample product:', sample[0]);
      console.log('Columns:', Object.keys(sample[0] || {}));
    }
  } else {
    console.log(data);
  }
}

checkSchema();
