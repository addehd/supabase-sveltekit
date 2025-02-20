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
export async function createAudio(name: string, text: string): Promise<any> {
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

// get device and memory info
export function getSystemInfo() {
  const deviceInfo = {
    // device details
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    
    // memory info
    deviceMemory: 'Not available',
    totalJSHeapSize: 'Not available',
    usedJSHeapSize: 'Not available',
    
    // timestamp
    timestamp: new Date().toISOString()
  };

  // check for device memory support
  if ('deviceMemory' in navigator) {
    deviceInfo.deviceMemory = `${(navigator as any).deviceMemory} GB`;
  }

  // check for performance memory support
  const performance = window.performance as any;
  if (performance && performance.memory) {
    deviceInfo.totalJSHeapSize = `${Math.round(performance.memory.totalJSHeapSize / (1024 * 1024))} MB`;
    deviceInfo.usedJSHeapSize = `${Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))} MB`;
  }

  return deviceInfo;
} 