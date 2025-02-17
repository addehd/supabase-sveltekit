import type { Actions } from '@sveltejs/kit';
import { checkAuthentication } from '$lib/helper';

export const actions = {
    upload: async ({ request, locals }) => {
        try {
            const formData = await request.formData();
            const files = formData.getAll('files');
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
                    const { data, error } = await supabaseClient
                        .from('artworks')
                        .upsert({
                            title: row.title || '',
                            exhibitions_id: parseInt(exhibitionNumber),
                            image_url: row.image_url || '',
                            short_description: row.short_description || '',
                            description: row.description || null,
                            wall: row.wall || wallName || null,
                            room: row.room || room,
                            order: row.order || '',
                            artist_id: parseInt(row.artist_id) || null,
                            audio: row.audio || ''
                        })
                        .select();

                    if (error) {
                        console.error('CSV row upload failed:', error);
                        throw new Error(`Failed to upload CSV row: ${error.message}`);
                    }
                }
            }

            console.log('exhibitionNumber addehd', exhibitionNumber);
            
            if (!exhibitionNumber || isNaN(parseInt(exhibitionNumber))) {
                throw new Error('Invalid exhibition number');
            }

            console.log('Form data:', { wallName, exhibitionNumber });
            
      

            const processedFiles = await Promise.all(files.map(async (file) => {
                const fileName = (file as File).name;
                
                // validate 
                if (!fileName.includes('-')) { throw new Error(`Invalid filename format: ${fileName}. Expected format: artist-artwork-exhibition.ext`); }
                const parts = fileName.split('-');
                if (parts.length !== 3) { throw new Error(`Invalid filename format: ${fileName}. Expected format: artist-artwork-exhibition.ext`); }

                // extract artist, artworkname, and exhibition number
                const [artist, artworkWithUnderscores, exhibitionWithExt] = parts;
                const artwork = artworkWithUnderscores.replace(/_/g, ' ');
                const orderNumber = exhibitionWithExt.split('.')[0];

                // upload to storage with upsert behavior
                const filePath = `exhibitions/${orderNumber}/${fileName}`;
                
                // delete existing file if it exists
                await supabaseClient.storage
                    .from('bucket')
                    .remove([filePath])
                    .catch(() => {
                        // ignore delete errors - file might not exist
                    });

                // now upload the new file
                const { data: storageData, error: storageError } = await supabaseClient.storage
                    .from('bucket')
                    .upload(filePath, file, {
                        upsert: true
                    });

                if (storageError) {
                    throw new Error(`Storage error: ${storageError.message}`);
                }

                const imageUrl = storageData?.path 
                    ? supabaseClient.storage.from('bucket').getPublicUrl(storageData.path).data.publicUrl
                    : '';

                // Debug log before database operation
                console.log('Attempting database insertion:', {
                    title: artwork,
                    exhibitions_id: orderNumber,
                    artist_id: artist,
                    wall: wallName
                });

                const { data, error } = await supabaseClient
                    .from('artworks')
                    .upsert({
                        title: artwork,
                        exhibitions_id: parseInt(exhibitionNumber),
                        image_url: imageUrl,
                        short_description: '',
                        description: null,
                        wall: wallName || null,
                        room: room,
                        order: orderNumber,
                        artist_id: parseInt(artist),
                        audio: ''
                    })
                    .select();

                if (error) {
                    console.error('Database operation failed:', error);
                    console.error('Failed data:', {
                        exhibitionNumber,
                        artist,
                        artwork
                    });
                    throw new Error(`Database operation failed: ${error.message}`);
                }

                return {
                    metadata: {
                        artist,
                        artwork,
                        exhibitionNumber,
                        originalName: fileName,
                        type: (file as File).type,
                        size: (file as File).size,
                        imageUrl,
                        dbRecord: data?.[0]
                    }
                };
            }));

            return {
                success: true,
                files: processedFiles
            };
        } catch (error) {
            console.error('Upload action error:', error);
            throw error;
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
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const entry: Record<string, string> = {};
        
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index]?.trim() || '';
        });
        
        return entry;
    });
}