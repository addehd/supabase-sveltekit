// get device and memory info
export function getSystemInfo() {
  // check if we're in browser environment
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      userAgent: '',
      platform: '',
      screenWidth: 0,
      screenHeight: 0,
      devicePixelRatio: 1,
      deviceMemory: 'Not available',
      totalJSHeapSize: 'Not available',
      usedJSHeapSize: 'Not available',
      timestamp: new Date().toISOString()
    };
  }

  const deviceInfo = {
    // device details
    isMobile: false, // default value
    userAgent: '',
    platform: '',
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

  // check if we're in browser
  if (typeof navigator !== 'undefined') {
    deviceInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    deviceInfo.userAgent = navigator.userAgent;
    deviceInfo.platform = navigator.platform;

    if ('deviceMemory' in navigator) {
      deviceInfo.deviceMemory = `${(navigator as any).deviceMemory} GB`;
    }
  }

  // check for performance memory support
  if (typeof window !== 'undefined' && window.performance) {
    const performance = window.performance as any;
    if (performance && performance.memory) {
      deviceInfo.totalJSHeapSize = `${Math.round(performance.memory.totalJSHeapSize / (1024 * 1024))} MB`;
      deviceInfo.usedJSHeapSize = `${Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))} MB`;
    }
  }

  return deviceInfo;
} 