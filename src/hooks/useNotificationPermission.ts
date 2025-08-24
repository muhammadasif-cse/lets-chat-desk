import { useEffect } from "react";
import notificationManager from "../lib/notification-manager";

export const useNotificationPermission = () => {
  useEffect(() => {
    const requestPermission = async () => {
      if (notificationManager.isSupported()) {
        const permission = await notificationManager.checkPermission();
        console.log("Notification permission:", permission);

        if (permission === "denied") {
          console.warn(
            "Notifications are disabled. Please enable them in browser settings."
          );
        }
      } else {
        console.warn("Notifications are not supported on this platform.");
      }
    };

    const timeout = setTimeout(requestPermission, 1000);

    return () => clearTimeout(timeout);
  }, []);
};

export default useNotificationPermission;
