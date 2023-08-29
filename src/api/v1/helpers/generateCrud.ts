import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import * as CustomError from "../errors";
import { httpResponse } from "../helpers";
import normalizeModel, { FieldType } from "../helpers/normalizer";
import asyncWrapper from "../helpers/asyncWrapper";

type GetAllApiType = {
  model: mongoose.Model<any>;
  preFetch?: any[] | ((_req: Request) => any[]);
  getAggregation?: any[];
  perPage?: number;
};

export const createGetAllApi = ({
  model,
  preFetch,
  getAggregation = [{ $project: { __v: 0 } }],
  perPage = 10,
}: GetAllApiType) =>
  asyncWrapper(async (_req: Request, _res: Response, _next: NextFunction) => {
    if (_req.query.PNO && !/^\d+$/.test(_req.query.PNO as string))
      return _next(
        new CustomError.BadRequestError(
          "Invalid page number. Page number must be a valid integer"
        )
      );

    const page = _req.query.PNO ? parseInt(_req.query.PNO as string) : 1;
    const skip = (page - 1) * perPage;

    let preFetchAggregate: any[];
    if (typeof preFetch === "function") preFetchAggregate = preFetch(_req);
    else if (preFetch === undefined) preFetchAggregate = [];
    else preFetchAggregate = preFetch;

    const documents = await model.aggregate([
      ...preFetchAggregate,
      {
        $skip: skip,
      },
      {
        $limit: perPage,
      },
      ...getAggregation,
    ]);
    if (!documents || documents.length === 0) {
      _next(
        new CustomError.NotFoundError(
          `No ${model.modelName.toLowerCase()} found`
        )
      );
    } else {
      _res
        .status(StatusCodes.OK)
        .json(
          httpResponse(
            true,
            `${model.modelName} retrieved successfully`,
            documents,
            page
          )
        );
    }
  });

type GetByIdApiType = {
  model: mongoose.Model<any>;
  preFetch?: any[] | ((_req: Request) => any[]);
  getAggregation?: any[];
};

export const createGetByIdApi = ({
  model,
  preFetch,
  getAggregation = [{ $project: { __v: 0 } }],
}: GetByIdApiType) =>
  asyncWrapper(async (_req: Request, _res: Response, _next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(_req.params.id))
      return _next(
        new CustomError.BadRequestError(
          `Invalid ${model.modelName.toLowerCase()} id`
        )
      );

    let preFetchAggregate: any[];
    if (typeof preFetch === "function") preFetchAggregate = preFetch(_req);
    else if (preFetch === undefined)
      preFetchAggregate = [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(_req.params.id),
          },
        },
      ];
    else preFetchAggregate = preFetch;

    const documents = await model.aggregate([
      ...preFetchAggregate,
      ...getAggregation,
    ]);

    if (!documents || documents.length === 0)
      return _next(
        new CustomError.NotFoundError(`${model.modelName} not found`)
      );
    _res
      .status(StatusCodes.OK)
      .json(
        httpResponse(
          true,
          `${model.modelName} retrieved successfully`,
          documents[0]
        )
      );
  });

type PostApiType = {
  model: mongoose.Model<any>;
  normalize?: (_req: Request) => any;
  FIELDS: FieldType[];
};

export const createPostApi = ({ model, normalize, FIELDS }: PostApiType) =>
  asyncWrapper(async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const validatedBody =
        normalize !== undefined
          ? normalize(_req)
          : normalizeModel(_req.body, FIELDS);
      const documents = await model.create(validatedBody);
      if (!documents) {
        _next(
          new CustomError.NotFoundError(`Could not create ${model.modelName}`)
        );
      } else {
        _res
          .status(StatusCodes.CREATED)
          .json(
            httpResponse(
              true,
              `${model.modelName} created successfully`,
              documents
            )
          );
      }
    } catch (error: any) {
      _next(new CustomError.BadRequestError(error.message));
    }
  });

type PatchApiType = {
  model: mongoose.Model<any>;
  normalize?: (_req: Request) => any;
  findCriteria?: (_req: Request) => any;
  transform?: (data: any) => any;
  FIELDS: FieldType[];
};

export const createPatchApi = ({
  model,
  normalize,
  findCriteria,
  transform = (body) => body,
  FIELDS,
}: PatchApiType) =>
  asyncWrapper(async (_req: Request, _res: Response, _next: NextFunction) => {
    let updatedDocument: any;
    try {
      updatedDocument =
        normalize !== undefined
          ? normalize(_req)
          : normalizeModel(_req.body, FIELDS, true);
    } catch (error: any) {
      return _next(new CustomError.BadRequestError(error.message));
    }

    const findCriteriaObject =
      findCriteria !== undefined
        ? findCriteria(_req)
        : { _id: new mongoose.Types.ObjectId(_req.params.id) };

    const documents = await model.findOneAndUpdate(
      findCriteriaObject,
      [
        {
          $set: transform(updatedDocument),
        },
        {
          $project: {
            __v: 0,
          },
        },
      ],
      {
        new: true,
      }
    );
    if (!documents) {
      _next(new CustomError.NotFoundError(`${model.modelName} not found`));
    } else {
      _res
        .status(StatusCodes.OK)
        .json(
          httpResponse(
            true,
            `${model.modelName} updated successfully`,
            documents
          )
        );
    }
  });

type DeleteApiType = {
  model: mongoose.Model<any>;
  findCriteria?: (_req: Request) => any;
};

export const createDeleteApi = ({ model, findCriteria }: DeleteApiType) =>
  asyncWrapper(async (_req: Request, _res: Response, _next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(_req.params.id))
      return _next(
        new CustomError.BadRequestError(
          `Invalid ${model.modelName.toLowerCase()} id`
        )
      );
    const findCriteriaObject =
      findCriteria !== undefined
        ? findCriteria(_req)
        : { _id: new mongoose.Types.ObjectId(_req.params.id) };

    const document = await model.findOneAndDelete(findCriteriaObject);
    if (!document) {
      _next(new CustomError.NotFoundError(`${model.modelName} not found`));
    } else {
      _res
        .status(StatusCodes.OK)
        .json(
          httpResponse(
            true,
            `${model.modelName} deleted successfully`,
            document
          )
        );
    }
  });

const generateCrud = (
  model: mongoose.Model<any>,
  FIELDS: FieldType[],
  getAggregation: any[] = [
    {
      $project: {
        __v: 0,
      },
    },
  ],
  transform: (data: any) => any = (data) => data,
  preFetch?: any[] | ((_req: Request) => any[]),
  perPage: number = 5
) => {
  const getAllMethod = createGetAllApi({
    model,
    preFetch,
    getAggregation,
    perPage,
  });
  const getByIdMethod = createGetByIdApi({ model, getAggregation });
  const postMethod = createPostApi({ model, FIELDS });
  const patchMethod = createPatchApi({ model, transform, FIELDS });
  const deleteMethod = createDeleteApi({ model });

  return {
    getAllMethod,
    getByIdMethod,
    postMethod,
    patchMethod,
    deleteMethod,
  };
};

export default generateCrud;
