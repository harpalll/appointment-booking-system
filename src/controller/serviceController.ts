import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";

export const createService = asyncHandler(async (req, res) => {
  const { name, type, durationMinutes } = req.body;

  const service = await prisma.service.create({
    data: {
      name,
      type,
      durationMinutes,
      providerId: req.user?.id!,
    },
    select: {
      id: true,
      name: true,
      type: true,
      durationMinutes: true,
    },
  });

  if (!service) {
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
  console.log("Service created", service);

  return res.status(201).json(service);
});

export const setAvailability = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId?.toString(),
    },
  });

  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }

  if (service.providerId !== req.user?.id!) {
    return res
      .status(403)
      .json({ error: "Service does not belong to provider" });
  }

  console.log("Existing service", service);

  const existingAvailability = await prisma.availability.findFirst({
    where: {
      serviceId: serviceId?.toString(),
      endTime,
      startTime,
    },
  });

  console.log("Existing availability: ", existingAvailability);

  if (existingAvailability) {
    return res.status(409).json({ error: "Overlapping availability" });
  }

  const availability = await prisma.availability.create({
    data: {
      dayOfWeek,
      startTime,
      endTime,
      serviceId: serviceId?.toString()!,
    },
  });

  if (!availability) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  return res.status(201).json(availability);
});
