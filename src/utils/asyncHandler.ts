import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./types";

type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const asyncHandler = (requestHandler: AsyncRequestHandler) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
