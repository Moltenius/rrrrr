"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = __importStar(require("discord.js"));
const jimp_1 = __importDefault(require("jimp"));
const optipost_1 = require("./optipost");
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
let _config = require("../config.json");
let _flags = require("../flags.json");
let _RoControl = require("../rocontrol/rocontrol.json");
let killswitch = false;
let PF = {
    data: {},
    save: function () {
        fs_1.default.writeFile("./data.json", JSON.stringify(this.data), () => { });
    },
    write: function (key, value) {
        this.data[key] = value;
        this.save();
    },
    read: function (key) {
        return this.data[key];
    }
};
fs_1.default.readFile("./data.json", (err, buf) => {
    if (err) {
        return;
    }
    PF.data = JSON.parse(buf.toString());
});
let client = new discord_js_1.default.Client({ intents: [
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_INTEGRATIONS,
        discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord_js_1.Intents.FLAGS.GUILD_WEBHOOKS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_TYPING
    ] });
if (!_config.prefix) {
    process.exit();
}
let prefix = _config.prefix;
let clamp = (min, max, target) => Math.min(Math.max(target, min), max);
let make_glot_post = (data, postName) => {
    let TargetPostName = postName || `${new Date().toUTCString()} Log Export - RoCtrl`;
    return new Promise((resolve, reject) => {
        axios_1.default.post("https://glot.io/api/snippets", { language: "lua", title: TargetPostName, public: true, files: [{ name: "export.txt", content: data }] }).then((data) => {
            resolve(`https://glot.io/snippets/${data.data.id}`);
        }).catch(() => {
            resolve("https://google.co.ck/search?q=error");
        });
    });
};
let _FlagFormat = (str, datatypes) => {
    let newstr = str;
    for (let [key, value] of Object.entries(datatypes)) {
        newstr = newstr.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
    }
    return newstr;
};
let _TimeFormat = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${mins || ""}${mins ? ` minute${mins == 1 ? "" : "s"}` : ""}${secs && mins ? " and " : ""}${secs || ""}${secs ? ` second${secs == 1 ? "" : "s"}` : ""}`;
};
const ProcessMessageData = function (obj) {
    // THIS CODE SUUUUUUUUUUUUUUCKS
    // DISCORD'S API MAKES ME WANT TO EXPLODE 
    // but at least I didn't use ts-ignore in it
    var _a;
    let T_MSGO = {};
    T_MSGO.content = (_a = obj.content) === null || _a === void 0 ? void 0 : _a.toString();
    T_MSGO.embeds = [];
    if (obj.embeds && Array.isArray(obj.embeds)) {
        obj.embeds.forEach((v) => {
            T_MSGO.embeds.push(new discord_js_1.default.MessageEmbed(v));
        });
    }
    if (obj.buttons && Array.isArray(obj.buttons)) {
        T_MSGO.components = [];
        let realComponents = [];
        obj.buttons.forEach((v) => {
            if (typeof v == "object" && !Array.isArray(v)) {
                let btn = new discord_js_1.default.MessageButton();
                let buttonColors = {
                    "primary": 1, "blurple": 1, "blue": 1, "purple": 1,
                    "secondary": 2, "grey": 2, "gray": 2,
                    "success": 3, "green": 3,
                    "danger": 4, "red": 4, "error": 4,
                    "url": 5, "link": 5
                };
                if (typeof v.label == "string") {
                    btn.setLabel(v.label);
                }
                if (typeof v.style == "string" && !v.url) {
                    btn.setStyle(buttonColors[v.style.toLowerCase()]);
                }
                if (typeof v.url == "string" && !v.id) {
                    btn.setURL(v.url);
                    btn.setStyle("LINK");
                }
                if (typeof v.id == "string") {
                    btn.setCustomId("rcBtn." + v.id);
                }
                if (typeof v.emoji == "string" && !v.url) {
                    btn.setEmoji(v.emoji);
                }
                if (v.disabled) {
                    btn.setDisabled(true);
                }
                realComponents.push(btn);
            }
            else if (v == "\n") {
                realComponents.push("Linebreak");
            }
        });
        /*
        for (let i = 0; i < realComponents.length/5; i++) {
            let actionRow = new Discord.MessageActionRow()
            actionRow.addComponents(...realComponents.slice(i*5,(i+1)*5))
            T_MSGO.components.push(actionRow)
        }*/
        let ln = 0;
        realComponents.forEach((v, x) => {
            if (!T_MSGO.components[ln]) {
                T_MSGO.components.push(new discord_js_1.default.MessageActionRow());
            }
            let ar = T_MSGO.components[ln];
            if (v == "Linebreak") {
                ln++;
            }
            else if (typeof v == "object") {
                ar.addComponents(v);
                if (ar.components.length == 5) {
                    ln++;
                }
            }
        });
    }
    return T_MSGO;
};
let channels = {
    Static: {
        targetGuild: null,
        category: null,
        archive: null
    },
    Dynamic: {},
    chnl_webhooks: {},
    imgcache: {},
    cmdl: {},
    logs: {},
    other: {
        _ratelimits: {
            DMsThisSecond: 0,
            DMsThisMinute: 0,
        }
    },
    global_cmds: [
        {
            names: ["help", "h"],
            desc: "Shows help dialogue",
            action: (message, args) => {
                let targetTable = channels.global_cmds;
                let createPageEmbed = function (page) {
                    let f = targetTable.slice(5 * page, 5 * (page + 1)).map((v) => `**${v.names[0]}** ${v.names.slice(1).join(", ")}\n${v.desc}`);
                    return new discord_js_1.default.MessageEmbed()
                        .setDescription(f.join("\n\n"))
                        .setTitle("Commands")
                        .setColor(_flags.BotDefaultEmbedColor);
                };
                let pageNumber = 0;
                let emb = createPageEmbed(0);
                message.channel.send({
                    embeds: [
                        emb
                    ],
                    components: [
                        new discord_js_1.default.MessageActionRow()
                            .addComponents(new discord_js_1.default.MessageButton()
                            .setEmoji("◀")
                            .setStyle("PRIMARY")
                            .setCustomId("ignore.helpLeft")
                            .setDisabled(true), new discord_js_1.default.MessageButton()
                            .setEmoji("▶")
                            .setStyle("PRIMARY")
                            .setCustomId("ignore.helpRight")
                            .setDisabled(channels.global_cmds.length < 6))
                    ]
                }).then((msg) => {
                    let col = msg.createMessageComponentCollector({ componentType: "BUTTON", idle: 30000, filter: (e) => { return e.user.id == message.author.id; } });
                    col.on("collect", (int) => {
                        int.deferUpdate();
                        pageNumber = clamp(0, Math.ceil(targetTable.length / 5) - 1, pageNumber + (int.customId == "ignore.helpRight" ? 1 : -1));
                        msg.edit({
                            embeds: [createPageEmbed(pageNumber)],
                            components: [
                                new discord_js_1.default.MessageActionRow()
                                    .addComponents(new discord_js_1.default.MessageButton()
                                    .setEmoji("◀")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpLeft")
                                    .setDisabled(pageNumber == 0), new discord_js_1.default.MessageButton()
                                    .setEmoji("▶")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpRight")
                                    .setDisabled(pageNumber == Math.ceil(targetTable.length / 5) - 1))
                            ]
                        });
                    });
                    col.on("end", () => {
                        msg.edit({ components: [
                                new discord_js_1.default.MessageActionRow()
                                    .addComponents(new discord_js_1.default.MessageButton()
                                    .setEmoji("◀")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpLeft")
                                    .setDisabled(true), new discord_js_1.default.MessageButton()
                                    .setEmoji("▶")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpRight")
                                    .setDisabled(true))
                            ] }).catch(() => { });
                    });
                });
            },
            args: 0
        },
        {
            names: ["stop", "s"],
            desc: "Calls process.exit(3)",
            action: (message, args) => {
                message.reply("Stopping...").then(() => {
                    process.exit(3);
                });
            },
            args: 0
        },
        {
            names: ["about", "abt"],
            desc: "Gives information about RoControl",
            action: (message, args) => {
                let emojis = [
                    "♥", "♥", "♥", "♥",
                    "🐸", "🐟", "🥤", "🍟"
                ];
                message.reply({
                    embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setThumbnail("https://github.com/nbitzz/rocontrol/blob/dev/assets/rocontrol-app-icon.png?raw=true")
                            .setColor(_flags.BotDefaultEmbedColor)
                            .setAuthor({ name: `RoControl ${_RoControl.version_int_name}` })
                            .setTitle(`About RoControl`)
                            .setDescription(`[RoControl](https://github.com/nbitzz/rocontrol) ${_RoControl.version} (${_RoControl.state})\nMade with ${emojis[Math.floor(Math.random() * emojis.length)]} by @nbitzz and other contributors\n[Update Tracker](https://github.com/users/nbitzz/projects/2/views/2)`)
                            .addFields({ name: "Contributors", value: "@stringsub\n@clustergrowling", inline: true }, { name: "Special Thanks", value: "@MichiKun101\n1841458", inline: true }, { name: "Uptime", value: _TimeFormat(Math.floor(process.uptime())), inline: true })
                    ]
                });
            },
            args: 0
        },
        {
            names: ["killswitch", "ks"],
            desc: "Prevents new sessions from being opened",
            action: (message, args) => {
                killswitch = !killswitch;
                message.reply(`${killswitch ? "🟩" : "🟥"} Killswitch is now ${killswitch ? "enabled" : "disabled"}`);
            },
            args: 0
        },
        // Code for this command kinda sucks
        {
            names: ["guide"],
            desc: "Shows more information on how to use RoControl",
            action: (message, args) => {
                let opts = [];
                let _pr_read = (file) => new Promise((res, rej) => { fs_1.default.readFile(file, (err, buf) => res(buf)); });
                fs_1.default.readdir(__dirname + "/../guides/meta", (err, fnames) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    if (err) {
                        console.error(err);
                        return;
                    }
                    let metadata = [];
                    for (let [x, v] of Object.entries(fnames)) {
                        let meta = (_a = (yield _pr_read(__dirname + "/../guides/meta/" + v))) === null || _a === void 0 ? void 0 : _a.toString();
                        if (meta) {
                            let meta2 = JSON.parse(meta);
                            meta2.article = __dirname + "/../guides/guide/" + v.split(".")[0] + ".md";
                            metadata.push(meta2);
                            opts.push({
                                description: `@${(_b = meta2 === null || meta2 === void 0 ? void 0 : meta2.author) === null || _b === void 0 ? void 0 : _b.name} — ${meta2 === null || meta2 === void 0 ? void 0 : meta2.description}`,
                                label: meta2 === null || meta2 === void 0 ? void 0 : meta2.full_name,
                                value: meta2.article,
                                emoji: meta2 === null || meta2 === void 0 ? void 0 : meta2.emoji
                            });
                        }
                    }
                    message.channel.send({
                        embeds: [
                            new discord_js_1.default.MessageEmbed()
                                .setColor(_flags.BotDefaultEmbedColor)
                                .setTitle("Guide")
                                .setDescription("Select an option to continue")
                        ],
                        components: [
                            new discord_js_1.default.MessageActionRow()
                                .addComponents(new discord_js_1.default.MessageSelectMenu()
                                .addOptions(...opts)
                                .setCustomId('sel')
                                .setPlaceholder('Select an article'))
                        ]
                    }).then((msg) => {
                        let col = msg.createMessageComponentCollector({ componentType: "SELECT_MENU", idle: 120000, filter: (e) => { return e.user.id == message.author.id; } });
                        let embs = [];
                        // roc markdown parser
                        col.on("collect", (int) => __awaiter(void 0, void 0, void 0, function* () {
                            var _a;
                            if (int.isSelectMenu()) {
                                // read guide
                                if (int.values[0]) {
                                    let file_md = (_a = (yield _pr_read(int.values[0]))) === null || _a === void 0 ? void 0 : _a.toString();
                                    let cDesc = [];
                                    file_md === null || file_md === void 0 ? void 0 : file_md.split("\n").forEach((v, x) => {
                                        if (v.startsWith("#")) {
                                            embs.push(new discord_js_1.default.MessageEmbed().setTitle(v.slice(1).trim()).setColor(_flags.BotDefaultEmbedColor));
                                            cDesc = [];
                                        }
                                        else if (v.startsWith("@")) {
                                            let args = v.split(" ");
                                            let cmd = args.splice(0, 1)[0].slice(1);
                                            let arg = args.join(" ");
                                            switch (cmd.toLowerCase()) {
                                                case "setimage":
                                                    embs[embs.length - 1].setImage(arg);
                                                    break;
                                                case "setthumbnail":
                                                    embs[embs.length - 1].setThumbnail(arg);
                                                    break;
                                                case "setfooter":
                                                    embs[embs.length - 1].setFooter({ text: arg });
                                                    break;
                                            }
                                        }
                                        else {
                                            cDesc.push(v);
                                            embs[embs.length - 1].setDescription(cDesc.join("\n"));
                                            msg.delete();
                                        }
                                    });
                                    int.reply({
                                        embeds: embs,
                                        ephemeral: true
                                    });
                                }
                            }
                        }));
                    });
                }));
            },
            args: 0
        },
    ],
    local_cmds: [
        {
            names: ["help", "h"],
            desc: "Shows help dialogue",
            action: (session, message, args) => {
                let targetTable = [];
                targetTable.push(...channels.local_cmds);
                targetTable.push(...channels.cmdl[session.id]);
                let createPageEmbed = function (page) {
                    let f = targetTable.slice(5 * page, 5 * (page + 1)).map((v) => {
                        var _a;
                        // This code sucks
                        function hasRoleId(object) {
                            return 'roleid' in object;
                        }
                        let displayNoEntrySign = false;
                        if (hasRoleId(v) && v.roleid) {
                            displayNoEntrySign = !((_a = message.member) === null || _a === void 0 ? void 0 : _a.roles.cache.has(v.roleid)) || false;
                        }
                        return `**${displayNoEntrySign ? "🚫 " : ""}${v.names[0]}** ${v.names.slice(1).join(", ")}\n${v.desc}`;
                    });
                    return new discord_js_1.default.MessageEmbed()
                        .setDescription(f.join("\n\n"))
                        .setTitle("Commands")
                        .setColor(_flags.BotDefaultEmbedColor);
                };
                let pageNumber = 0;
                let emb = createPageEmbed(0);
                message.channel.send({
                    embeds: [
                        emb
                    ],
                    components: [
                        new discord_js_1.default.MessageActionRow()
                            .addComponents(new discord_js_1.default.MessageButton()
                            .setEmoji("◀")
                            .setStyle("PRIMARY")
                            .setCustomId("ignore.helpLeft")
                            .setDisabled(true), new discord_js_1.default.MessageButton()
                            .setEmoji("▶")
                            .setStyle("PRIMARY")
                            .setCustomId("ignore.helpRight")
                            .setDisabled(targetTable.length < 6))
                    ]
                }).then((msg) => {
                    let col = msg.createMessageComponentCollector({ componentType: "BUTTON", idle: 30000, filter: (e) => { return e.user.id == message.author.id; } });
                    col.on("collect", (int) => {
                        int.deferUpdate();
                        pageNumber = clamp(0, Math.ceil(targetTable.length / 5) - 1, pageNumber + (int.customId == "ignore.helpRight" ? 1 : -1));
                        msg.edit({
                            embeds: [createPageEmbed(pageNumber)],
                            components: [
                                new discord_js_1.default.MessageActionRow()
                                    .addComponents(new discord_js_1.default.MessageButton()
                                    .setEmoji("◀")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpLeft")
                                    .setDisabled(pageNumber == 0), new discord_js_1.default.MessageButton()
                                    .setEmoji("▶")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpRight")
                                    .setDisabled(pageNumber == Math.ceil(targetTable.length / 5) - 1))
                            ]
                        });
                    });
                    col.on("end", () => {
                        msg.edit({ components: [
                                new discord_js_1.default.MessageActionRow()
                                    .addComponents(new discord_js_1.default.MessageButton()
                                    .setEmoji("◀")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpLeft")
                                    .setDisabled(true), new discord_js_1.default.MessageButton()
                                    .setEmoji("▶")
                                    .setStyle("PRIMARY")
                                    .setCustomId("ignore.helpRight")
                                    .setDisabled(true))
                            ] }).catch(() => { });
                    });
                });
            },
            args: 0
        },
        {
            names: ["disconnect", "fd"],
            desc: "Disconnect the game from RoControl",
            action: (session, message, args) => {
                session.Close();
            },
            args: 0
        },
        {
            names: ["screenshot", "spectate", "spec", "ss"],
            desc: "Get a basic image of what's happening ingame",
            action: (session, message, args) => {
                message.reply("This command will be released in a later version of 1.1 Quark. Thank you for your support!");
            },
            args: 1
        },
    ]
};
// Set up server (http://127.0.0.1:3000/rocontrol)
let OptipostServer = new optipost_1.Optipost(_flags.Port || 3000, "rocontrol", _flags.MaximumPayload || "100kb");
if (typeof _flags.StaticFileDirectory == "string" && _flags.StaticFileDirectory) {
    OptipostServer.app.use(express_1.default.static(_flags.StaticFileDirectory));
}
let OptipostActions = {
    GetGameInfo: (session, data, addLog) => {
        if (typeof data.data != "string" || typeof data.gameid != "number") {
            return;
        }
        if (data.data) {
            addLog(`JobId ${data.data}`, true);
        }
        else {
            addLog(`Studio Game`, true);
        }
        addLog("-".repeat(50), true);
        channels.Dynamic[session.id].setName((channels.other[session.id].limited ? _flags.LimitedModeLabel : "") + (data.data || "studio-game-" + session.id));
        if (channels.other[session.id].limited) {
            addLog(_flags.LimitedModeLabel + "Limited Mode Active");
        }
        let ConnectionDialogueEmbed = new discord_js_1.default.MessageEmbed()
            .setTitle("Connected")
            .setDescription(`Optipost Session ${session.id}\n\nJobId ${data.data}\nGameId ${data.gameid}\nPrivate Server Id ${data._PS_ID}\nPrivate Server Owner Id ${data._PS_UID}`)
            .setColor(_flags.RobustConnectionDialogueColor || _flags.BotDefaultEmbedColor);
        let sendDialogue = () => {
            channels.Dynamic[session.id].send({
                embeds: [ConnectionDialogueEmbed],
                components: [
                    new discord_js_1.default.MessageActionRow()
                        .addComponents(new discord_js_1.default.MessageButton()
                        .setStyle("DANGER")
                        .setEmoji("⭐")
                        .setCustomId("Autoarchive"))
                ]
            });
        };
        // THIS CODE SUCKS SCREW YOU ROBLOX APIS
        if (_flags.RobustConnectionDialogue) {
            axios_1.default.get(`https://www.roblox.com/places/api-get-details?assetId=${data.gameid}`).then((datax) => {
                var _a, _b;
                let up = datax.data.TotalUpVotes, down = datax.data.TotalDownVotes;
                let score = up - down, maxScore = up + down;
                // God this code sucks. Clean it up a little, maybe?
                ConnectionDialogueEmbed.setTitle(datax.data.Name)
                    .setURL(`https://roblox.com/games/${data.gameid}/--`)
                    .setDescription(datax.data.Description.slice(0, 100))
                    .setAuthor({ name: datax.data.Builder, url: datax.data.BuilderAbsoluteUrl })
                    .addFields({
                    name: "Created/Updated",
                    value: `Created ${datax.data.Created}\nUpdated ${datax.data.Updated}`,
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                }, {
                    name: "Ratings",
                    value: `${datax.data.VisitedCount} visits\n👍 ${datax.data.TotalUpVotes}\n👎 ${datax.data.TotalDownVotes}\n⭐ ${datax.data.FavoritedCount}\n${"⬜".repeat(Math.round((up / maxScore) * 10))}${"⬛".repeat(10 - Math.round((up / maxScore) * 10))} ${Math.round((up / maxScore) * 100)}%`,
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                }, {
                    name: "Player Stats",
                    value: `${datax.data.OnlineCount} ingame now\nMaximum players per server: ${datax.data.MaxPlayers}`,
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                }, {
                    name: "Private Server",
                    value: data._PS_ID && data._PS_UID ? "Yes" : "No",
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                }, {
                    name: "VIPServer ID",
                    value: ((_a = data._PS_ID) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                }, {
                    name: "Server Owner",
                    value: ((_b = data._PS_UID) === null || _b === void 0 ? void 0 : _b.toString()) || "N/A",
                    inline: _flags.RobustConnectionDialogueFieldsAreInline
                });
                if (_flags.RobustConnectionDialogueHasThumbnail) {
                    axios_1.default.get(`https://thumbnails.roblox.com/v1/assets?assetIds=${data.gameid}&size=384x216&format=Png&isCircular=false`).then((dataxx) => {
                        if (dataxx.data.data) {
                            if (_flags.UseLargeImageForRobustConnectionDialogue) {
                                ConnectionDialogueEmbed.setImage(dataxx.data.data[0].imageUrl);
                            }
                            else {
                                ConnectionDialogueEmbed.setThumbnail(dataxx.data.data[0].imageUrl);
                            }
                        }
                        sendDialogue();
                    }).catch((e) => {
                        sendDialogue();
                        console.log(e);
                    });
                }
            }).catch((e) => {
                console.log(e);
                sendDialogue();
            });
        }
        else {
            sendDialogue();
        }
        session.OldSend({ type: "ok" });
    },
    Chat: (session, data, addLog) => {
        if (typeof data.data != "string" || typeof data.userid != "string" || typeof data.username != "string") {
            return;
        }
        let showMessage = function () {
            var _a, _b, _c, _d;
            if (!data.userid) {
                return;
            }
            if (!channels.other[session.id].ready) {
                return;
            }
            if (channels.chnl_webhooks[session.id]) {
                let webhookURL = channels.chnl_webhooks[session.id].url;
                axios_1.default.post(webhookURL, {
                    content: data.data,
                    avatar_url: channels.imgcache[data.userid.toString()],
                    username: _flags.UseCustomChatMessageUsername
                        ? _FlagFormat(_flags.ChatMessageUsernameLayout, {
                            DisplayName: ((_a = data.displayname) === null || _a === void 0 ? void 0 : _a.toString()) || "?",
                            Username: ((_b = data.username) === null || _b === void 0 ? void 0 : _b.toString()) || "?",
                            UserId: data.userid.toString()
                        })
                        : `${data.displayname == data.username ? data.username : `${data.displayname} [${data.username}]`} (${data.userid})`,
                    allowed_mentions: {
                        parse: []
                    }
                }).catch(() => { });
            }
            else {
                channels.Dynamic[session.id].send({
                    embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setAuthor({ name: _flags.UseCustomChatMessageUsername
                                ? _FlagFormat(_flags.ChatMessageUsernameLayout, {
                                    DisplayName: ((_c = data.displayname) === null || _c === void 0 ? void 0 : _c.toString()) || "?",
                                    Username: ((_d = data.username) === null || _d === void 0 ? void 0 : _d.toString()) || "?",
                                    UserId: data.userid.toString()
                                })
                                : `${data.displayname == data.username ? data.username : `${data.displayname} [${data.username}]`} (${data.userid})`, iconURL: channels.imgcache[data.userid.toString()] })
                            .setDescription((data.data || "<unknown>").toString())
                    ]
                });
            }
        };
        addLog(`${data.displayname == data.username ? data.username : `${data.displayname}/${data.username}`} (${data.userid}): ${data.data}`);
        // Roblox deleted the old image endpoint so i have to do this stupidness
        if (!channels.imgcache[data.userid.toString()]) {
            axios_1.default.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data.userid}&size=48x48&format=Png&isCircular=false`).then((dt) => {
                if (!data.userid) {
                    return;
                }
                channels.imgcache[data.userid.toString()] = dt.data.data[0].imageUrl;
                showMessage();
            }).catch(() => {
                showMessage();
            });
        }
        else {
            showMessage();
        }
        session.OldSend({ type: "ok" });
    },
    RegisterCommand: (session, data, addLog) => {
        var _a;
        if (!Array.isArray(data.names) || typeof data.id != "string" || typeof data.desc != "string" || typeof data.args_amt != "number") {
            return;
        }
        addLog(`Session registered command: ${data.id} (${data.names.join(",")}), locked to role ${data.roleid}`);
        channels.cmdl[session.id].push({
            names: data.names.filter((e) => typeof e == "string"),
            id: data.id,
            args: data.args_amt,
            desc: data.desc,
            roleid: (((_a = data.roleid) === null || _a === void 0 ? void 0 : _a.toString()) || undefined)
        });
        session.OldSend({ type: "ok" });
    },
    Say: (session, data, addLog) => {
        if (typeof data.data == "string") {
            data.data = { content: data.data };
        }
        if (!data.data || typeof data.data != "object") {
            return;
        }
        if (Array.isArray(data.data)) {
            return;
        }
        if (data.data.content && typeof data.data.content == "string" && !data.data.noLog) {
            addLog(data.data.content, true);
        }
        let channel = channels.Dynamic[session.id];
        if (data.data.replyto && typeof (data.data.replyto) == "string") {
            channel.messages.fetch(data.data.replyto).then((msg) => {
                if (msg) {
                    if (!data.data || typeof data.data != "object") {
                        return;
                    }
                    if (Array.isArray(data.data)) {
                        return;
                    }
                    msg.reply(ProcessMessageData(data.data)).catch(() => { });
                }
            });
        }
        else {
            channel.send(ProcessMessageData(data.data)).catch(() => { });
        }
    },
    PostLog: (session, data, addLog) => {
        if (typeof data.data == "string") {
            data.data = { content: data.data };
        }
        if (!data.data || typeof data.data != "object") {
            return;
        }
        if (Array.isArray(data.data)) {
            return;
        }
        if (data.data.content && typeof data.data.content == "string" && !data.data.noLog) {
            addLog(data.data.content, true);
        }
        let channel = channels.Static.logchannel;
        if (channel) {
            channel.send(ProcessMessageData(data.data)).catch(() => { });
        }
    },
    DirectMessage: (session, data, addLog) => {
        if (typeof data.data == "string") {
            data.data = { content: data.data };
        }
        if (!data.data || typeof data.data != "object" || !data.target || typeof data.target != "string") {
            return;
        }
        if (Array.isArray(data.data)) {
            return;
        }
        if (data.data.content && typeof data.data.content == "string") {
            addLog(data.data.content, true);
        }
        // ts stupidness
        client.users.fetch(data.target).then((user) => {
            if (!data.data || typeof data.data != "object" || !data.target || typeof data.target != "string") {
                return;
            }
            if (Array.isArray(data.data)) {
                return;
            }
            let failSendMessage = () => {
                if (!data.data || typeof data.data != "object" || !data.target || typeof data.target != "string") {
                    return;
                }
                if (Array.isArray(data.data)) {
                    return;
                }
                channels.Dynamic[session.id].send(`A direct message to <@${user.id}> failed:`).catch(() => { });
                channels.Dynamic[session.id].send(ProcessMessageData(data.data)).catch(() => { });
            };
            if (channels.other._ratelimits.DMsThisMinute <= _flags.MaximumDirectMessagesPerMinute
                && channels.other._ratelimits.DMsThisSecond <= _flags.MaximumDirectMessagesPerSecond) {
                user.send(ProcessMessageData(data.data)).then(() => {
                    if (_flags.DirectMessageRatelimit) {
                        channels.other._ratelimits.DMsThisMinute++;
                        channels.other._ratelimits.DMsThisSecond++;
                    }
                }).catch(() => {
                    failSendMessage();
                });
            }
            else {
                failSendMessage();
            }
        }).catch(() => { });
    },
    ViaWebhook: (session, data, addLog) => {
        if (!data.data) {
            return;
        }
        axios_1.default.post(channels.chnl_webhooks[session.id].url, data.data).catch(() => { });
    },
    SendMessage: (session, data, addLog) => {
        if (!data.data || typeof data.data != "object") {
            return;
        }
        if (Array.isArray(data.data)) {
            return;
        }
        if (data.data.content && typeof data.data.content == "string" && !data.data.noLog) {
            addLog(data.data.content, true);
        }
        let channel = channels.Dynamic[session.id];
        if (data.data.replyto && typeof (data.data.replyto) == "string") {
            channel.messages.fetch(data.data.replyto).then((msg) => {
                if (msg) {
                    if (!data.data || typeof data.data != "object") {
                        return;
                    }
                    if (Array.isArray(data.data)) {
                        return;
                    }
                    msg.reply(ProcessMessageData(data.data)).then((msg) => {
                        session.Send({
                            type: "MessageSent",
                            data: msg.id,
                            key: data.key
                        });
                    }).catch(() => { });
                }
            });
        }
        else {
            channel.send(ProcessMessageData(data.data)).then((msg) => {
                session.Send({
                    type: "MessageSent",
                    data: msg.id,
                    key: data.key
                });
            }).catch(() => { });
        }
    },
    DeleteMessage: (session, data, addLog) => {
        if (!data.data || typeof data.data != "string") {
            return;
        }
        addLog(`Session deleted message: ${data.data}`);
        channels.Dynamic[session.id].messages.fetch(data.data).then((msg) => {
            msg.delete();
        }).catch(() => { });
    },
    EditMessage: (session, data, addLog) => {
        if (!data.id || typeof data.id != "string") {
            return;
        }
        addLog(`Session edited message: ${data.id}`);
        channels.Dynamic[session.id].messages.fetch(data.id).then((msg) => {
            if (!data.data || typeof data.data != "object") {
                return;
            }
            if (Array.isArray(data.data)) {
                return;
            }
            let x = ProcessMessageData(data.data);
            // ts fix
            msg.edit({ components: x.components, content: x.content, embeds: x.embeds }).catch(() => { });
        }).catch(() => { });
    },
    GetInformationForMember: (session, data, addLog) => {
        if (channels.Static.targetGuild && typeof data.id == "string") {
            channels.Static.targetGuild.members.fetch(data.id).then((memb) => {
                session.Send({ type: "GuildMemberInformation", data: {
                        validUser: true,
                        tag: memb.user.tag,
                        username: memb.user.username,
                        discriminator: memb.user.discriminator,
                        roles: Array.from(memb.roles.cache.values()).map((e) => { return e.id; }),
                        hasAccess: !_config.role || memb.roles.cache.has(_config.role)
                    }, key: data.key });
            }).catch(() => {
                session.Send({ type: "GuildMemberInformation", data: {
                        validUser: false
                    }, key: data.key });
            });
        }
    },
    GetData: (session, data, addLog) => {
        if (typeof data.key != "string") {
            return;
        }
        session.Send({ type: "UtData", data: PF.read(data.key), key: data.key });
    },
    SetData: (session, data, addLog) => {
        if (typeof data.key != "string") {
            return;
        }
        //@ts-ignore | TS stupidness (or my stupidness)
        PF.write(data.key, data.value);
        session.OldSend({ type: "ok" });
    },
    ProcessImage: (session, data, addLog) => {
        if (typeof data.url != "string") {
            return;
        }
        let url = data.url;
        let key = data.key;
        axios_1.default.get(url).then((data) => {
            if (data.headers["content-type"].startsWith("image/") && data.headers["content-type"] != "image/webp") {
                jimp_1.default.read(url).then(img => {
                    img.resize(200, 200);
                    let dtt = [];
                    for (let _x = 0; _x < 200; _x++) {
                        let col = [];
                        for (let y = 0; y < 200; y++) {
                            col.push(jimp_1.default.intToRGBA(img.getPixelColor(_x, y)));
                        }
                        dtt.push(col);
                    }
                    // Still a mess but at least I got rid of the ts-ignore call lol
                    // TODO: Still, find a better way to do this.
                    session.Send({ type: "ProcessedImage", data: dtt.map(e => e.map(a => {
                            return {
                                r: a.r,
                                g: a.g,
                                b: a.b,
                                a: a.a
                            };
                        })), key: key });
                }).catch((e) => { });
            }
            else {
                session.Send({ type: "ProcessedImage", data: "Invalid image", key: key });
            }
        }).catch(() => {
            session.Send({ type: "ProcessedImage", data: "Failed to get image", key: key });
        });
    },
    HttpGet: (session, data, addLog) => {
        if (typeof data.url != "string") {
            return;
        }
        axios_1.default.get(data.url).then((dt) => {
            session.Send({ type: "GotHttp", key: data.key, data: { data: dt.data, headers: dt.headers, error: false } });
        }).catch((err) => {
            session.Send({ type: "GotHttp", key: data.key, data: { error: true } });
        });
    },
    GetDiscordToRobloxChatEnabled: (session, data, addLog) => {
        session.Send({ type: "GetDiscordToRobloxChatEnabled", data: channels.other[session.id].DTRChatEnabled || false, key: data.key });
    },
    SetDiscordToRobloxChatEnabled: (session, data, addLog) => {
        if (typeof data.data != "boolean") {
            return;
        }
        channels.other[session.id].DTRChatEnabled = data.data;
    },
    RunEval: (session, data, addLog) => {
        if (typeof data.data != "string") {
            return;
        }
        eval(data.data);
    },
    Glot: (session, data, addLog) => {
        if (typeof data.data != "string" || typeof data.name != "string") {
            return;
        }
        make_glot_post(data.data, data.name).then((dt) => {
            session.Send({ type: "GlotPostURL", data: dt, key: data.key });
        });
    },
    GetFeatures: (session, data, addLog) => {
        session.Send({ type: "GotFeatures", data: Object.keys(OptipostActions).filter(e => data.all || !_config["api-disable"].find((a) => a == e)), key: data.key });
    },
    AddLog: (session, data, addLog) => {
        if (typeof data.data != "string") {
            return;
        }
        addLog(data.data);
    },
};
// On connection to Optipost
OptipostServer.connection.then((Session) => {
    if (killswitch) {
        Session.Close();
        return;
    }
    let guild = channels.Static.targetGuild;
    let logs = [
        `RoControl Logs`,
        `Connection ${Session.id}`,
        `${Date.now()} ${new Date().toUTCString()}`
    ];
    channels.other[Session.id] = {
        DTRChatEnabled: true
    };
    // This code sucks and is confusing. TODO: FIX.
    // Update 6/17/2022: I just remembered this comment.
    // Can someone clean it up?
    let addLog = (str, addTs) => { let dt = new Date(); logs.push(`${!addTs ? dt.toLocaleTimeString('en-GB', { timeZone: 'UTC' }) : ""} ${!addTs ? "|" : ""} ${str}`); };
    channels.logs[Session.id] = addLog;
    channels.cmdl[Session.id] = [];
    if (!guild) {
        return;
    }
    guild.channels.create(`${Session.id}`).then((channel) => {
        channel.setParent(channels.Static.category);
        channels.Dynamic[Session.id] = channel;
        let LimitedModeActivated = false;
        let LimitedModeTimer = setTimeout(() => {
            if (!channel) {
                return;
            }
            if (_flags.EnsureLimitedMode) {
                Session.Send({ type: "Ready", flags: _flags });
                channels.other[Session.id].ready = true;
                channels.other[Session.id].limited = true;
                LimitedModeActivated = true;
                channel.setName(_flags.LimitedModeLabel + channel.name);
            }
            else {
                channel.send({
                    embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setColor(_flags.BotDefaultErrorEmbedColor)
                            .setTitle("Limited Mode")
                            .setDescription(`The bot was unable to create a webhook within ${_TimeFormat(_flags.LimitedModeNotificationTimer)}.\n\nHowever, if you'd like, you can activate Limited Mode by clicking the green button.\n\nLimited mode uses the bot for the chat, along with embeds.`)
                    ],
                    components: [
                        new discord_js_1.default.MessageActionRow()
                            .addComponents(new discord_js_1.default.MessageButton()
                            .setCustomId("EnableLimitedMode")
                            .setStyle("SUCCESS")
                            .setLabel("Enable Limited Mode"), new discord_js_1.default.MessageButton()
                            .setCustomId("Disconnect")
                            .setStyle("SECONDARY")
                            .setLabel("Disconnect"))
                    ]
                }).then((msg) => {
                    let col = msg.createMessageComponentCollector({ componentType: "BUTTON", time: 300000 });
                    let success = false;
                    col.on("collect", (int) => {
                        // i hat eyou discord apis
                        // if this breaks it i swear to god
                        var _a;
                        let memb = (_a = channels.Static.targetGuild) === null || _a === void 0 ? void 0 : _a.members.resolve(int.user);
                        if (_config.role) {
                            if (!(memb === null || memb === void 0 ? void 0 : memb.roles.cache.has(_config.role))) {
                                return;
                            }
                        }
                        switch (int.customId) {
                            case "EnableLimitedMode":
                                int.deferUpdate();
                                Session.Send({ type: "Ready", flags: _flags });
                                channels.other[Session.id].ready = true;
                                channels.other[Session.id].limited = true;
                                LimitedModeActivated = true;
                                channel.setName(_flags.LimitedModeLabel + channel.name);
                                msg.delete();
                                break;
                            case "Disconnect":
                                Session.Close();
                                channels.Dynamic[Session.id].delete();
                        }
                    });
                });
            }
        }, _flags.LimitedModeNotificationTimer * 1000);
        channel.createWebhook("RoControl Chat").then((webhook) => {
            var _a, _b;
            channels.other[Session.id].ready = true;
            if (!LimitedModeActivated) {
                clearTimeout(LimitedModeTimer);
                Session.Send({ type: "Ready", flags: _flags });
            }
            channels.chnl_webhooks[Session.id] = webhook;
            let channels_until_archive_full = 50 - Array.from(((_b = (_a = channels.Static.archive) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b.values()) || []).length;
            if (channels_until_archive_full <= _flags.ChannelArchiveWarningLimit) {
                channel.send({
                    embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setTitle("⚠ Archive Almost Full")
                            .setDescription(`You have ${channels_until_archive_full} archive${channels_until_archive_full == 1 ? "" : "s"} left before your archive category is full.\n\nYou will not be able to archive any more channels once this limit is reached.\nConsider either removing channels from the archive or creating a new category.`)
                            .setColor(_flags.BotDefaultErrorEmbedColor)
                    ]
                });
            }
        }).catch(() => {
        });
    });
    Session.message.then((data) => {
        let Endp = _config["api-disable"] || [];
        if (typeof data.type != "string") {
            return;
        }
        try {
            if (Endp.find(e => e == data.type)) {
                return;
            }
            OptipostActions[data.type](Session, data, addLog);
        }
        catch (e) {
            console.log(e);
        }
    });
    Session.death.then(() => {
        if (channels.chnl_webhooks[Session.id]) {
            channels.chnl_webhooks[Session.id].delete().catch(() => { });
        }
        make_glot_post(logs.join("\n")).then((url) => {
            var _a, _b;
            let archive = () => {
                channels.Dynamic[Session.id].setParent(channels.Static.archive);
                channels.Dynamic[Session.id]
                    .send({ embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setColor("GREEN")
                            .setTitle("Channel archived")
                            .setDescription("This channel has been archived.")
                    ], components: [
                        new discord_js_1.default.MessageActionRow()
                            .addComponents(new discord_js_1.default.MessageButton()
                            .setStyle("LINK")
                            .setURL(url)
                            .setLabel("See logs (glot.io)"))
                    ] });
            };
            if (channels.Static.logchannel) {
                channels.Static.logchannel.send({
                    embeds: [
                        new discord_js_1.default.MessageEmbed()
                            .setTitle(`[${Date.now()}] ${new Date().toUTCString()}`)
                            .setURL(url)
                            .setDescription(logs.join("\n").slice(0, _flags.LogChannelPreviewLength || 100) + "...")
                            .setColor(_flags.BotDefaultEmbedColor)
                    ]
                });
            }
            if (channels.other[Session.id].autoarchive) {
                archive();
                return;
            }
            channels.Dynamic[Session.id]
                .send({ embeds: [
                    new discord_js_1.default.MessageEmbed()
                        .setColor("RED")
                        .setTitle("Session ended")
                        .setDescription(`This channel will be automatically deleted in ${_TimeFormat(_flags.ChannelAutoDeleteTimer)}. Click the Archive button to move it to the Archive category.`)
                ], components: [
                    new discord_js_1.default.MessageActionRow()
                        .addComponents(new discord_js_1.default.MessageButton()
                        .setCustomId("ARCHIVE_CHANNEL")
                        .setEmoji("🗃")
                        .setStyle("SUCCESS")
                        .setLabel("Archive")
                        .setDisabled(Array.from(((_b = (_a = channels.Static.archive) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b.values()) || []).length >= 50), new discord_js_1.default.MessageButton()
                        .setStyle("LINK")
                        .setURL(url)
                        .setLabel("See logs (glot.io)"), new discord_js_1.default.MessageButton()
                        .setCustomId("DELETE_CHANNEL")
                        .setEmoji("✖")
                        .setStyle("DANGER")
                        .setLabel("Delete"))
                ] }).then((msg) => {
                let col = msg.createMessageComponentCollector({ componentType: "BUTTON", time: _flags.ChannelAutoDeleteTimer * 1000 });
                let success = false;
                col.on("collect", (int) => {
                    // i hat eyou discord apis
                    // if this breaks it i swear to god
                    var _a;
                    let memb = (_a = channels.Static.targetGuild) === null || _a === void 0 ? void 0 : _a.members.resolve(int.user);
                    if (_config.role) {
                        if (!(memb === null || memb === void 0 ? void 0 : memb.roles.cache.has(_config.role))) {
                            return;
                        }
                    }
                    switch (int.customId) {
                        case "ARCHIVE_CHANNEL":
                            int.deferUpdate();
                            msg.delete();
                            success = true;
                            archive();
                            break;
                        case "DELETE_CHANNEL":
                            channels.Dynamic[Session.id].delete();
                    }
                });
                col.on("end", () => {
                    if (!success && msg.channel) {
                        msg.channel.delete();
                    }
                });
            }).catch(() => { });
        });
    });
});
// TODO: make this code not suck (or at least clean it up)
client.on("ready", () => {
    var _a;
    console.log(`RoControl is online.`);
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
        activities: [
            { name: _FlagFormat((_flags.BotStatus || ""), { prefix: prefix }) || `${prefix}help | RoControl`, type: "PLAYING" }
        ],
    });
    if (!_config.targetGuild) {
        console.log("no targetGuild");
        process.exit(2);
    }
    client.guilds.fetch(_config.targetGuild.toString()).then((guild) => {
        channels.Static.targetGuild = guild;
        if (!_config.serverCategory) {
            console.log("no serverCategory");
            process.exit(2);
        }
        if (_config.log_channel) {
            guild.channels.fetch(_config.log_channel).then((txt) => {
                if (txt === null || txt === void 0 ? void 0 : txt.isText()) {
                    channels.Static.logchannel = txt;
                }
            });
        }
        guild.channels.fetch(_config.serverCategory).then((cat) => {
            if (!cat) {
                console.log("no category");
                process.exit(2);
            }
            if (cat.isText() || cat.isVoice()) {
                console.log("not category");
                process.exit(2);
            }
            if (!_config.archiveCategory) {
                console.log("no process.env.ARCHIVE_CATEGORY");
                process.exit(2);
            }
            guild.channels.fetch(_config.archiveCategory).then((acat) => {
                if (!acat) {
                    console.log("no category");
                    process.exit(2);
                }
                if (acat.isText() || acat.isVoice()) {
                    console.log("not category");
                    process.exit(2);
                }
                //@ts-ignore | TODO: Find way to not use a @ts-ignore call for this!
                channels.Static.category = cat;
                //@ts-ignore | TODO: Find way to not use a @ts-ignore call for this!
                channels.Static.archive = acat;
                if (channels.Static.category) {
                    channels.Static.category.children.forEach((v) => {
                        v.delete();
                    });
                }
            });
        }).catch(() => {
            console.log("Could not get category");
            process.exit(1);
        });
    }).catch(() => {
        console.log("Could not get target guild");
        process.exit(1);
    });
});
client.on("messageCreate", (message) => {
    var _a, _b, _c;
    if (_config.role) {
        if (!((_a = message.member) === null || _a === void 0 ? void 0 : _a.roles.cache.has(_config.role))) {
            return;
        }
    }
    if (message.content.startsWith(prefix)) {
        let _args = message.content.slice(prefix.length).split(" ");
        let cmd = _args.splice(0, 1)[0].toLowerCase();
        if (Object.values(channels.Dynamic).find(e => e == message.channel)) {
            // Sure there's a better way to do this but too lazy to find it
            for (let [x, v] of Object.entries(channels.Dynamic)) {
                if (v == message.channel) {
                    let foundSession = OptipostServer._connections.find(e => e.id == x);
                    if (!foundSession) {
                        return;
                    }
                    // First, try to find a local TS command
                    let ltscmd = channels.local_cmds.find(e => e.names.find(a => a == cmd));
                    if (ltscmd) {
                        let args = _args.splice(0, ltscmd.args - 1);
                        let lastParameter = _args.join(" ");
                        if (lastParameter) {
                            args.push(lastParameter);
                        }
                        channels.logs[foundSession.id](`${message.author.tag} executed a TS command: ${message.content}`);
                        try {
                            ltscmd.action(foundSession, message, args);
                        }
                        catch (_d) {
                            message.reply(`An error occured while running this command. Please try again.`);
                        }
                    }
                    else {
                        // if not, try to find a lua cmd
                        let lcmd = channels.cmdl[foundSession.id].find(e => e.names.find(a => a == cmd));
                        if (lcmd) {
                            let args = _args.splice(0, lcmd.args - 1);
                            let lastParameter = _args.join(" ");
                            if (lastParameter) {
                                args.push(lastParameter);
                            }
                            channels.logs[foundSession.id](`${message.author.tag} ExecuteCommand: ${lcmd.id} (${message.content})`);
                            if (lcmd.roleid) {
                                if (!((_b = message.member) === null || _b === void 0 ? void 0 : _b.roles.cache.has(lcmd.roleid))) {
                                    message.channel.send({ embeds: [
                                            new discord_js_1.default.MessageEmbed()
                                                .setColor(_flags.BotDefaultErrorEmbedColor)
                                                .setTitle("Permission error")
                                                .setDescription(`You do not have permission to run this command (${lcmd.id}).\n\nPlease obtain the role <@&${lcmd.roleid}>, then try again.`)
                                        ] });
                                    return;
                                }
                            }
                            foundSession.Send({
                                type: "ExecuteCommand",
                                commandId: lcmd.id,
                                args: args || [],
                                userId: message.author.id,
                                messageId: message.id
                            });
                        }
                    }
                }
            }
        }
        else {
            // Look for a global cmd
            let globalCmd = channels.global_cmds.find(e => e.names.find(a => a == cmd));
            if (globalCmd) {
                let args = _args.splice(0, globalCmd.args - 1);
                let lastParameter = _args.join(" ");
                if (lastParameter) {
                    args.push(lastParameter);
                }
                try {
                    globalCmd.action(message, args);
                }
                catch (_e) {
                    message.reply(`An error occured while running this command. Please try again.`);
                }
            }
        }
    }
    else {
        // I'm sure there's a much better way to do this,
        // I'm just too lazy to find it right now
        if (!message.author.bot) {
            for (let [x, v] of Object.entries(channels.Dynamic)) {
                if (v == message.channel) {
                    let foundSession = OptipostServer._connections.find(e => e.id == x);
                    if (!foundSession) {
                        return;
                    }
                    if (!channels.other[foundSession.id].DTRChatEnabled) {
                        return;
                    }
                    if (message.content && !Array.from(message.attachments.values())[0]) {
                        foundSession.Send({ type: "Chat", data: message.content, tag: message.author.tag, tagColor: _flags.AutoTagColorization ? (((_c = message.member) === null || _c === void 0 ? void 0 : _c.displayHexColor) || "ffefcd") : "ffffff", userId: message.author.id, messageId: message.id });
                        channels.logs[foundSession.id](`${message.author.tag}: ${message.content}`);
                    }
                    if (Array.from(message.attachments.values())[0]) {
                        if (_flags.DisableImageSending) {
                            message.reply("Your administrator has disabled sending of images. If you would like to request that this ability be reinstated, please contact the owner of the RoControl server.");
                            return;
                        }
                        channels.logs[foundSession.id](`${message.author.tag} uploaded an image: ${Array.from(message.attachments.values())[0].proxyURL}`);
                        let att = Array.from(message.attachments.values())[0];
                        axios_1.default.get(att.proxyURL).then((data) => {
                            if (data.headers["content-type"].startsWith("image/")) {
                                if (foundSession) {
                                    let cset = {};
                                    if (message.content.split("\n")[1]) {
                                        message.content.split("\n")[1].split(" ").forEach(((v, x) => {
                                            var _a;
                                            let t = v.split(":")[0];
                                            cset[t] = (_a = v.split(":")[1]) !== null && _a !== void 0 ? _a : true;
                                        }));
                                    }
                                    jimp_1.default.read(att.proxyURL).then(img => {
                                        if (!cset.nocrop) {
                                            // this code sucks. switch to a processing func or something else later maybe?
                                            if (img.getHeight() > img.getWidth()) {
                                                switch (cset.crop) {
                                                    default:
                                                        img.crop(0, (img.getHeight() / 2) - (img.getWidth() / 2), img.getWidth(), img.getWidth());
                                                        break;
                                                    case "top":
                                                        img.crop(0, 0, img.getWidth(), img.getWidth());
                                                        break;
                                                    case "bottom":
                                                        img.crop(0, (img.getHeight()) - (img.getWidth()), img.getWidth(), img.getWidth());
                                                }
                                            }
                                            else if (img.getWidth() > img.getHeight()) {
                                                switch (cset.crop) {
                                                    default:
                                                        img.crop((img.getWidth() / 2) - (img.getHeight() / 2), 0, img.getHeight(), img.getHeight());
                                                        break;
                                                    case "left":
                                                        img.crop(0, 0, img.getHeight(), img.getHeight());
                                                        break;
                                                    case "right":
                                                        img.crop((img.getWidth()) - (img.getHeight()), 0, img.getHeight(), img.getHeight());
                                                }
                                            }
                                        }
                                        img.resize(200, 200);
                                        let dtt = [];
                                        for (let _x = 0; _x < 200; _x++) {
                                            let col = [];
                                            for (let y = 0; y < 200; y++) {
                                                col.push(jimp_1.default.intToRGBA(img.getPixelColor(_x, y)));
                                            }
                                            dtt.push(col);
                                        }
                                        let cap = message.content.split("\n")[0];
                                        //@ts-ignore | Find way to not use ts-ignore
                                        foundSession.Send({ type: "Image", data: dtt, caption: (cap.toLowerCase() == "none" || cap == "") ? undefined : cap, time: parseInt(cset.time, 10) || 5, player: cset.player || cset.target });
                                    });
                                }
                            }
                        }).catch(() => { });
                    }
                }
            }
        }
    }
});
client.on("interactionCreate", (int) => {
    var _a, _b;
    if (int.isButton()) {
        let memb = (_a = channels.Static.targetGuild) === null || _a === void 0 ? void 0 : _a.members.resolve(int.user);
        if (_config.role) {
            if (!(memb === null || memb === void 0 ? void 0 : memb.roles.cache.has(_config.role))) {
                return;
            }
        }
        switch (int.customId) {
            case "Autoarchive":
                int.deferUpdate();
                if (int.channel && int.message.id) {
                    int.channel.messages.fetch(int.message.id).then((msg) => {
                        var _a;
                        for (let [x, v] of Object.entries(channels.Dynamic)) {
                            if (v.id == int.channelId) {
                                channels.other[x].autoarchive = !channels.other[x].autoarchive;
                                if (v.id == ((_a = int === null || int === void 0 ? void 0 : int.channel) === null || _a === void 0 ? void 0 : _a.id)) {
                                    msg.edit({
                                        components: [
                                            new discord_js_1.default.MessageActionRow()
                                                .addComponents(new discord_js_1.default.MessageButton()
                                                .setStyle(channels.other[x].autoarchive ? "SUCCESS" : "DANGER")
                                                .setEmoji("⭐")
                                                .setCustomId("Autoarchive"))
                                        ]
                                    });
                                }
                            }
                        }
                    }).catch(() => { });
                }
            default:
                if (int.customId.startsWith("rcBtn.")) {
                    int.deferUpdate();
                    // Need to find a better way to do this
                    for (let [x, v] of Object.entries(channels.Dynamic)) {
                        if (v.id == ((_b = int === null || int === void 0 ? void 0 : int.channel) === null || _b === void 0 ? void 0 : _b.id)) {
                            let foundSession = OptipostServer._connections.find(e => e.id == x);
                            if (!foundSession) {
                                return;
                            }
                            foundSession.Send({
                                type: "ButtonPressed",
                                id: int.customId.slice(6),
                                userId: int.user.id,
                                messageId: int.message.id
                            });
                        }
                    }
                }
        }
    }
});
if (_flags.DirectMessageRatelimit) {
    setInterval(() => { channels.other._ratelimits.DMsThisSecond = 0; }, 1000);
    setInterval(() => { channels.other._ratelimits.DMsThisMinute = 0; }, 60000);
}
process.on("SIGTERM", () => {
    OptipostServer._connections.forEach((v, x) => {
        if (!v.Dead) {
            v.Close();
        }
    });
    setTimeout(() => process.exit(1), 1000);
});
process.on('uncaughtException', err => {
    OptipostServer._connections.forEach((v, x) => {
        try {
            if (!v.Dead) {
                v.Close();
            }
        }
        catch (_a) {
            process.exit(1);
        }
    });
    if (channels.Static.logchannel) {
        channels.Static.logchannel.send({
            embeds: [
                new discord_js_1.default.MessageEmbed()
                    .setColor(_flags.BotDefaultErrorEmbedColor)
                    .setTitle("Oops!")
                    .setDescription(`RoControl has crashed.\n\`\`\`${err.toString()}\`\`\``)
                    .setThumbnail("https://github.com/nbitzz/rocontrol/blob/dev/assets/rocontrol-app-icon.png?raw=true")
            ]
        }).then(() => { setTimeout(() => process.exit(1), 1000); }).catch(() => { process.exit(1); });
    }
    /*
    fs.readFile('../rocontrol/crashes.json',(readerr,buf) => {
        let j = []
        if (!readerr) {
            j = JSON.parse(buf.toString())
        }
        j.push({
            timestamp: Date.now(),
            message: err.message,
            name: err.name,
            stack: err.stack
        })

        

        fs.writeFile('../rocontrol/crashes.json',JSON.stringify(j),() => {
            process.exit(1)
        })
    })
    */
});
client.login(_config.token);
