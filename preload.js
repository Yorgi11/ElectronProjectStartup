const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  pickDirectory: () => ipcRenderer.invoke("pick-directory"),
  createElectronProject: (folderName, baseDirectory) =>
    ipcRenderer.invoke("create-electron-project", {
      folderName,
      baseDirectory,
    }),
});
