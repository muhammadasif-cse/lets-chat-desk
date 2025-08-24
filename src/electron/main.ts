import { app, BrowserWindow, ipcMain, Notification, session } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

let mainWindow: BrowserWindow;

app.on("ready", () => {
  //! configure session to allow necessary external resources
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; connect-src 'self' https://erpback.intertechbd.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' https://media.intertechbd.com data:; worker-src 'self' blob:; media-src 'self' https://media.intertechbd.com blob:;",
        ],
      },
    });
  });

  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: true,
    },
    frame: true,
    autoHideMenuBar: true,
    icon: app.getAppPath() + "/lets-chat.png",
  });
  
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  // Handle notification IPC
  ipcMain.handle('show-notification', (event, options) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon || app.getAppPath() + "/lets-chat.png",
        silent: options.silent || false,
      });

      notification.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
        }
      });

      notification.show();
    }
  });
});
