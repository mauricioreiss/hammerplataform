/**
 * Parses a rest time string (e.g. "60s", "90", "1:30", "2 min") into seconds.
 * Fallbacks to 60 seconds if null, empty or invalid.
 */
export function parseRestTimeToSeconds(rest: string | null | undefined): number {
  if (!rest || typeof rest !== "string") return 60

  const cleaned = rest.trim().toLowerCase()
  if (!cleaned) return 60

  // Format "1:30" or "01:30"
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":")
    const minutes = parseInt(parts[0], 10)
    const seconds = parseInt(parts[1], 10)
    if (!isNaN(minutes) && !isNaN(seconds)) {
      const total = minutes * 60 + seconds
      return total > 0 ? total : 60
    }
  }

  // Format "2 min" or "2m" or "2 minutos"
  const minMatch = cleaned.match(/(\d+)\s*(?:min|m|minutos)/)
  const secMatch = cleaned.match(/(\d+)\s*(?:s|sec|segundos)/)

  if (minMatch || secMatch) {
    let total = 0
    if (minMatch) {
      total += parseInt(minMatch[1], 10) * 60
    }
    if (secMatch) {
      total += parseInt(secMatch[1], 10)
    }
    return total > 0 ? total : 60
  }

  // Pure number (e.g. "60", "45")
  const numOnly = parseInt(cleaned, 10)
  if (!isNaN(numOnly) && numOnly > 0) {
    return numOnly
  }

  return 60
}

/**
 * Formats seconds into MM:SS format.
 */
export function formatTimerSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(m)}:${pad(s)}`
}
