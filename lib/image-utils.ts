/**
 * Utility functions for handling image URLs
 */

/**
 * Constructs a full image URL by combining the base URL with the relative path
 * @param imagePath - The relative image path (e.g., "slug/images/image.png")
 * @returns The complete image URL
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) {
    return ''
  }

  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://static.blazeblog.co/blazeblog/'
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  // Ensure base URL ends with slash
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  
  return `${normalizedBaseUrl}${cleanPath}`
}

/**
 * Extracts the relative path from a full image URL
 * @param fullUrl - The complete image URL
 * @returns The relative path or the original URL if it doesn't match the base URL
 */
export function getRelativeImagePath(fullUrl: string | undefined | null): string {
  if (!fullUrl) {
    return ''
  }

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://static.blazeblog.co/blazeblog/'
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  
  if (fullUrl.startsWith(normalizedBaseUrl)) {
    return fullUrl.replace(normalizedBaseUrl, '')
  }
  
  return fullUrl
}