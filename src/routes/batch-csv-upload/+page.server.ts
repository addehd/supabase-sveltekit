import type { Actions } from '@sveltejs/kit';
import { checkAuthentication, createAudio } from '$lib/helper';

export const actions = {
    upload: async ({ request, locals }) => {

        const { supabaseClient, user } = await checkAuthentication(locals);
        
        try {
            const formData = await request.formData();
            const csvFile = formData.get('csv') as File | null;
            const wallName = formData.get('wallName') as string;
            const exhibitionNumber = formData.get('exhibitionNumber') as string;
            const room = formData.get('room') as string;

            // skip rows with artwork id
            const skip_rows = [34, 35, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54.];
            
            const csvText = await csvFile.text();
            const csvData = parseCsv(csvText);

            const results = {
                success: 0,
                skipped: 0,
                failed: 0,
                errors: []
            };

            for (const row of csvData) {
                // Skip specific artwork IDs
                if (row.artwork_id && skip_rows.includes(parseInt(row.artwork_id))) {
                    console.log(`Skipping row with ID ${row.artwork_id}: In skip list`);
                    results.skipped++;
                    continue;
                }

                // Skip rows with missing required fields
                if (!row.title) {
                    console.log(`Skipping row with ID ${row.artwork_id || 'unknown'}: Missing title`);
                    results.skipped++;
                    continue;
                }

                // get audio url from short description
                let audioUrl = '';
                if (row.short_description) {
                    const audioResponse = await createAudio(`artwork_${row.artwork_id || 'new'}`, row.short_description);
                    audioUrl = audioResponse.url;
                }

                const { data: artworkData, error: artworkError } = await supabaseClient
                    .from('artworks_test')
                    .upsert({
                        exhibitions_id: row.exhibitions_id ? parseInt(row.exhibitions_id) : parseInt(exhibitionNumber),
                        artwork_id: row.artwork_id ? parseInt(row.artwork_id) : null,
                        title: row.title,
                        artist_id: row.artist_id ? parseInt(row.artist_id) : null,
                        creation_year: row.creation_year ? parseInt(row.creation_year) : null,
                        medium: row.medium || null,
                        room: row.room || room || 'Unspecified',
                        description: row.description || null,
                        short_description: row.short_description || '',
                        image_url: row.image_url || null,
                        audio: audioUrl || '',
                        wall: row.wall || wallName || null,
                        order: row.order ? parseInt(row.order) : 0
                    }, {
                        onConflict: 'artwork_id'
                    });

                if (artworkError) {
                    // If it's a duplicate key error, just skip this row
                    if (artworkError.code === '23505') {
                        console.log(`Skipping duplicate: ${row.title} (${row.exhibitions_id || exhibitionNumber})`);
                        results.skipped++;
                    } else {
                        results.failed++;
                        results.errors.push(`Failed to upsert "${row.title}": ${artworkError.message}`);
                    }
                    continue; // Skip to next row instead of throwing
                }
                
                results.success++;
                console.log(`Successfully upserted: ${row.title}`);
            }
                
            return { 
                success: true, 
                results: results 
            };

        } catch (error) {
            console.error('Upload error:', error);
            return { 
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process upload' 
            };
        }
    }
} satisfies Actions;

export const load = async ({ locals }) => {
    const { supabaseClient, user } = await checkAuthentication(locals);
    
    const [artistsResponse, exhibitionsResponse] = await Promise.all([
        supabaseClient
            .from('artists')
            .select('*')
            .order('name'),
        supabaseClient
            .from('exhibitions')
            .select('exhibition_id, name')
            .order('name')
    ]);

    const { data: artists, error: artistsError } = artistsResponse;
    const { data: exhibitions, error: exhibitionsError } = exhibitionsResponse;

    if (artistsError || exhibitionsError) {
        console.error('Error fetching data:', artistsError || exhibitionsError);
        return { user, artists: [], exhibitions: [] };
    }

    return { 
        user,
        artists,
        exhibitions 
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
