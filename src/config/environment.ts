export type Environment = 'localhost' | 'development' | 'production';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: Environment;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  localhost: {
    apiBaseUrl: 'http://localhost:3001/hostel/api/v1',
    environment: 'localhost',
    debugMode: true,
    logLevel: 'debug',
  },
  development: {
    apiBaseUrl: 'https://dev.kaha.com.np/hostel/api/v1',
    environment: 'development',
    debugMode: true,
    logLevel: 'info',
  },
  production: {
    apiBaseUrl: 'https://dev.kaha.com.np/hostel/api/v1',
    environment: 'production',
    debugMode: false,
    logLevel: 'error',
  },
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = (import.meta.env.VITE_ENVIRONMENT as Environment) || 'development';
  return ENVIRONMENT_CONFIGS[currentEnv];
};

export const buildApiUrl = (endpoint: string): string => {
  const config = getEnvironmentConfig();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${config.apiBaseUrl}${cleanEndpoint}`;
};