const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 420,
    minWidth: 560,
    minHeight: 360,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

function isValidFolderName(name) {
  if (!name || typeof name !== "string") return false;

  const trimmed = name.trim();
  if (!trimmed) return false;

  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(trimmed)) return false;

  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
  if (reserved.test(trimmed)) return false;

  return true;
}

function writeFileSafe(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function getPackageJson(projectName) {
  const packageName = projectName.toLowerCase().replace(/\s+/g, "");
  return `{
  "name": "${packageName}",
  "version": "1.0.0",
  "description": "Electron app: ${projectName}",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "author": "Michael Giorgi",
  "license": "MIT",
  "devDependencies": {
    "electron": "^41.0.2"
  }
}
`;
}

function getMainJs() {
  return `const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
`;
}

function getPreloadJs() {
  return `const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {});
`;
}

function getRendererJs(projectName) {
  return `console.log("${projectName} renderer loaded.");
`;
}

function getStylesCss() {
  return `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
  font-family: Arial, sans-serif;
}

.container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

label {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

input {
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
}

button {
  padding: 12px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #222;
  color: white;
}
`;
}

function getIndexHtml(projectName) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <label for="demoInput">${projectName}</label>
      <input id="demoInput" type="text" placeholder="Type here..." />
      <button id="demoButton">Click Me</button>
    </div>

    <script src="renderer.js"></script>
  </body>
</html>
`;
}

function getLaunchJson() {
  return `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "\${workspaceFolder}/node_modules/.bin/electron.cmd",
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
`;
}

function createStarterFiles(projectPath, projectName) {
  writeFileSafe(
    path.join(projectPath, "package.json"),
    getPackageJson(projectName),
  );
  writeFileSafe(path.join(projectPath, "main.js"), getMainJs());
  writeFileSafe(path.join(projectPath, "preload.js"), getPreloadJs());
  writeFileSafe(
    path.join(projectPath, "renderer.js"),
    getRendererJs(projectName),
  );
  writeFileSafe(path.join(projectPath, "styles.css"), getStylesCss());
  writeFileSafe(
    path.join(projectPath, "index.html"),
    getIndexHtml(projectName),
  );
  writeFileSafe(
    path.join(projectPath, ".vscode", "launch.json"),
    getLaunchJson(),
  );
}

function openInVsCode(projectPath) {
  return new Promise((resolve) => {
    const child = spawn("code", ["--new-window", projectPath], {
      shell: true,
      windowsHide: true,
    });

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      resolve({
        success: false,
        error:
          `Project was created successfully:\n${projectPath}\n\n` +
          `But VS Code could not be launched.\n\n${error.message}`,
      });
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
        return;
      }

      resolve({
        success: false,
        error:
          `Project was created successfully:\n${projectPath}\n\n` +
          `But VS Code exited with code ${code}.\n\n${stderr}`,
      });
    });
  });
}

ipcMain.handle("pick-directory", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select Base Directory",
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return {
      canceled: true,
      directoryPath: "",
    };
  }

  return {
    canceled: false,
    directoryPath: result.filePaths[0],
  };
});

ipcMain.handle("create-electron-project", async (_event, payload) => {
  try {
    const folderName = payload?.folderName?.trim();
    const baseDirectory = payload?.baseDirectory?.trim();

    if (!isValidFolderName(folderName)) {
      return {
        success: false,
        error: "Please enter a valid project folder name.",
      };
    }

    if (!baseDirectory) {
      return {
        success: false,
        error: "Please choose a valid base directory.",
      };
    }

    if (!fs.existsSync(baseDirectory)) {
      return {
        success: false,
        error: `Base directory not found:\n${baseDirectory}`,
      };
    }

    const projectPath = path.join(baseDirectory, folderName);

    if (fs.existsSync(projectPath)) {
      return {
        success: false,
        error: `That folder already exists:\n${projectPath}`,
      };
    }

    fs.mkdirSync(projectPath, { recursive: false });
    createStarterFiles(projectPath, folderName);

    const openResult = await openInVsCode(projectPath);

    if (!openResult.success) {
      return openResult;
    }

    return {
      success: true,
      projectPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
