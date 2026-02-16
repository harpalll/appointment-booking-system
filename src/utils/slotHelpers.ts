export type AppointmentSlot = {
  slotId: string;
  startTime: string;
  endTime: string;
};

export const deriveSlots = (
  serviceId: string,
  date: string,
  startTime: string,
  endTime: string,
  durationMinutes: number,
): AppointmentSlot[] => {
  const [startHour, startMinute] = startTime.split(":");
  const [endHour, endMinute] = endTime.split(":");

  const startMinutes = Number(startHour) * 60 + Number(startMinute);
  const endMinutes = Number(endHour) * 60 + Number(endMinute);

  const slotCount = Math.floor((endMinutes - startMinutes) / durationMinutes);

  let slots: AppointmentSlot[] = [];

  for (let i = 0; i < slotCount; i++) {
    const baseTime = new Date();
    baseTime.setHours(Number(startHour), Number(startMinute), 0, 0);

    const startTime = new Date(
      baseTime.getTime() + i * durationMinutes * 60000,
    );

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    slots.push({
      slotId: `${serviceId}_${date}_${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, "0")}`,
      startTime: `${startTime.getHours()}:${String(startTime.getMinutes()).padStart(2, "0")}`,
      endTime: `${endTime.getHours()}:${String(endTime.getMinutes()).padStart(2, "0")}`,
    });
  }

  return slots;
};
