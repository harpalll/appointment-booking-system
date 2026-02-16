import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { allowedRoles } from "../middleware/role";
import { providerDailySchedule } from "../controller/providerController";

const router = Router();

router.get(
  "/me/schedule",
  authenticate,
  allowedRoles(["SERVICE_PROVIDER"]),
  providerDailySchedule,
);

export default router;
