const API_BASE = "/api"

let csrfInitialized = false

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))

  return cookie
    ? decodeURIComponent(cookie.substring(name.length + 1))
    : null
}

/**
 * Initialize Laravel Sanctum CSRF protection once.
 */
export async function getCsrfCookie() {
  if (csrfInitialized) return

  const response = await fetch("/sanctum/csrf-cookie", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Unable to initialize CSRF protection.")
  }

  csrfInitialized = true
}

/**
 * Reset CSRF state after logout/session changes.
 */
export function resetCsrf() {
  csrfInitialized = false
}

/**
 * Send a request to the Laravel API.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase()
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method)

  // Initialize Sanctum before state-changing requests.
  if (isStateChanging) {
    await getCsrfCookie()
  }

  const headers = new Headers(options.headers)

  headers.set("Accept", "application/json")

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  // Send Laravel's CSRF token.
  if (isStateChanging) {
    const xsrfToken = getCookie("XSRF-TOKEN")

    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken)
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  const contentType = response.headers.get("content-type") ?? ""

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, response.status))
  }

  return data as T
}

function getApiErrorMessage(
  data: unknown,
  status: number,
): string {
  if (typeof data !== "object" || data === null) {
    return `Request failed with status ${status}.`
  }

  const errorData = data as {
    message?: string
    errors?: Record<string, string[] | string>
  }

  if (errorData.errors) {
    const firstError = Object.values(errorData.errors)
      .flat()
      .find((message) => typeof message === "string")

    if (firstError) return firstError
  }

  if (errorData.message) {
    return errorData.message
  }

  return `Request failed with status ${status}.`
}