'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("./mongodb-memory-server");
const os_1 = require("os");
const vscode = require("vscode");
const path = require("path");
const fs = require('fs-extra');
const status_bar_item_1 = require("./status-bar-item");
class MongoDB {
    constructor() {
        this.mongoDBInstance = null;
        this.lockFilePath = path.resolve(__dirname, '../../mongod-lock');
    }
    start(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { port = null, dbName = null, dbPath = null, storageEngine = null, instanceDebug = null } = options['instance'] || {};
            const { binaryVersion = null, downloadDir = null, platform = null, arch = null, binaryDebug = null, mongoDebug = null, autoStart = null } = options['binary'] || {};
            let finalDbPath = dbPath || `${os_1.homedir()}/.mongodb/data`;
            if (!fs.existsSync(finalDbPath)) {
                fs.mkdirsSync(finalDbPath);
            }
            const mongod = new mongodb_memory_server_1.default({
                instance: {
                    port: parseInt(port) || 27017,
                    dbName: dbName || 'db',
                    dbPath: finalDbPath,
                    storageEngine,
                    debug: instanceDebug || false
                },
                binary: {
                    version: binaryVersion,
                    downloadDir: downloadDir || `${os_1.homedir()}/.mongodb/binaries`,
                    platform,
                    arch,
                    debug: binaryDebug
                },
                debug: mongoDebug,
                autoStart
            });
            yield mongod.start();
            vscode.window.showInformationMessage('数据库已启动');
            this.mongoDBInstance = mongod;
            status_bar_item_1.default.update({
                text: '$(database) MongoDB',
                command: 'extension.showMenu',
                color: '#69b241',
                tooltip: 'MongoDB 数据库已启动, 单击以查看选项'
            });
            this.updateRunningStatus(true);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongoDBInstance.stop();
            this.mongoDBInstance = null;
            status_bar_item_1.default.update({
                text: '$(database) MongoDB',
                command: 'extension.showMenu',
                tooltip: 'MongoDB 数据库未启动，单击启动'
            });
            this.updateRunningStatus(false);
        });
    }
    get instance() {
        return this.mongoDBInstance;
    }
    get runningStatus() {
        return fs.existsSync(this.lockFilePath);
    }
    updateRunningStatus(status) {
        if (status) {
            fs.writeFileSync(this.lockFilePath, '');
            return true;
        }
        fs.unlinkSync(this.lockFilePath);
        return false;
    }
}
exports.default = new MongoDB();
