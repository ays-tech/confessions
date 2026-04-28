// App-wide config — safe to use on client and server
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://corperconfessions.ng')

export const APP_NAME = 'Corper Confessions'
export const APP_TAGLINE = 'Anonymous NYSC Stories'
