import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../utils/types";
import type { Role } from "../../generated/prisma/enums";

export const allowedRoles = (allowedRoles: Role[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
