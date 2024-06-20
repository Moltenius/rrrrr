"use strict";
// UNUSED (for now?)
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.Log = exports.ColorCodes = void 0;
exports.ColorCodes = {
    Black: [30, 39],
    Red: [31, 39],
    Green: [32, 39],
    Yellow: [33, 39],
    Blue: [34, 39],
    Magenta: [35, 39],
    Cyan: [36, 39],
    White: [37, 39],
    Gray: [90, 39],
    Grey: [90, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
};
class Log {
    constructor(log, descriptors, color) {
        var _a;
        this.color = "White";
        this.log = log;
        this.descriptors = descriptors;
        this.timestamp = Date.now();
        if (color) {
            this.color = color;
        }
        // log
        console.log('\u001b[' + exports.ColorCodes[this.color][0] + 'm'
            + this.log
            + ((_a = this.descriptors) === null || _a === void 0 ? void 0 : _a.join("\n"))
            + '\u001b[' + exports.ColorCodes[this.color][1] + 'm');
    }
}
exports.Log = Log;
class Logger {
    constructor() {
        this.logs = [];
    }
    Log(log, descriptors) {
        this.logs.push(new Log(log, descriptors));
    }
}
exports.Logger = Logger;
