"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rc_render_1 = __importDefault(require("../rc-render"));
(0, rc_render_1.default)({
    Parts: [
        {
            cf: {
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0 }
            },
            size: { x: 5, y: 5, z: 5 },
            color: { r: 1, g: 1, b: 1 }
        }
    ],
    Camera: {
        position: { x: 0, y: 10, z: -20 },
        orientation: { x: 0, y: 0, z: 0 }
    }
}, "test.png");
