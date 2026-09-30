import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.API_BASE!

async function handler(request: NextRequest) {
  // Remove /api from the Next.js request path.
  const path = request.nextUrl.pathname.replace(/^\/api/, "")
  const search = request.nextUrl.search

  const url = `${API_BASE}/api${path}${search}`

  const headers = new Headers(request.headers)

  // Forward the browser's Laravel session/XSRF cookies.
  const cookie = request.headers.get("cookie")
  if (cookie) {
    headers.set("cookie", cookie)
  }

  // Laravel should see JSON responses.
  headers.set("Accept", "application/json")

  // Don't forward Next.js host to Laravel.
  headers.delete("host")

  let body: ArrayBuffer | undefined

  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer()
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    })

    const responseHeaders = new Headers(response.headers)

    // Laravel can return multiple Set-Cookie headers.
    const setCookies = response.headers.getSetCookie()

    responseHeaders.delete("set-cookie")

    for (const cookie of setCookies) {
      responseHeaders.append(
        "set-cookie",
        rewriteCookie(cookie),
      )
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Laravel API proxy error:", error)

    return NextResponse.json(
      {
        message: "Unable to connect to Laravel API.",
      },
      { status: 502 },
    )
  }
}

function rewriteCookie(cookie: string) {
  // Remove Laravel's Domain so the cookie belongs to Next.js.
  return cookie
    .replace(/;\s*Domain=[^;]+/i, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
export const HEAD = handler