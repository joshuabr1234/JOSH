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
const vscode = require("vscode");
const path_1 = require("path");
const Raven = require('raven');
const clipboardy = require('clipboardy');
const opn = require('opn');
const mongodb_1 = require("./lib/mongodb");
const status_bar_item_1 = require("./lib/status-bar-item");
Raven
    .config('http://b257f70b9f594d33a4992a1157f59b77:e83eb4c398434d92807f3db0ff52b2e4@sentry.jser.club:2018/8', {
    release: 'v0.1.0 release'
})
    .install();
function activate(context) {
    try {
        status_bar_item_1.default.create({
            text: '$(database) MongoDB',
            command: 'extension.showMenu',
            tooltip: 'MongoDB 数据库未启动，单击启动'
        });
        if (mongodb_1.default.runningStatus) {
            const launchOptions = vscode.workspace.getConfiguration().get('autoMongoDB');
            mongodb_1.default.start(launchOptions);
        }
        const showMenuCmd = vscode.commands.registerCommand('extension.showMenu', () => __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.default.mongoDBInstance) {
                const dbPort = yield mongodb_1.default.mongoDBInstance.getPort();
                const dbPath = yield mongodb_1.default.mongoDBInstance.getDbPath();
                const pickItems = [
                    {
                        id: 0,
                        label: '关闭 MongoDB 数据库',
                        detail: ''
                    },
                    {
                        id: 1,
                        label: '复制数据库连接 URI',
                        detail: `mongodb://localhost:${dbPort}`
                    },
                    {
                        id: 2,
                        label: '复制数据库端口号',
                        detail: dbPort + ''
                    },
                    {
                        id: 3,
                        label: '打开数据库文件所在目录',
                        detail: path_1.normalize(dbPath)
                    }
                ];
                const pickResult = yield vscode.window.showQuickPick(pickItems);
                if (pickResult) {
                    switch (pickResult.id) {
                        case 0:
                            mongodb_1.default.stop();
                            break;
                        case 1:
                            clipboardy.writeSync(`mongodb://localhost:${dbPort}`);
                            break;
                        case 2:
                            clipboardy.writeSync(dbPort + '');
                            break;
                        case 3:
                            opn(dbPath);
                            break;
                    }
                }
            }
            else {
                const launchOptions = vscode.workspace.getConfiguration().get('autoMongoDB');
                mongodb_1.default.start(launchOptions);
            }
        }));
        context.subscriptions.push(showMenuCmd);
    }
    catch (error) {
        Raven.captureException(error);
    }
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
