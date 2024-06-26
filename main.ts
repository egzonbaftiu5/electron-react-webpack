import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  nativeTheme,
  globalShortcut,
  dialog,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import sqlite from 'sqlite3';
import { open } from 'sqlite';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
let dbFilePath: any;
let db: any;
let mainWindow: BrowserWindow | null = null;
let recipeCache: Record<string, any[]> = {};
let isDialogOpen = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      devTools: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.maximize();

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();

    dialog
      .showMessageBox(mainWindow!, {
        type: 'question',
        message: 'Confirm',
        detail: 'Are you sure you want to quit?',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
      })
      .then((response) => {
        if (response.response === 0) {
          mainWindow!.destroy();
        }
      });
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  new AppUpdater();
};

const initializeDatabase = async (dbPath, mainWindow) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });

    const typeRecipeTable = await db.all(
      'SELECT id, name FROM recipe_table WHERE type ="DEFAULT"',
    );

    mainWindow.webContents.send('type-data', typeRecipeTable);
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+W');
  globalShortcut.unregisterAll();
});

app
  .whenReady()
  .then(() => {
    globalShortcut.register('CommandOrControl+W', () => {
      if (mainWindow) {
        dialog
          .showMessageBox(mainWindow!, {
            type: 'question',
            message: 'Confirm',
            detail: 'Are you sure you want to quit?',
            buttons: ['Yes', 'No'],
            defaultId: 0,
            cancelId: 1,
          })
          .then((response) => {
            if (response.response === 0) {
              mainWindow!.destroy();
            }
          });
      }
    });
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('get-recipe', async (event, selectedID) => {
  try {
    const recipeTaskData = await db.all(
      `
        SELECT r.recipeId, r.taskId, r.quantity, t.id AS taskId, t.name, t.unit, rg.range, rg.description
        FROM recipe_task_table r
        JOIN task_table t ON r.taskId = t.id
        LEFT JOIN range_table rg ON r.recipeId = rg.recipeId AND r.taskId = rg.taskId
        WHERE r.recipeId = ? AND (rg.range IS NOT NULL AND rg.range != '0' AND rg.range != '')
        `,
      selectedID,
    );

    recipeCache[selectedID] = recipeTaskData;
    event.reply('recipe-data', { recipeTaskData });
  } catch (error) {
    console.error('Error retrieving recipe data:', error);
    event.reply('recipe-data', { error: 'Failed to retrieve recipe data' });
  }
});

ipcMain.on(
  'update-quantity',
  async (event, { recipeId, taskId, newQuantity }) => {
    try {
      const recipeTaskData = recipeCache[recipeId];
      if (!recipeTaskData) {
        throw new Error('No cached data found.');
      }
      const taskIdInt = parseInt(taskId, 10);
      const taskData = recipeTaskData.find((task) => task.taskId === taskIdInt);
      if (!taskData) {
        throw new Error('No task data found.');
      }

      const validValues = taskData.range ? taskData.range.split(',') : [];
      if (validValues.includes(newQuantity.toString())) {
        const result = await db.run(
          `
                UPDATE recipe_task_table
                SET quantity = ?
                WHERE recipeId = ? AND taskId = ?
            `,
          [newQuantity, recipeId, taskIdInt],
        );

        if (result.changes === 1) {
          taskData.quantity = newQuantity;
          event.reply('update-status', { success: true });
        } else {
          event.reply('update-status', {
            success: false,
            message: 'Database update failed.',
          });
        }
      } else {
        event.reply('update-status', {
          success: false,
          message: 'Invalid quantity range for taskId ' + taskId,
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      event.reply('update-status', {
        success: false,
        message: 'Failed to update quantity',
      });
    }
  },
);

ipcMain.on('update-range', async (event, { recipeId, taskId, newValue }) => {
  try {
    await db.run(
      `
            UPDATE range_table
            SET range = ?
            WHERE recipeId = ? AND taskId = ?
        `,
      [newValue, recipeId, taskId],
    );

    event.reply('update-status', { success: true });
  } catch (error) {
    console.error('Error updating range:', error);
    event.reply('update-status', {
      success: false,
      message: 'Failed to update range',
    });
  }
});

ipcMain.on('import-file', async ({ event }: any) => {
  if (isDialogOpen) {
    return;
  }
  isDialogOpen = true;
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Database files', extensions: ['db'] }],
  });

  isDialogOpen = false;

  if (!result.canceled && result.filePaths.length > 0) {
    dbFilePath = result.filePaths[0];
    try {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      await initializeDatabase(dbFilePath, mainWindow);
      mainWindow.webContents.send('database-imported');

      const makeDrinkData = await db.all('SELECT * FROM make_drink_table');
      const setQuantityData = await db.all('SELECT * FROM set_quantity_table');

      mainWindow.webContents.send('make-drink-data', { makeDrinkData });
      mainWindow.webContents.send('set-quantity-data', { setQuantityData });
    } catch (error) {
      console.error('Error importing database:', error);
      event.reply('make-drink-data', {
        error: 'Failed to retrieve make_drink_table data',
      });
    }
  }
});

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
});
