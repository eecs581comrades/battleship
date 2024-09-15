const { app, BrowserWindow, ipcMain, contextBridge } = require('electron/main')
const fs = require('fs');
const path = require('path');
const [ checkClientId, updateUserId, generateUniqueId ] = require('./userId')

// Client Setup
const userId = generateUniqueId()
updateUserId(userId)
console.log("Client " + userId + " Initialized");


const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
    }
  });

  ipcMain.on('navigate-to-page', (event, page) => {
    win.loadFile(page); // Load a new HTML file
  });

  win.loadFile('../front/homeScreen/homeScreen.html');
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  ipcMain.handle('load-config', async () => {
    const configPath = path.join(__dirname, '../assets/config.json');
    return new Promise((resolve, reject) => {
        fs.readFile(configPath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})