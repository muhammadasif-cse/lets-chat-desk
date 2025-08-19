import { app, BrowserWindow, session } from "electron";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

app.on("ready", () => {
  //! configure session to allow emoji loading
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http: ws: wss:",
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
