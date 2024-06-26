import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    send(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    // eslint-disable-next-line no-unused-vars
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    // eslint-disable-next-line no-unused-vars
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

const importBtn = {
  importFile: () => ipcRenderer.send('import-file'),
};

const toggleMode = {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
};

contextBridge.exposeInMainWorld('importFile', importBtn);
contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('toggle', toggleMode);

export type ImportButton = typeof importBtn;
export type ElectronHandler = typeof electronHandler;
export type ToggleMode = typeof toggleMode;
