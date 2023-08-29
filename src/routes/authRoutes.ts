import express from "express";

import {
  loginController,
  registerController,
} from "../controllers/authControllers";
import * as CustomError from "../errors";

export const authRouter = express.Router();

authRouter.post("/login", loginController);
authRouter.post("/register", registerController);

// fallback route
authRouter.use((_req, _res, _next) => {
  _next(new CustomError.ForbiddenError("Only POST requests are allowed"));
});
