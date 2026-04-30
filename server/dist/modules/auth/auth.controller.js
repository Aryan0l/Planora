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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const authService = __importStar(require("./auth.service"));
const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const auth = await authService.loginUser(req.body);
        res.json({ success: true, data: auth });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const tokens = await authService.refreshUserToken(req.body.refreshToken);
        res.json({ success: true, data: tokens });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        await authService.logoutUser(req.body.refreshToken);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const profile = async (req, res, next) => {
    try {
        const profileData = await authService.getUserProfile(req.user.id);
        res.json({ success: true, data: profileData });
    }
    catch (error) {
        next(error);
    }
};
exports.profile = profile;
