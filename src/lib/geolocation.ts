/**
 * Geolocation utility for extracting IP and location data from requests
 */

interface GeoLocationData {
  city: string;
  country: string;
  ip: string;
}

/**
 * Extract real IP from request headers
 * Handles proxies, load balancers, and direct connections
 */
export function extractRealIP(headers: Headers): string {
  // Priority order for IP detection:
  // 1. x-forwarded-for (most common from proxies)
  // 2. x-real-ip (nginx reverse proxy)
  // 3. cf-connecting-ip (Cloudflare)
  // 4. x-client-ip
  
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP if there are multiple
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const clientIp = headers.get("x-client-ip");
  if (clientIp) return clientIp.trim();

  return "127.0.0.1";
}

/**
 * Extract location from request headers
 * Supports multiple CDN and hosting provider headers
 */
export function extractLocationFromHeaders(headers: Headers): { city: string; country: string } {
  // Vercel headers
  let city = headers.get("x-vercel-ip-city");
  let country = headers.get("x-vercel-ip-country");

  // Cloudflare headers
  if (!city) city = headers.get("cf-ipcity");
  if (!country) country = headers.get("cf-ipcountry");

  // Netlify headers
  if (!city) city = headers.get("x-nf-client-connection-ip");
  
  return {
    city: city || "Unknown",
    country: country || "Unknown"
  };
}

/**
 * Get geolocation data from request
 */
export function getGeoLocation(headers: Headers): GeoLocationData {
  const ip = extractRealIP(headers);
  const { city, country } = extractLocationFromHeaders(headers);

  return {
    ip,
    city,
    country
  };
}

/**
 * Optional: Fallback geolocation lookup using free API
 * Only use if headers don't provide location data
 * Rate limited - use sparingly
 */
export async function getGeoLocationFromIP(ip: string): Promise<{ city: string; country: string }> {
  // Skip for localhost/private IPs
  if (ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return { city: "Local", country: "Local" };
  }

  try {
    // Using ip-api.com free tier (45 requests/minute limit)
    const response = await fetch(`https://ip-api.com/json/${ip}?fields=city,country`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return { city: "Unknown", country: "Unknown" };

    const data = await response.json();
    return {
      city: data.city || "Unknown",
      country: data.country || "Unknown"
    };
  } catch (error) {
    console.error("Geolocation lookup failed:", error);
    return { city: "Unknown", country: "Unknown" };
  }
}
