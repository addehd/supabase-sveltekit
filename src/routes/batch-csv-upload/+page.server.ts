import type { Actions } from '@sveltejs/kit';
import { checkAuthentication } from '$lib/helper';

export const actions = {
    upload: async ({ request, locals }) => {
        try {
            const formData = await request.formData();
            const csvFile = formData.get('csv') as File | null;
            const wallName = formData.get('wallName') as string;
            const exhibitionNumber = formData.get('exhibitionNumber') as string;
            const room = formData.get('room') as string;

            const { supabaseClient, user } = await checkAuthentication(locals);

            if (csvFile) {
                const csvText = await csvFile.text();
                const csvData = parseCsv(csvText);
                
                // process each csv row
                for (const row of csvData) {
                    // first create or update artist
                    const { data: artistData, error: artistError } = await supabaseClient
                        .from('artists')
                        .upsert({
                            name: row.artist_name || '',
                            bio: row.artist_bio || null,
                            birth_year: row.birth_year ? parseInt(row.birth_year) : null,
                            nationality: row.nationality || null,
                            exhibitions: parseInt(exhibitionNumber)
                        }, { onConflict: 'name' });

                    if (artistError) {
                        console.error('Error upserting artist:', artistError);
                        throw artistError;
                    }

                    // then create artwork with artist reference
                    const { data, error } = await supabaseClient
                        .from('artworks')
                        .upsert({
                            id: parseInt(row.id) || null,
                            title: row.name || '',
                            artist_name: row.artist_name || '',
                            exhibitions_id: parseInt(exhibitionNumber),
                            description: row.description || null,
                            wall: row.wall || wallName || null,
                            room: row.room || room,
                            has_image: row.has_image === 'true',
                            image_file: row.image_file || null
                        });

                    if (error) {
                        console.error('Error upserting artwork:', error);
                        throw error;
                    }
                }
                
                return { success: true };
            }
            
            return { error: 'No CSV file provided' };

        } catch (error) {
            console.error('Upload error:', error);
            return { error: 'Failed to process upload' };
        }
    }
} satisfies Actions;

export const load = async ({ locals }) => {
    const { supabaseClient, user } = await checkAuthentication(locals);
    
    // fetch artists from supabase
    const { data: artists, error } = await supabaseClient
        .from('artists')
        .select('*')
        .order('name');

    if (error) {
        // handle error appropriately
        console.error('Error fetching artists:', error);
        return { user, artists: [] };
    }

    return { 
        user,
        artists 
    };
};

// helper function to parse CSV
function parseCsv(csvText: string) {
    // split by newline but handle quoted fields containing newlines
    const lines = csvText.split(/\r?\n(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g) || [];
            const entry: Record<string, string> = {};
            
            headers.forEach((header, index) => {
                let value = values[index]?.replace(/^,/, '') || '';
                // remove quotes and handle escaped quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1).replace(/""/g, '"');
                }
                entry[header] = value.trim();
            });
            
            return entry;
        });
}