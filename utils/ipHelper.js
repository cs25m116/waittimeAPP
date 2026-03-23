// Get client IP address
exports.getClientIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             req.ip;
  
  // Handle IPv6 localhost
  if (ip === '::1') return '127.0.0.1';
  return ip;
};

// Get device info from user agent
exports.getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  let platform = 'unknown';
  let browser = 'unknown';
  let device = 'unknown';
  
  // Simple platform detection
  if (userAgent.includes('iPhone')) platform = 'iOS';
  else if (userAgent.includes('Android')) platform = 'Android';
  else if (userAgent.includes('Windows')) platform = 'Windows';
  else if (userAgent.includes('Mac')) platform = 'Mac';
  
  // Simple browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Simple device type detection
  if (userAgent.includes('Mobile')) device = 'mobile';
  else if (userAgent.includes('Tablet')) device = 'tablet';
  else device = 'desktop';
  
  return { platform, browser, device };
};
