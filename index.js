const { app, BrowserWindow, screen, Menu} = require('electron');

const createWindow = () => {

  Menu.setApplicationMenu(false);

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  window = new BrowserWindow({
      width: width / 1.25,
      height: height / 1.25,
      webPreferences: {
          nodeIntegration: true
      }
  });

  window.loadFile('dist/index.html');
};

let window = null;

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit());