
const { app, BrowserWindow, dialog, nativeImage, ipcMain } = require("electron")
const { autoUpdater } = require("electron-updater")
const fs = require("fs")
const path = require("path")
const { name, info, version } = require("./package.json")


// about environment
const isDev = !app.isPackaged

// about paths
const dataFile = "data.json"
const dataFolder = ".database"
const appFolder = path.join(app.getPath("appData"), name)

const dataFilePathDev = path.join(__dirname, dataFolder, dataFile)
const dataFilePath = path.join(appFolder, dataFolder, dataFile)

const dataFolderPathDev = path.join(__dirname, dataFolder)
const dataFolderPath = path.join(appFolder, dataFolder)

const checkDataFilePath = isDev ? dataFilePathDev : dataFilePath
const checkDataFolderPath = isDev ? dataFolderPathDev : dataFolderPath

// default data file structure
const defaultData = {
    selected: "",
    accounts: []
}

// FUNCTION: check if all necessary files and folders exist in ".../AppData/Roaming/"
function checkDataFile() {

    const appFolderExists = fs.existsSync(appFolder)
    const dataFolderExists = fs.existsSync(checkDataFolderPath)
    const dataFileExists = fs.existsSync(checkDataFilePath)

    if (!isDev && !appFolderExists) fs.mkdirSync(appFolder)

    if (!dataFolderExists) {

        if (isDev) console.log(`'${dataFolder}' folder no longer exists`)

        fs.mkdirSync(checkDataFolderPath)

        if (isDev) console.log(`'${dataFolder}' folder restored`)
    }

    if (!dataFileExists) {

        if (isDev) console.log(`'${dataFile}' file no longer exists`)

        const defaultDataString = JSON.stringify(defaultData, null, 4)

        fs.writeFileSync(checkDataFilePath, defaultDataString)

        if (isDev) console.log(`'${dataFile}' file restored`)
    }
}

// FUNCTION: check and adjust data file structure
function checkDataStructure() {

    const dataForCheck = JSON.parse(fs.readFileSync(checkDataFilePath))
    const defaultKeys = Object.keys(defaultData)
    const currentKeys = Object.keys(dataForCheck)

    if (currentKeys.toString() != defaultKeys.toString()) {

        if (isDev) console.log(`'${dataFile}' file to update`)

        // save and restore last settings
        const lastSelected = data.selected
        const lastAccounts = data.accounts

        const lastData = {
            selected: lastSelected ? lastSelected : defaultData.selected,
            accounts: lastAccounts ? lastAccounts : defaultData.accounts
        }

        data = lastData

        updateDataFile()

        if (isDev) console.log(`'${dataFile}' file updated`)
    }
}

// FUNCTION: update data file
function updateDataFile() {
    const updatedData = JSON.stringify(data, null, 4)
    fs.writeFileSync(checkDataFilePath, updatedData)
}

checkDataFile() // check data file/folder

let data = JSON.parse(fs.readFileSync(checkDataFilePath))

checkDataStructure() // check data file structure


// about icons
const logo = nativeImage.createFromPath(path.join(__dirname, "icons", "logo.ico"))
const updateIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "update.ico"))

// about window
let win

// app setup
app.setName(name)
app.setAppUserModelId(info.displayAppID)
app.setJumpList([]) // empty
app.disableHardwareAcceleration()


// check app instance
const instanceLock = app.requestSingleInstanceLock()

if (!instanceLock) {
    app.quit()

} else {

    // execute if app is already running
    app.on("second-instance", () => {
        win.focus()
    })

    // execute when app is ready
    app.whenReady().then(() => {   // app is ready!

        win = new BrowserWindow({

            title: info.displayName,
            icon: logo,

            width: 210,
            height: 130,

            center: true,
            show: false,

            frame: false,
            thickFrame: true,
            alwaysOnTop: true,

            resizable: false,
            fullscreenable: false,
            maximizable: false,
            minimizable: false,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                spellcheck: false
            }
        })

        win.loadFile("src/win.html")

        win.webContents.on("did-finish-load", () => {

            // correct selected option
            if (data.accounts.length != 0) {

                if (!data.accounts.some(a => a["key"] === data.selected)) {
                    data.selected = data.accounts[0].key
                }

            } else data.selected = ""

            updateDataFile()

            // IPC: send "sortlist" event (startup)
            win.webContents.send("sortList", { accounts: data.accounts, selected: data.selected, startup: true })
        })

        win.on("ready-to-show", () => {
            win.show()
        })

        // prevent system menu
        const WM_INITMENU = 0x0116;
        win.hookWindowMessage(WM_INITMENU, () => {
            win.setEnabled(false)
            win.setEnabled(true)
        })

        if (!isDev) checkForUpdates()
    })
}


// IPC: set new account
ipcMain.on("setAccount", (e, account) => {

    const accountData = {
        name: account.name,
        key: account.key
    }

    checkDataFile()

    // sort accounts alphabetically
    data.accounts.push(accountData)
    data.accounts.sort((a, b) => a.name.localeCompare(b.name))

    updateDataFile()

    // IPC: send "sortlist" event
    win.webContents.send("sortList", { accounts: data.accounts, selected: data.selected, startup: false })
})

// IPC: remove account
ipcMain.on("removeAccount", (e, key) => {

    checkDataFile()

    const accountIndex = data.accounts.findIndex(a => a.key === key)
    data.accounts.splice(accountIndex, 1)

    updateDataFile()
})

// IPC: save selected option
ipcMain.on("saveSelectedOption", (e, key) => {

    checkDataFile()

    data.selected = key

    updateDataFile()
})

// IPC: close app
ipcMain.on("quit", () => app.quit())

// IPC: log info
ipcMain.on("log", (e, text) => {
    console.log(text)
})


// FUNCTION: check for updates automatically (on startup)
function checkForUpdates() {

    // updater setup
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = false

    autoUpdater.checkForUpdates() // check for updates

    // show update message box (when downloaded)
    autoUpdater.on("update-downloaded", (updateInfo) => {

        win.hide() // hide window

        dialog.showMessageBox({
            icon: updateIcon,
            message: `New update available!   ( ${info.displayVersion} )  ->  ( v${updateInfo.version} )`,
            buttons: ["Install", "Not now"],
            noLink: true,
            defaultId: 0,
            cancelId: 1

        }).then(message => {

            if (message.response === 0) {
                autoUpdater.quitAndInstall() // quit and install update

            } else win.show() // reshow window
        })
    })

    // throw updater errors
    autoUpdater.on("error", (error) => {
        dialog.showErrorBox(`${info.displayName} UPDATER ERROR`, error)
    })
}