const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    const result = {
        url: supabaseUrl,
        hasKey: supabaseKey !== 'missing',
        error: error,
        columns: data && data[0] ? Object.keys(data[0]) : 'no data'
    };
    fs.writeFileSync('c:/llixtar/WORK/marwood/marwood/debug_columns.json', JSON.stringify(result, null, 2));
}

inspect();
