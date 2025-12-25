// Environment configuration for the web application
// Provides typed access to environment variables
export const env = {
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
} as const;

// Validates that required environment variables are set
export function validateEnv(): void {
  if (!env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Map features will not work.');
  }
  if (!env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is required');
  }
}
