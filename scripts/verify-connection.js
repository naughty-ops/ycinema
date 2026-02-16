
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env file manually
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) return {};
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value.trim();
            }
        });
        return env;
    } catch (error) {
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? '******' : 'Missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
    console.log('--- Verifying Movies Table ---');
    const { data: movies, error: movieError } = await supabase.from('movies').select('*').limit(5);
    if (movieError) {
        console.error('Error fetching movies:', movieError);
    } else {
        console.log(`Success! Found ${movies.length} movies.`);
        if (movies.length > 0) {
            console.log('Sample Movie:', movies[0].title);
        }
    }

    console.log('\n--- Verifying Homepage Config ---');
    const { data: config, error: configError } = await supabase.from('homepage_config').select('*').limit(1);
    if (configError) {
        console.error('Error fetching config:', configError);
    } else {
        console.log(`Success! Found ${config.length} config entries.`);
    }
}

verify();
