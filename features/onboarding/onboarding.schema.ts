import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function getOnboardingDateLimits(now = new Date()) {
  const minimum = new Date(now);
  minimum.setUTCDate(minimum.getUTCDate() + 1);
  const maximum = new Date(now);
  maximum.setUTCDate(maximum.getUTCDate() + 84);
  return { minimum: isoDate(minimum), maximum: isoDate(maximum) };
}

export function createOnboardingSchema(now = new Date()) {
  const limits = getOnboardingDateLimits(now);
  return z.object({
    displayName: z.string().trim().min(2, "Внеси име со најмалку 2 знаци.").max(80, "Името може да има најмногу 80 знаци."),
    projectTitle: z.string().trim().min(3, "Внеси наслов со најмалку 3 знаци.").max(120, "Насловот може да има најмногу 120 знаци."),
    targetUser: z.string().trim().min(20, "Опиши го конкретниот корисник со најмалку 20 знаци.").max(400, "Описот може да има најмногу 400 знаци."),
    problemStatement: z.string().trim().min(30, "Опиши го болниот проблем со најмалку 30 знаци.").max(600, "Описот може да има најмногу 600 знаци."),
    coreAction: z.string().trim().min(10, "Опиши една главна акција со најмалку 10 знаци.").max(300, "Главната акција може да има најмногу 300 знаци."),
    nonFeatures: z.string().transform((value, context) => {
      const items = value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      if (items.length < 1) context.addIssue({ code: "custom", message: "Наведи најмалку една работа што нема да ја градиш." });
      if (items.length > 10) context.addIssue({ code: "custom", message: "Наведи најмногу 10 non-features." });
      if (items.some((item) => item.length < 3 || item.length > 160)) context.addIssue({ code: "custom", message: "Секој ред треба да има од 3 до 160 знаци." });
      return items;
    }),
    weeklyHours: z.coerce.number({ error: "Внеси број на часови." }).int("Внеси цел број часови.").min(1, "Минимумот е 1 час неделно.").max(20, "Максимумот е 20 часа неделно."),
    targetLaunchDate: z.string().regex(datePattern, "Избери важечки датум.").refine((value) => value >= limits.minimum, "Избери датум од утре па натаму.").refine((value) => value <= limits.maximum, "Избери датум во следните 12 недели."),
  });
}
