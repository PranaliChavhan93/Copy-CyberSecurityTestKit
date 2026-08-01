const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let djangoProcess;

function startBackend() {

    const isDev = !app.isPackaged;

    if (isDev) {

        djangoProcess = spawn("python", ["manage.py", "runserver"], {
            cwd: path.join(__dirname, "../backend"),
            shell: true,
            windowsHide: true
        });

    } else {

        const exe = path.join(
            process.resourcesPath,
            "backend",
            "manage.exe"   // or backend.exe if that's your executable name
        );

        djangoProcess = spawn(exe, [], {
            windowsHide: true
        });

    }
}

function waitForBackend(callback) {
    const check = () => {
        http.get("http://127.0.0.1:8000", () => {
            callback();
        }).on("error", () => {
            setTimeout(check, 1000);
        });
    };

    check();
}

function createWindow() {
    startBackend();

    waitForBackend(() => {
        const win = new BrowserWindow({
            width: 1400,
            height: 900,
            webPreferences: {
                contextIsolation: true
            }
        });

        win.loadFile(path.join(__dirname, "dist", "index.html"));
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("quit", () => {
    if (djangoProcess) {
        djangoProcess.kill();
    }
});