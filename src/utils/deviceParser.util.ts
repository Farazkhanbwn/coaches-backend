export const parseUserAgent = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/')) browser = 'Chrome';
  else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('opera/') || ua.includes('opr/')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows nt 10.0')) os = 'Windows 10/11';
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
  else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  else if (ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';
  
  // Detect device type
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }
  
  return { browser, os, device };
};

export const getClientIp = (req: any): string => {
  let ip = (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'Unknown'
  );
  
  // Convert IPv6 localhost to IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  
  return ip;
};
