import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.API_BASE!

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(
            `${API_BASE}/sanctum/csrf-cookie`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        )

        const responseHeaders = new Headers(response.headers)

        const setCookie = response.headers.getSetCookie()

        responseHeaders.delete("set-cookie")

        for (const cookie of setCookie) {
            responseHeaders.append(
                "set-cookie",
                rewriteCookie(cookie)
            )
        }

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        })
    } catch (error) {
        console.error("Laravel CSRF proxy error:", error)

        return NextResponse.json(
            {
                message: "Unable to connect to Laravel CSRF endpoint.",
            },
            { status: 502 }
        )
    }
}

function rewriteCookie(cookie: string) {
    return cookie
        .replace(/;\s*Domain=[^;]+/i, "")
        .replace(/;\s*SameSite=None/gi, "; SameSite=Lax")
}