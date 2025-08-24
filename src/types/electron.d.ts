/**
 * Electron notification preload script
 * This file should be included in the Electron preload script
 */

declare global {
  interface Window {
    electronAPI?: {
      showNotification: (options: {
        title: string;
        body: string;
        icon?: string;
        silent?: boolean;
      }) => void;
      onNotificationClick: (callback: () => void) => void;
    };
  }
}

export { };

