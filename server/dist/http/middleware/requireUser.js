"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwtTokens_1 = require("../../shared/security/jwtTokens");
const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authorization.split(' ')[1];
    try {
        const payload = (0, jwtTokens_1.verifyAccessToken)(token);
        req.user = { id: Number(payload.sub) };
        return next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
