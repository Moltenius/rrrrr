"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optipost = exports.OptipostSession = exports.OptipostRequest = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const events_1 = require("./events");
const crypto_1 = __importDefault(require("crypto"));
class OptipostRequest {
    get Dead() { return this._Dead; }
    get dataType() {
        return (this.request.body || {}).type;
    }
    get data() {
        return (this.request.body || {}).data || {};
    }
    constructor(req, res) {
        this._Dead = false;
        this._death = new events_1.BaseEvent();
        this.death = this._death.Event;
        this.request = req;
        this.response = res;
        this.KillTimestamp = Date.now() + 500;
        this.Autostop = setTimeout(() => {
            this.Kill();
        }, 500);
    }
    Kill() {
        this.Reply({
            type: "RequestKilled",
            data: {}
        });
    }
    Reply(data) {
        if (this._Dead) {
            //throw new Error("Request already dead");
            console.warn("WARN! Request already dead");
            return;
        }
        this.response.send(JSON.stringify(data));
        clearTimeout(this.Autostop);
        this._Dead = true;
        this._death.Fire();
    }
}
exports.OptipostRequest = OptipostRequest;
class OptipostSession {
    get Dead() { return this._Dead; }
    constructor() {
        this._Dead = false;
        this.Requests = [];
        this._message = new events_1.BaseEvent();
        this._death = new events_1.BaseEvent();
        this._newRequest = new events_1.BaseEvent();
        this.message = this._message.Event;
        this.death = this._death.Event;
        this.newRequest = this._newRequest.Event;
        this.id = crypto_1.default
            .randomBytes(10)
            .toString('hex');
        this.SetupAutoDisconnect();
    }
    /**
     * @description Closes the connection
     */
    Close() {
        console.log(`Connection ${this.id} closed`);
        if (!this.Dead) {
            this._Dead = true;
            this._death.Fire();
        }
    }
    /**
     *
     * @description Sends a message to the connected client.
     * @returns {boolean} True if data sent, false if there were no open requests to send it to
     * @deprecated Use _Send instead.
     */
    _OldSend(reply) {
        if (this.Requests[0]) {
            this.Requests[0].Reply(reply);
            return true;
        }
        else {
            console.warn(`WARN! DATA DROPPED AT ${Date.now()}`);
            return false;
        }
    }
    /**
     *
     * @description Sends a message to the connected client.
     */
    _Send(reply, timesSoFar = 0) {
        if (timesSoFar == 5) {
            console.warn(`WARN! DATA DROPPED AT ${Date.now()}`);
        }
        this.Requests = this.Requests.filter(e => !e.Dead);
        if (this.Requests[0]) {
            this.Requests[0].Reply(reply);
        }
        else {
            console.log("WARN! Could not find an open request. Waiting for a new one to come in...");
            let a = null;
            let x = this.newRequest.Once(() => {
                console.log("Retrying...");
                if (a) {
                    clearTimeout(a);
                }
                this._Send(reply, timesSoFar + 1);
            });
            a = setTimeout(() => {
                x.Disconnect();
                console.warn("WARN! Timeout");
            }, 10000);
        }
    }
    Send(reply) {
        this._Send({ type: "Data", data: reply });
    }
    /**
     *
     * @deprecated Use Send() instead.
     * @returns {boolean} Whether or not the data was successfully sent
     */
    OldSend(reply) {
        return this._OldSend({ type: "Data", data: reply });
    }
    SetupAutoDisconnect() {
        if (!this.autoDisconnect) {
            this.autoDisconnect = setTimeout(() => {
                this.Close();
            }, 15000);
        }
    }
    InterpretNewRequest(req, res) {
        // Cleanup
        this.Requests = this.Requests.filter(e => !e.Dead);
        // Clear autoDisconnect timeout
        if (this.autoDisconnect) {
            clearTimeout(this.autoDisconnect);
            this.autoDisconnect = undefined;
        }
        let newRequest = new OptipostRequest(req, res);
        this.Requests.push(newRequest);
        // Basic but should work
        this._newRequest.Fire();
        console.log(`new request ${newRequest.dataType}`);
        if (newRequest.dataType == "Close") {
            this.Close();
        }
        else if (newRequest.dataType == "Data") {
            this._message.Fire(newRequest.data);
        }
        // On death, find index and splice
        newRequest.death.then(() => {
            if (this.Requests.findIndex(e => e == newRequest) != -1) {
                this.Requests.splice(this.Requests.findIndex(e => e == newRequest), 1);
            }
            // Setup auto disconnect if requests is 0
            if (this.Requests.length == 0) {
                this.SetupAutoDisconnect();
            }
        });
    }
}
exports.OptipostSession = OptipostSession;
class Optipost {
    get _connections() { return this.connections; }
    constructor(port = 3000, url = "opti", options) {
        this._connection = new events_1.BaseEvent();
        this.connections = [];
        this.connection = this._connection.Event;
        this.app = (0, express_1.default)();
        this.port = port;
        this.url = url;
        this.verbose = (options === null || options === void 0 ? void 0 : options.verbose) || false;
        this.app.use(body_parser_1.default.json({ limit: (options === null || options === void 0 ? void 0 : options.limit) || "100kb" }));
        this.app.get("/" + url, (req, res) => {
            res.send(`Optipost online`);
        });
        this.app.post("/" + url, (req, res) => {
            let body = req.body;
            // TODO: make this code not suck
            if (body.type && typeof body.data == typeof {}) {
                if (body.id) {
                    let Connection = this.connections.find(e => e.id == body.id);
                    // If connection is not dead
                    if (Connection) {
                        if (!Connection.Dead) {
                            Connection.InterpretNewRequest(req, res);
                        }
                        else {
                            res.send(JSON.stringify({
                                type: "InvalidSessionId",
                                data: {}
                            }));
                        }
                    }
                    else {
                        res.send(JSON.stringify({
                            type: "InvalidSessionId",
                            data: {}
                        }));
                    }
                }
                else if (body.type == "EstablishConnection") {
                    let session = new OptipostSession();
                    this._connection.Fire(session);
                    console.log(`Connection established ${session.id}`);
                    this.connections.push(session);
                    res.send(JSON.stringify({
                        type: "ConnectionEstablished",
                        data: { id: session.id }
                    }));
                }
            }
            else {
                res.send(JSON.stringify({
                    type: "InvalidObject",
                    data: {}
                }));
            }
        });
        this.app.listen(port, () => {
            console.log(`Optipost server now running on localhost:${port}/${url}`);
        });
    }
}
exports.Optipost = Optipost;
