import { error } from '@sveltejs/kit';
import { spawn } from 'child_process';

export async function GET({ params }) {
  const { id } = params;
  
  try {
    // Use yt-dlp to get direct video URL
    const process = spawn('yt-dlp', [
      '-f', 'best[height<=720]',
      '-g',
      `https://www.youtube.com/watch?v=${id}`
    ]);

    let videoUrl = '';
    
    process.stdout.on('data', (data) => {
      videoUrl += data.toString();
    });

    await new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) resolve(videoUrl.trim());
        else reject(new Error(`yt-dlp exited with code ${code}`));
      });
    });

    return new Response(videoUrl, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    throw error(500, 'Failed to get video URL');
  }
}