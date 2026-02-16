import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";
import { deriveSlots, type AppointmentSlot } from "../utils/slotHelpers";

export const bookAppointment = asyncHandler(async (req, res) => {
  const { slotId } = req.body;

  const data = slotId.split("_");

  if (data.length !== 3 || isNaN(new Date(data[1]).getTime()) || !data[2]) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const [serviceId, date, startTime] = data;
  const parsedDate = new Date(date);

  try {
    const createdAppointment = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({
        where: {
          id: serviceId,
        },
      });

      if (!service) {
        throw { status: 404, message: "Service not found" };
      }

      const dayOfWeek = parsedDate.getDay();

      const availability = await tx.availability.findFirst({
        where: { serviceId, dayOfWeek },
      });

      if (!availability) {
        throw { status: 404, message: "Service not available" };
      }

      let slots: AppointmentSlot[] = deriveSlots(
        serviceId,
        parsedDate?.toString(),
        availability.startTime,
        availability.endTime,
        service.durationMinutes,
      );

      const slot = slots.find((s) => s.startTime === startTime);

      //   TODO: check if we can do this
      //   slots.find((slot) => slot.slotId === slotId);

      if (!slot) {
        throw { status: 404, message: "Invalid slot" };
      }

      const existingAppointment = await tx.appointment.findFirst({
        where: { serviceId, startTime, date: parsedDate },
      });

      if (existingAppointment) {
        throw { status: 409, message: "Slot already booked" };
      }

      return await tx.appointment.create({
        data: {
          serviceId,
          date: parsedDate,
          slotId: slot.slotId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "BOOKED",
          userId: req.user!.id,
        },
      });
    });

    return res.status(201).json({
      id: createdAppointment.id,
      slotId: createdAppointment.slotId,
      status: createdAppointment.status,
    });
  } catch (error: any) {
    return res
      .status(error?.status || 500)
      .json({ message: error?.message || "Internal server error" });
  }
});

export const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.user?.id! },
  });

  if (!appointments) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  return res.status(200).json(appointments);
});
