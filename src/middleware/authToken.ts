import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../helpers";

import * as CustomError from "../errors";

export const authenticateToken = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  const authHeader = _req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return _next(new CustomError.UnauthorizedError("No token provided"));

  try {
    const decoded = jwtUtils.verifyAccessToken(token);
    _req.user = decoded.userId;
    _req.access_token = token;
    _req.role = decoded.userRole;
    _next();
  } catch (err: any) {
    _next(new CustomError.UnauthorizedError(err.message));
  }
};
