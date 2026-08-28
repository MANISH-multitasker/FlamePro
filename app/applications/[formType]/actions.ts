"use server";

import { prisma } from "@/lib/db";
import { FormType as PrismaFormType } from "@/lib/generated/prisma/client";

const formDbMap = {
  regionalStaff: "REGIONAL_STAFF",
  pd: "PD",
  ems: "EMS",
  streamers: "STREAMER",
} as const satisfies Record<string, PrismaFormType>;

export type SubmittableFormType = keyof typeof formDbMap;

type SubmitApplicationInput = {
  formType: SubmittableFormType;
  data: Record<string, unknown>;
};

function formatValue(value: unknown): string {
  if (value == null) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => formatValue(item)).join(", ") : "-";
  }

  if (typeof value === "object") {
    return "```json\n" + JSON.stringify(value, null, 2) + "\n```";
  }

  return String(value);
}

function formatKey(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function buildFields(data: Record<string, unknown>) {
  return Object.entries(data).map(([key, value]) => ({
    name: formatKey(key),
    value: formatValue(value),
    inline: false,
  }));
}

// export async function submitApplication({ formType, data }: SubmitApplicationInput) {
//   let webhookUrl;

//   if(formType === "regionalStaff") webhookUrl = process.env.DISCORD_WEBHOOK_URL_REGIONAL_STAFF
//   if(formType === "ems") webhookUrl = process.env.DISCORD_WEBHOOK_URL_EMS
//   if(formType === "pd") webhookUrl = process.env.DISCORD_WEBHOOK_URL_PD

//   if (!webhookUrl) {
//     throw new Error("Missing DISCORD_WEBHOOK_URL environment variable.");
//   }

//   const response = await fetch(webhookUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       embeds: [
//         {
//           title: "📩 New Application Submission",
//           color: 0x8b5cf6,
//           fields: [
//             {
//               name: "Form Type",
//               value: formType,
//               inline: false,
//             },
//             ...buildFields(data),
//           ],
//         },
//       ],
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to submit application.");
//   }

//   return { success: true };
// }
 



export async function submitApplication({ formType, data, userId }: SubmitApplicationInput & { userId: string }) {
  // console.log("Submitting application:", { formType, data })
  try {
    await prisma.application.create({
      data: {
        userId,
        formType: formDbMap[formType],
        formData: JSON.stringify(data),
      }
    })
  } catch (error) {
    console.log("Error submitting application:", error);
    throw new Error("Failed to submit application.");
  }
}

