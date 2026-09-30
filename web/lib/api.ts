const configuredApiOrigin = process.env.NEXT_PUBLIC_API_URL?.trim()

const API_ORIGIN = (
  configuredApiOrigin ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "")
).replace(/\/$/, "")

const API_BASE = `${API_ORIGIN}/api`

let csrfInitialized = false
let csrfInitialization: Promise<void> | null = null

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
 * Initialize Laravel Sanctum CSRF protection.
 */
export async function getCsrfCookie(): Promise<void> {
  if (csrfInitialized) return

  if (!csrfInitialization) {
    csrfInitialization = (async () => {
      const csrfUrl = `${API_ORIGIN}/sanctum/csrf-cookie`

      console.log("SANCTUM CSRF URL:", csrfUrl)

      const response = await fetch(csrfUrl, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(
          `Unable to initialize CSRF protection. Status: ${response.status}`
        )
      }
    })()
  }

  try {
    await csrfInitialization
    csrfInitialized = true
  } finally {
    csrfInitialization = null
  }
}

export function resetCsrf() {
  csrfInitialized = false
  csrfInitialization = null
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase()

  const isStateChanging = ![
    "GET",
    "HEAD",
    "OPTIONS",
  ].includes(method)

  if (isStateChanging) {
    await getCsrfCookie()
  }

  const headers = new Headers(options.headers)

  headers.set("Accept", "application/json")

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (isStateChanging) {
    const xsrfToken = getCookie("XSRF-TOKEN")

    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken)
    }
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      method,
      headers,
      credentials: "include",
      cache: "no-store",
    }
  )

  const contentType =
    response.headers.get("content-type") ?? ""

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, response.status)
    )
  }

  return data as T
}

function getApiErrorMessage(
  data: unknown,
  status: number
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
      .find(
        (message) =>
          typeof message === "string"
      )

    if (firstError) return firstError
  }

  if (errorData.message) {
    return errorData.message
  }

  return `Request failed with status ${status}.`
}