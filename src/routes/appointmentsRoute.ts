import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { allowedRoles } from "../middleware/role";
import { validateData } from "../middleware/validation";
import { bookAppointmentSchema } from "../utils/validation";
import {
  bookAppointment,
  getAppointments,
} from "../controller/appointmentsController";

const router = Router();

router.post(
  "/",
  authenticate,
  allowedRoles(["USER"]),
  validateData(bookAppointmentSchema),
  bookAppointment,
);

router.get("/me", authenticate, getAppointments);

export default router;
