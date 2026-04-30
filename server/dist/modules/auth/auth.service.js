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
exports.getUserProfile = exports.logoutUser = exports.refreshUserToken = exports.loginUser = exports.registerUser = void 0;
const userModel = __importStar(require("../users/user.store"));
const refreshTokenModel = __importStar(require("./refreshToken.store"));
const passwordHashing_1 = require("../../shared/security/passwordHashing");
const jwtTokens_1 = require("../../shared/security/jwtTokens");
const registerUser = async (input) => {
    const existing = await userModel.findUserByEmail(input.email);
    if (existing) {
        throw { status: 409, message: 'Email already exists' };
    }
    const passwordHash = await (0, passwordHashing_1.hashPassword)(input.password);
    const user = await userModel.createUser(input.name, input.email, passwordHash);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
    };
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const user = await userModel.findUserByEmail(input.email);
    if (!user) {
        throw { status: 401, message: 'Invalid credentials' };
    }
    const validPassword = await (0, passwordHashing_1.comparePassword)(input.password, user.password);
    if (!validPassword) {
        throw { status: 401, message: 'Invalid credentials' };
    }
    const accessToken = (0, jwtTokens_1.signAccessToken)(user.id);
    const refreshToken = (0, jwtTokens_1.signRefreshToken)(user.id);
    await refreshTokenModel.saveRefreshToken(user.id, refreshToken);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const refreshUserToken = async (token) => {
    const payload = (0, jwtTokens_1.verifyRefreshToken)(token);
    const stored = await refreshTokenModel.findRefreshToken(token);
    if (!stored) {
        throw { status: 401, message: 'Refresh token not found or expired' };
    }
    const userId = Number(payload.sub);
    const accessToken = (0, jwtTokens_1.signAccessToken)(userId);
    const refreshToken = (0, jwtTokens_1.signRefreshToken)(userId);
    await refreshTokenModel.revokeRefreshToken(token);
    await refreshTokenModel.saveRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
};
exports.refreshUserToken = refreshUserToken;
const logoutUser = async (token) => {
    await refreshTokenModel.revokeRefreshToken(token);
};
exports.logoutUser = logoutUser;
const getUserProfile = async (userId) => {
    const user = await userModel.findUserById(userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    const createdPlans = await userModel.getUserCreatedPlans(userId);
    const followedPlans = await userModel.getUserFollowedPlans(userId);
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        createdPlans,
        followedPlans,
    };
};
exports.getUserProfile = getUserProfile;
