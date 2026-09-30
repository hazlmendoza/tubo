export function safeReturnTo(value: string | null): string {
  if (!value) {
    return "/"
  }

  const path = value.trim()

  // Only allow internal relative paths.
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/"
  }

  // Block protocol-relative or encoded redirect attempts.
  try {
    const decoded = decodeURIComponent(path)

    if (
      decoded.startsWith("//") ||
      decoded.includes("://")
    ) {
      return "/"
    }
  } catch {
    return "/"
  }

  return path
}