export function extractYoutubeId(url: string): string | null {
  // Match ?v=ID or &v=ID
  let match = url.match(/[?&]v=([^&]+)/)
  if (match) return match[1]
  // Match youtu.be/ID
  match = url.match(/youtu\.be\/([^?&/]+)/)
  if (match) return match[1]
  return null
}

export const formatDate = (date: string, format: 'short' | 'long' | 'auto' = 'auto') => {
  // if same year, return month and day, otherwise return YYYY-MM-DD
  const currentYear = new Date().getFullYear()
  const dateYear = new Date(date).getFullYear()
  if (format === 'short' || (format === 'auto' && dateYear === currentYear)) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (format === 'long' || (format === 'auto' && dateYear !== currentYear)) {
    return new Date(date).toLocaleDateString('lt-LT', { year: 'numeric', month: 'numeric', day: 'numeric' })
  }
  return new Date(date).toLocaleDateString('lt-LT', { year: 'numeric', month: 'numeric', day: 'numeric' })
}
