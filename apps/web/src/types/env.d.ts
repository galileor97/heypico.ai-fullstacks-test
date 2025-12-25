declare namespace NodeJS {
  interface ProcessEnv {
    /** Google Maps API Key for displaying maps and place information */
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    /** Backend API URL for chat endpoint */
    NEXT_PUBLIC_API_URL?: string;
  }
}
