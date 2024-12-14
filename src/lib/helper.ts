export async function checkAuthentication(locals) {
  const supabaseClient = locals.supabase;
  if (!supabaseClient) {
    throw new Error('Not authenticated');
  }

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return { supabaseClient, user };
}

// cloudways: functions/audio.php
export async function postAudioData(name: string, text: string): Promise<any> {
  const url = 'https://phpstack-863910-3043731.cloudwaysapps.com/audio.php';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = new URLSearchParams({
    name,
    text,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting audio data:', error);
    throw error;
  }
}