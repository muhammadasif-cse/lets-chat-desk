/**
 * Notification utility for cross-platform notifications
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationManager {
  private permission: NotificationPermission = "default";
  private isElectron: boolean;

  constructor() {
    this.isElectron = !!(window as any).electronAPI;
    this.checkPermission();
  }

  /**
   * Check and request notification permission
   */
  async checkPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return "denied";
    }

    this.permission = Notification.permission;

    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  /**
   * Show notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    // Check if app is in focus (don't show notification if user is already looking at the app)
    if (document.hasFocus() && !options.requireInteraction) {
      console.log("App is in focus, skipping notification");
      return;
    }

    await this.checkPermission();

    if (this.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    try {
      if (this.isElectron) {
        // Use Electron's notification system
        if ((window as any).electronAPI?.showNotification) {
          await (window as any).electronAPI.showNotification({
            title: options.title,
            body: options.body,
            icon: options.icon || "/lets-chat.png",
            silent: options.silent || false,
          });
        } else {
          // Fallback to web notification
          this.showWebNotification(options);
        }
      } else {
        // Use web notification
        this.showWebNotification(options);
      }
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  /**
   * Show web notification
   */
  private showWebNotification(options: NotificationOptions): void {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/lets-chat.png",
      tag: options.tag || "lets-chat-message",
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
    });

    // Auto close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  /**
   * Show message notification
   */
  async showMessageNotification(senderName: string, message: string, isGroup: boolean = false, groupName?: string): Promise<void> {
    const title = isGroup ? `${senderName} in ${groupName}` : senderName;
    const body = message.length > 100 ? `${message.substring(0, 100)}...` : message;

    await this.showNotification({
      title,
      body,
      tag: `message-${Date.now()}`,
      requireInteraction: false,
    });
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return "Notification" in window || this.isElectron;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationManager = new NotificationManager();
export default notificationManager;
