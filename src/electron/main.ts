import { app, BrowserWindow, session } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

app.on("ready", () => {
  //! configure session to allow necessary external resources
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; connect-src 'self' https://erpback.intertechbd.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' https://media.intertechbd.com data:; worker-src 'self' blob:;",
        ],
      },
    });
  });

  const mainWindow = new BrowserWindow({
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
});
