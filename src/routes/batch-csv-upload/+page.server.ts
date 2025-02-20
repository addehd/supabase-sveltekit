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
            
            const csvText = await csvFile.text();
            const csvData = parseCsv(csvText);
                
            for (const row of csvData) {

                const { data: existingArtist } = await supabaseClient
                    .from('artists')
                    .select('artist_id, name')
                    .eq('name', row.artist_name)
                    .single();

                // if artist exists, update, otherwise insert
                const { data: artistData, error: artistError } = await supabaseClient
                    .from('artists')
                    .upsert({
                        artist_id: existingArtist?.artist_id,
                        name: row.artist_name || '',
                        bio: row.artist_bio || null,
                        birth_year: row.birth_year ? parseInt(row.birth_year) : null,
                        nationality: row.nationality || null,
                        exhibitions: parseInt(exhibitionNumber)
                    }, { 
                        onConflict: 'artist_id'
                    })
                    .select('artist_id');

                // get audio url from short description
                let audioUrl = '';
                if (row.short_description) {

                    const audioResponse = await createAudio( `artwork_${row.id || 'new'}`, row.short_description );
                    audioUrl = audioResponse.url;
        
                }

                const { data: artworkData, error: artworkError } = await supabaseClient
                    .from('artworks_test')
                    .upsert({
                        artwork_id: parseInt(row.id) || null,
                        title: row.name|| 'hello' + Math.floor(Math.random() * 100),
                        artist_id: row.id || null,
                        creation_year: row.creation_year ? parseInt(row.creation_year) : null,
                        medium: row.medium || null,
                        description: row.description || null,
                        wall: row.wall || wallName || null,
                        room: row.room || room || 'Unspecified',
                        image_url: row.image_file || null,
                        audio: audioUrl || '',
                        exhibitions_id: parseInt(exhibitionNumber),
                        order: row.order ? parseInt(row.order) : 0,
                        short_description: row.short_description || ''
                    }, {
                        onConflict: 'artwork_id'
                    });

                if (artworkError) {
                    console.error('Error upserting artwork:', artworkError);
                    throw new Error(`Failed to upsert artwork: ${row.name} - ${artworkError.message}`); }
            }
                
            return { success: true };

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