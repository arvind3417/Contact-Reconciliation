import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { genAccessToken, genRefreshToken } from "../helpers/jwt";
import { hashPassword, hashCompare } from "../helpers/hashPassword";

import * as validators from "../helpers/validators";
import { User } from "../models/users";
import { USERFIELDS } from "./userControllers";
import normalizeModel from "../helpers/normalizer";
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { httpResponse } from "../helpers";

export const loginController = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    const { email, password } = _req.body;
    if (!email || !password)
      return _next(
        new CustomErrors.BadRequestError("Please provide email and password")
      );

    const user = await User.findOne({ email: email });
    if (!user)
      return _next(
        new CustomErrors.NotFoundError("Invalid email or user does not exist")
      );

    if (!user.password)
      return _next(
        new CustomErrors.InternalServerError(
          "User password not found in the database"
        )
      );

    // passwords match, return access token and refresh token
    if (hashCompare(password, user.password)) {
      const accessToken = genAccessToken(user);
      const refreshToken = genRefreshToken(user);
      _res.status(StatusCodes.OK).json(
        httpResponse(true, "User logged in successfully", {
          accessToken,
          refreshToken,
        })
      );
    } else {
      // passwords do not match
      return _next(new CustomErrors.UnauthorizedError("Invalid password"));
    }
  }
);

export const registerController = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    let newUser: any;
    try {
      newUser = normalizeModel(_req.body, USERFIELDS);
    } catch (error: any) {
      return _next(new CustomErrors.BadRequestError(error.message));
    }

    let user = await User.findOne({
      email: newUser.email,
    });
    if (user)
      return _next(new CustomErrors.BadRequestError("User already exists"));
    try {
      const hashedPassword = hashPassword(newUser.password);
      user = await User.create({ ...newUser, password: hashedPassword });
    } catch (err: any) {
      return _next(
        new CustomErrors.BadRequestError("Invalid user data " + err.message)
      );
    }
    const accessToken = genAccessToken(user);
    const refreshToken = genRefreshToken(user);
    _res.status(StatusCodes.CREATED).json(
      httpResponse(true, "User created successfully", {
        accessToken,
        refreshToken,
      })
    );
  }
);
