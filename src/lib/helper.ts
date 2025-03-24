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

// device and orientation detection
export function getDeviceAndOrientation() {
  // check if we're in browser environment
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isPhone: false,
      isTablet: false,
      isLandscape: false,
      isPortrait: true,
      addOrientationListener: () => () => {} // noop function that returns cleanup
    };
  }

  // device detection
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    (window.innerWidth <= 768);
  
  // determines if device is likely a phone (smaller screen than tablet)
  const isPhone = isMobile && (window.innerWidth < 600 || window.innerHeight < 600);
  
  // get current orientation
  let isLandscape = false;
  
  if (typeof window !== 'undefined') {
    if (window.screen?.orientation) {
      // modern orientation api
      isLandscape = window.screen.orientation.type.includes('landscape');
    } else if (window.orientation !== undefined) {
      // fallback for older devices
      isLandscape = Math.abs(window.orientation as number) === 90;
    } else {
      // last resort: compare window dimensions
      isLandscape = window.innerWidth > window.innerHeight;
    }
  }
  
  return {
    isMobile,    // any mobile device (phone or tablet)
    isPhone,     // specifically a phone (smaller screen)
    isTablet: isMobile && !isPhone, // tablet detection
    isLandscape,
    isPortrait: !isLandscape,
    
    // add listener for orientation changes
    addOrientationListener: (callback: () => void) => {
      if (typeof window === 'undefined') return () => {};
      
      const handler = () => callback();
      
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener('change', handler);
      } else {
        window.addEventListener('orientationchange', handler);
        // also listen for resize as fallback
        window.addEventListener('resize', handler);
      }
      
      // return cleanup function
      return () => {
        if (window.screen?.orientation) {
          window.screen.orientation.removeEventListener('change', handler);
        } else {
          window.removeEventListener('orientationchange', handler);
          window.removeEventListener('resize', handler);
        }
      };
    }
  };
}

// check if device should show rotation message
export function shouldShowRotationMessage() {
  if (typeof window === 'undefined') return false;
  
  const { isPhone, isLandscape } = getDeviceAndOrientation();
  return isPhone && !isLandscape;
} 