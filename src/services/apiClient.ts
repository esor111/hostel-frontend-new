/**
 * API Client - Re-export from lib for backward compatibility
 * This file exists to support services that import from './apiClient'
 */

import { apiClient as client, API_BASE_URL as baseUrl } from '../lib/api-client';

export { client as apiClient, baseUrl as API_BASE_URL };
export default client;

