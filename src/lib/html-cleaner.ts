/**
 * HTML Content Cleaner
 * Cleans up messy HTML content from Estaty API and converts it to readable text
 */

/**
 * Clean HTML content and extract readable text
 */
export function cleanHtmlContent(htmlContent: string | null | undefined): string {
  if (!htmlContent) return '';

  let cleaned = htmlContent;

  // Remove HTML tags but preserve the content
  cleaned = cleaned
    // Remove script and style tags completely
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // Convert common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ccedil;/g, 'ç')
    
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * Clean description specifically for property listings
 */
export function cleanPropertyDescription(description: string | null | undefined): string {
  if (!description) return '';

  const cleaned = cleanHtmlContent(description);
  
  // If it's too short after cleaning, return empty
  if (cleaned.length < 20) return '';
  
  // Limit to reasonable length for descriptions
  if (cleaned.length > 1500) {
    return cleaned.substring(0, 1500).trim() + '...';
  }
  
  return cleaned;
}

/**
 * Extract key features from description text
 */
export function extractKeyFeatures(description: string): string[] {
  if (!description) return [];
  
  const features: string[] = [];
  const cleaned = cleanHtmlContent(description);
  
  // Look for common patterns like "X minutes to Y"
  const timeMatches = cleaned.match(/(\d+)\s*minutes?\s*[–—-]\s*([^.]+)/gi);
  if (timeMatches) {
    timeMatches.forEach(match => {
      const clean = match.replace(/\d+\s*minutes?\s*[–—-]\s*/, '').trim();
      if (clean && clean.length < 50) {
        features.push(clean);
      }
    });
  }
  
  // Look for bedroom/bathroom configurations
  const unitMatches = cleaned.match(/(\d+)\s*(br|bedroom|bhk|bathroom)/gi);
  if (unitMatches) {
    unitMatches.forEach(match => {
      if (!features.some(f => f.toLowerCase().includes(match.toLowerCase()))) {
        features.push(match.trim());
      }
    });
  }
  
  return features.slice(0, 5); // Limit to 5 key features
}

/**
 * Extract location highlights from description
 */
export function extractLocationHighlights(description: string): string[] {
  if (!description) return [];
  
  const locations: string[] = [];
  const cleaned = cleanHtmlContent(description);
  
  // Common Dubai landmarks and areas
  const landmarks = [
    'Dubai Mall', 'Burj Khalifa', 'Downtown Dubai', 'Business Bay',
    'Dubai Marina', 'Palm Jumeirah', 'JBR', 'DIFC', 'Sheikh Zayed Road',
    'Dubai International Airport', 'Al Maktoum Airport', 'Expo City',
    'Jumeirah Beach', 'Dubai South', 'Al Wasl', 'Creek Harbour'
  ];
  
  landmarks.forEach(landmark => {
    const regex = new RegExp(`\\b${landmark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(cleaned)) {
      // Try to extract the time/distance info
      const contextRegex = new RegExp(`(\\d+)\\s*minutes?[^.]*${landmark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      const match = cleaned.match(contextRegex);
      if (match && match[0]) {
        locations.push(match[0].trim());
      } else {
        locations.push(landmark);
      }
    }
  });
  
  return locations.slice(0, 6); // Limit to 6 location highlights
}
