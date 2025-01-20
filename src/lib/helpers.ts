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