import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (options: {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
  }) => {
    ipcRenderer.invoke('show-notification', options);
  },
  
  onNotificationClick: (callback: () => void) => {
    ipcRenderer.on('notification-clicked', callback);
  },

  subscribeStatistics: (callback: (stats: any) => void) => {
    const unsubscribe = () => ipcRenderer.removeAllListeners('statistics');
    ipcRenderer.on('statistics', (_, stats) => callback(stats));
    return unsubscribe;
  },
  
  subscribeChangeView: (callback: (view: any) => void) => {
    const unsubscribe = () => ipcRenderer.removeAllListeners('changeView');
    ipcRenderer.on('changeView', (_, view) => callback(view));
    return unsubscribe;
  },
  
  getStaticData: () => ipcRenderer.invoke('getStaticData'),
  
  sendFrameAction: (payload: any) => ipcRenderer.send('sendFrameAction', payload),
});

contextBridge.exposeInMainWorld('electron', {
  subscribeStatistics: (callback: (stats: any) => void) => {
    const unsubscribe = () => ipcRenderer.removeAllListeners('statistics');
    ipcRenderer.on('statistics', (_, stats) => callback(stats));
    return unsubscribe;
  },
  
  subscribeChangeView: (callback: (view: any) => void) => {
    const unsubscribe = () => ipcRenderer.removeAllListeners('changeView');
    ipcRenderer.on('changeView', (_, view) => callback(view));
    return unsubscribe;
  },
  
  getStaticData: () => ipcRenderer.invoke('getStaticData'),
  
  sendFrameAction: (payload: any) => ipcRenderer.send('sendFrameAction', payload),
});
