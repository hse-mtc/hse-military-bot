import { Request, Response, NextFunction } from "express";
// import { check, sanitize, validationResult } from 'express-validator';

// TODO: use validation
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res
            .status(401)
            .send("You should provide 'authorization' header with valid token");
    }

    return next();
};
