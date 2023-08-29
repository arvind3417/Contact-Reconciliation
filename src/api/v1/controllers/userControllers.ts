import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import * as CustomError from "../errors";
import * as validators from "../helpers/validators";
import normalizeModel from "../helpers/normalizer";
import { httpResponse } from "../helpers";
import { User } from "../models/users";
import asyncWrapper from "../helpers/asyncWrapper";
import { hashPassword, hashCompare } from "../helpers/hashPassword";

export const USERFIELDS = [
  { name: "username", validator: validators.isString, default: null },
  { name: "firstname", validator: validators.isString, required: true },
  { name: "lastname", validator: validators.isString, required: true },
  { name: "password", validator: validators.isString, default: null },
  { name: "role", validator: validators.isString, default: "user" },
  { name: "email", validator: validators.isValidEmail, required: true },
];

export const getUserInfo = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_req.user),
        },
      },
      {
        $project: {
          __v: 0,
          password: 0,
        },
      },
    ]);
    if (!user || user.length === 0) {
      _next(new CustomError.NotFoundError("User not found"));
    } else {
      _res
        .status(StatusCodes.OK)
        .json(httpResponse(true, "User info retrieved successfully", user[0]));
    }
  }
);

export const patchUser = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    let updatedDocument: any;
    try {
      updatedDocument = normalizeModel(_req.body, USERFIELDS, true);
    } catch (error: any) {
      return _next(new CustomError.BadRequestError(error.message));
    }
    const user = await User.findOneAndUpdate(
      {
        _id: _req.user,
      },
      [
        {
          $set: updatedDocument,
        },
        {
          $project: {
            password: 0,
            __v: 0,
          },
        },
      ],
      {
        new: true,
      }
    );
    if (!user) {
      _next(new CustomError.NotFoundError("User not found"));
    } else {
      _res
        .status(StatusCodes.OK)
        .json(httpResponse(true, "User updated", user));
    }
  }
);

export const deleteUser = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    const user = await User.deleteOne({ _id: _req.user });
    if (user.deletedCount !== 1) {
      _next(new CustomError.NotFoundError("User not found"));
    } else {
      _res
        .status(StatusCodes.OK)
        .json(httpResponse(true, "User deleted", user));
    }
  }
);

export const resetPassword = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    const user = await User.findOne({ _id: _req.user });
    if (!user) {
      return _next(new CustomError.NotFoundError("User not found"));
    }
    if (!_req.body.oldPassword || !_req.body.newPassword) {
      return _next(new CustomError.BadRequestError("Missing password"));
    }
    if (!hashCompare(_req.body.oldPassword, user.password ?? "")) {
      return _next(new CustomError.BadRequestError("Wrong password"));
    }
    user.password = hashPassword(_req.body.newPassword);
    user.new_password_requested = new Date();
    await user.save();
    _res
      .status(StatusCodes.OK)
      .json(httpResponse(true, "Password updated", {}));
  }
);

export const updateProfilePicture = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    if (!_req.body.profile_picture || !validators.isValidUrl(_req.body.profile_picture)) {
      return _next(new CustomError.BadRequestError("Please provide valid profile picture url"));
    }
    const user = await User.findOneAndUpdate(
      {
        _id: _req.user,
      },
      {
        $set: {
          UserProfileImage: _req.body.profile_picture,
        },
      },
      {
        new: true,
        projection: {
          password: 0,
          __v: 0,
        },
        runValidators: true,
        useFindAndModify: false,
      }
    );
    if (!user) {
      _next(new CustomError.NotFoundError("User not found"));
    }
    _res
      .status(StatusCodes.OK)
      .json(httpResponse(true, "Profile picture updated", user));
  }
);

export const updateCoverPicture = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    if (!_req.body.cover_picture || !validators.isValidUrl(_req.body.cover_picture)) {
      return _next(new CustomError.BadRequestError("Enter valid cover picture"));
    }
    const user = await User.findOneAndUpdate(
      {
        _id: _req.user,
      },
      {
        $set: {
          UserCoverImage: _req.body.cover_picture,
        },
      },
      {
        new: true,
        projection: {
          password: 0,
          __v: 0,
        },
        runValidators: true,
        useFindAndModify: false,
      }
    );
    if (!user) {
      _next(new CustomError.NotFoundError("User not found"));
    }
    _res
      .status(StatusCodes.OK)
      .json(httpResponse(true, "Cover picture updated", user));
  }
);
