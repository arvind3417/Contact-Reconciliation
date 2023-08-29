import { NextFunction, Request, Response } from "express";

import * as CustomError from "../errors";

export const adminAccess = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  console.log(`${_req.role} tried to access admin route`);
  if (_req.role?.toLowerCase() !== "admin") {
    _next(new CustomError.ForbiddenError("Access denied"));
  } else {
    _next();
  }
};
