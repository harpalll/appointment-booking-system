import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";

export const providerDailySchedule = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date || isNaN(new Date(date?.toString()!).getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const parsedDate = new Date(date?.toString()!);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: parsedDate,
      service: { providerId: req.user?.id },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      user: { select: { name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const groupedByService = appointments.reduce(
    (acc, appt) => {
      const serviceId = appt.service.id;

      if (!acc[serviceId]) {
        acc[serviceId] = {
          serviceId: serviceId,
          serviceName: appt.service.name,
          appointments: [],
        };
      }

      acc[serviceId].appointments.push({
        appointmentId: appt.id,
        userName: appt.user.name,
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status,
      });

      return acc;
    },
    {} as Record<
      string,
      {
        serviceId: string;
        serviceName: string;
        appointments: {
          appointmentId: string;
          userName: string;
          startTime: string;
          endTime: string;
          status: string;
        }[];
      }
    >,
  );

  const result = {
    date: parsedDate,
    services: Object.values(groupedByService),
  };

  console.log(result);

  return res.status(200).json(result);
});
