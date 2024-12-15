import type { Actions } from '@sveltejs/kit';
import { checkAuthentication } from '$lib/helper';

export const actions = {
    upload: async ({ request, locals }) => {
        try {
            const formData = await request.formData();
            const files = formData.getAll('files');
            const wallName = formData.get('wallName');
            const exhibitionNumber = formData.get('exhibitionNumber');
            
            console.log('Checking authentication...');
            const { supabaseClient, user } = await checkAuthentication(locals);
            console.log('Auth check complete, user:', user?.id);

            const processedFiles = await Promise.all(files.map(async (file) => {
                const fileName = (file as File).name;
                
                // validate filename format
                if (!fileName.includes('-')) {
                    throw new Error(`Invalid filename format: ${fileName}. Expected format: artist-artwork-exhibition.ext`);
                }

                // extract info from filename with validation
                const parts = fileName.split('-');
                if (parts.length !== 3) {
                    throw new Error(`Invalid filename format: ${fileName}. Expected format: artist-artwork-exhibition.ext`);
                }

                const [artist, artworkWithUnderscores, exhibitionWithExt] = parts;
                const artwork = artworkWithUnderscores.replace(/_/g, ' ');

                // upload to storage with upsert behavior
                const filePath = `exhibitions/${exhibitionNumber}/${fileName}`;
                
                // first try to delete existing file if it exists
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
                        upsert: true // enable upsert behavior
                    });

                if (storageError) {
                    throw new Error(`Storage error: ${storageError.message}`);
                }

                // get public url
                const imageUrl = storageData?.path 
                    ? supabaseClient.storage.from('bucket').getPublicUrl(storageData.path).data.publicUrl
                    : '';

                // add logging before database operation
                console.log('Attempting database insertion:', {
                    title: artwork,
                    exhibitions_id: parseInt(exhibition_number),
                    room: 'TBD'
                });

                const { data, error } = await supabaseClient
                    .from('artworks_test')
                    .upsert({
                        title: artwork,
                        exhibitions_id: parseInt(exhibition_number),
                        image_url: imageUrl,
                        short_description: '',
                        description: null,
                        wall: null,
                        room: 'stappen',
                        order: 0,
                        artist_id: null,
                        audio: ''
                    })
                    .select();

                if (error) {
                    console.error('Database operation failed:', error);
                    throw new Error(`Database operation failed: ${error.message}`);
                }

                return {
                    metadata: {
                        artist,
                        artwork,
                        exhibition_number,
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