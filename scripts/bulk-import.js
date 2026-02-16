import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env file manually since we might not have dotenv
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) {
            console.warn('Warning: .env file not found at', envPath);
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.length > 0 && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value.trim();
            }
        });
        return env;
    } catch (error) {
        console.error('Error loading .env:', error);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function bulkImport() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.log('Usage: node scripts/bulk-import.js <path-to-json-file>');
        process.exit(1);
    }

    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    try {
        console.log(`Reading file: ${filePath}...`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let movies = JSON.parse(fileContent);

        // Handle if the JSON is wrapped in an object key like "movies"
        if (!Array.isArray(movies) && movies.movies && Array.isArray(movies.movies)) {
            movies = movies.movies;
        }

        if (!Array.isArray(movies)) {
            throw new Error('JSON file must contain an array of movies/series.');
        }

        console.log(`Found ${movies.length} items. Preparing for upload...`);

        // Transform data to match DB schema
        const formattedMovies = movies.map(m => {
            const movie = {
                id: m.id,
                title: m.title,
                type: m.type || 'movie',
                status: m.status || 'published',
                year: m.year,
                rating: m.rating,
                category: m.category,
                description: m.description,
                "frontImage": m.frontImage,
                "backImage": m.backImage,
                certification: m.certification,
                duration: m.duration,
                "watchLink": m.watchLink,
                "top10": m.top10 || false,
                "isNewRelease": m.isNewRelease || false,
                "isPopular": m.isPopular || false,
                featured: m.featured || false,
                director: m.director,
                writers: m.writers, // JSONB
                cast: m.cast,       // JSONB
                awards: m.awards,   // JSONB
                language: m.language,
                country: m.country,
                "releaseDate": m.releaseDate,
                seasons: m.seasons, // JSONB
                updated_at: new Date().toISOString()
            };

            // Remove undefined keys to avoid sending nulls or overwriting with defaults
            Object.keys(movie).forEach(key => movie[key] === undefined && delete movie[key]);

            return movie;
        });

        console.log('Supabase URL:', SUPABASE_URL ? 'Found' : 'Not Found');
        console.log('Supabase Key:', SUPABASE_ANON_KEY ? 'Found' : 'Not Found');

        console.log('Uploading to Supabase...');

        // Upsert data
        const { data, error } = await supabase
            .from('movies')
            .upsert(formattedMovies, { onConflict: 'id', ignoreDuplicates: false })
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        console.log(`Successfully uploaded/updated ${formattedMovies.length} items!`);

    } catch (err) {
        console.error('Error during import:', err);
        process.exit(1);
    }
}

bulkImport();
