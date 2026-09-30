import React from "react"

interface GoogleIconProps {
  className?: string
}

export default function GoogleIcon({
  className = "",
}: GoogleIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 21.65c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.65Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.75A5.86 5.86 0 0 1 6.23 12c0-.61.1-1.2.31-1.75v-2.5H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.25l3.24-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.22c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.31 14.63 2.35 12 2.35a9.75 9.75 0 0 0-8.7 5.4l3.24 2.5c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  )
}