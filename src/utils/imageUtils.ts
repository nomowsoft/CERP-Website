/**
 * Utilities for efficient image and buffer handling
 */

/**
 * Formats a database buffer or string icon/image for the frontend.
 * Optimized to skip heavy processing if the input is already a URL or base64 string.
 */
export const formatImage = (image: any): string | null => {
  if (!image) return null;

  // If it's already a string, check if it's a URL or base64
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (trimmed === '') return null;
    if (trimmed.startsWith('http') || trimmed.startsWith('data:image')) {
      return trimmed;
    }
    return trimmed;
  }

  // If it's a Buffer or Uint8Array
  try {
    const buf = Buffer.from(image);
    if (buf.length === 0) return null;
    
    // Quick check: if the first few bytes look like a URL (http), avoid full conversion
    const peak = buf.slice(0, 10).toString('utf8');
    if (peak.startsWith('http') || peak.startsWith('data:image')) {
      return buf.toString('utf8');
    }

    const base64 = buf.toString('base64');
    if (!base64) return null;

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error formatting image buffer:', error);
    return null;
  }
};

/**
 * Helper to check if an image source is valid for Next.js Image component
 */
export const isValidImage = (src: any): src is string => {
  return !!src && typeof src === 'string' && src.trim() !== '' && !src.includes('undefined') && !src.includes('null');
};

/**
 * Strips heavy fields from subscription objects for list views
 */
export const stripSubscriptionDetails = (subscription: any) => {
  const { 
    licenseFile, 
    auditLogs, 
    payments,
    ...listData 
  } = subscription;
  return listData;
};
