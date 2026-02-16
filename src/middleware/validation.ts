import * as z from "zod";
import type { AuthRequest } from "../utils/types";
import type { Response, NextFunction } from "express";

export const validateData = (schema: z.ZodType) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      z.parse(schema, req.body);
      next();
    } catch (error) {
      console.log("Validation errors", error);
      return res.status(400).json({ error: "Invalid input" });
    }
  };
};
