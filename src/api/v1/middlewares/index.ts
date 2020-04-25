import { Request, Response, NextFunction } from "express";
// import { check, sanitize, validationResult } from 'express-validator';

// TODO: use validation
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // TODO: wtf??
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(403).send(
            "Forbidden. You should provide 'authorization' header with valid token",
        );
    } else {
        next();
    }
};
