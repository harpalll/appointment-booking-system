import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { allowedRoles } from "../middleware/role";
import { validateData } from "../middleware/validation";
import {
  createServiceSchema,
  setAvailabilitySchema,
} from "../utils/validation";
import {
  createService,
  getServices,
  getServiceSlots,
  setAvailability,
} from "../controller/serviceController";

const router = Router();

router.post(
  "/",
  authenticate,
  allowedRoles(["SERVICE_PROVIDER"]),
  validateData(createServiceSchema),
  createService,
);

router.post(
  "/:serviceId/availability",
  authenticate,
  allowedRoles(["SERVICE_PROVIDER"]),
  validateData(setAvailabilitySchema),
  setAvailability,
);

router.get("/", authenticate, getServices);
router.get("/:serviceId/slots", authenticate, getServiceSlots);

export default router;
