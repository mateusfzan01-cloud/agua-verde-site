export function TripAdvisorLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TripAdvisor"
    >
      <circle cx="256" cy="256" r="240" fill="#34E0A1" />
      <path
        d="M256 120c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 64c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24z"
        fill="#000"
      />
      <ellipse cx="180" cy="220" rx="48" ry="56" fill="#fff" />
      <ellipse cx="332" cy="220" rx="48" ry="56" fill="#fff" />
      <ellipse cx="180" cy="220" rx="32" ry="40" fill="#000" />
      <ellipse cx="332" cy="220" rx="32" ry="40" fill="#000" />
      <circle cx="180" cy="212" r="12" fill="#fff" />
      <circle cx="332" cy="212" r="12" fill="#fff" />
      <path
        d="M256 296c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 96c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"
        fill="#FFCC00"
      />
      <path d="M256 328v64M224 360h64" stroke="#000" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

export function TripAdvisorBadge({ className = "w-32 h-auto" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="60" rx="8" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
      <circle cx="32" cy="30" r="18" fill="#34E0A1" />
      <text x="32" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">
        Trip
      </text>
      <text x="32" y="38" textAnchor="middle" fontSize="8" fill="#000">
        Advisor
      </text>
      <text x="60" y="22" fontSize="9" fontWeight="bold" fill="#000">
        Certificado
      </text>
      <text x="60" y="35" fontSize="9" fontWeight="bold" fill="#000">
        de Excelência
      </text>
      <text x="60" y="48" fontSize="7" fill="#666">
        2019 · 2020 · 2021 · 2022 · 2023
      </text>
    </svg>
  )
}

export function InstagramLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Instagram"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function GoogleReviewsLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Reviews"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
