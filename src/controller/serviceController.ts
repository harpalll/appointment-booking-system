import { prisma } from "../../db";
import { ServiceType } from "../../generated/prisma/enums";
import type {
  ServiceSelect,
  ServiceWhereInput,
} from "../../generated/prisma/models";
import { asyncHandler } from "../utils/asyncHandler";
import { deriveSlots, type AppointmentSlot } from "../utils/slotHelpers";

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

export const getServices = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let filter: ServiceWhereInput = {};
  let select: ServiceSelect = {
    id: true,
    name: true,
    provider: {
      select: {
        name: true,
      },
    },
    type: true,
    durationMinutes: true,
  };

  console.log(type);
  console.log(Object.values(ServiceType));

  //@ts-ignore
  console.log(Object.values(ServiceType).includes(type));

  //@ts-ignore
  if (type && !Object.values(ServiceType).includes(type)) {
    return res.status(400).json({
      error: "Invalid service type",
    });
  }

  type && (filter.type = type as ServiceType);

  const services = await prisma.service.findMany({
    where: filter,
    select: select,
  });

  if (!services) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  const formattedServices = services.map((service) => ({
    id: service.id,
    name: service.name,
    type: service.type,
    durationMinutes: service.durationMinutes,
    providerName: service.provider?.name || null,
  }));

  return res.status(200).json(formattedServices);
});

export const getServiceSlots = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  const parsedDate = new Date(date.toString());
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    return res.status(400).json({ error: "Date cannot be in the past" });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId?.toString() },
  });

  if (!service) {
    return res.status(404).json({
      error: "Service not found",
    });
  }

  if (service.providerId !== req.user?.id) {
    return res
      .status(403)
      .json({ error: "Service does not belong to provider" });
  }

  console.log("Service retrived", service.id);

  console.log(parsedDate, parsedDate.getDay());

  const availability = await prisma.availability.findFirst({
    where: {
      serviceId: serviceId?.toString(),
      dayOfWeek: parsedDate.getDay(),
    },
  });

  console.log("availability", availability);

  if (!availability) {
    return res.status(404).json({ error: "Service not available" });
  }

  let slots: AppointmentSlot[] = deriveSlots(
    serviceId?.toString()!,
    date?.toString()!,
    availability.startTime,
    availability.endTime,
    service.durationMinutes,
  );

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      serviceId: serviceId?.toString(),
      date: parsedDate,
    },
  });

  slots = slots.filter((slot) =>
    existingAppointments.filter(
      (existingAppointment) => existingAppointment.slotId != slot.slotId,
    ),
  );

  console.log("Available slot", slots);
  console.log("Existing appointments", existingAppointments);

  return res.status(200).json({ serviceId, date, slots });
});
