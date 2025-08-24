// Chat configuration constants
export const CHAT_CONFIG = {
  PAGE_SIZE: 20,
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_TIMEOUT: 3000,
  RECONNECT_DELAY: 5000,
  MAX_RETRY_ATTEMPTS: 3,
  INFINITE_SCROLL_THRESHOLD: 300,
} as const;

// API configuration constants
export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  DEBOUNCE_DELAY: 300,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  GET_CHATS: '/chatservice/chats/GetChats',
  GET_RECENT_CHAT: '/chatservice/chats/GetRecentChat',
  SEND_MESSAGE: '/chatservice/chats/SendMessage',
} as const;

// File upload constants
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
} as const;

// UI constants
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MESSAGE_INPUT_MIN_HEIGHT: 40,
  MESSAGE_INPUT_MAX_HEIGHT: 120,
} as const;

// Environment-based constants
export const ENV_CONFIG = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_BASE_URL: import.meta.env.VITE_API_GATEWAY_URL || 'localhost:3000',
  SOCKET_URL: import.meta.env.VITE_API_HUB_URL || 'ws://localhost:3000',
} as const;
