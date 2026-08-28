"use client";

import Navigation from "@/components/navigation";
import { submitApplication, type SubmittableFormType } from "./actions";
import { notFound, useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";


type ValidFormType = "frontend" | "regionalStaff" | "ems" | "pd" | "streamers";

type FormField =
  | {
      name: string;
      label: string;
      type: "text" | "number";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "textarea";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select" | "checkbox" | "multiselect";
      options: string[];
    };

const formConfig: Partial<Record<ValidFormType, FormField[]>> = {
  "regionalStaff": [
    {
      name: "name",
      label: "Your Name?",
      type: "text",
      placeholder: "Enter your name",
    },
    {
      name: "discordId",
      label: "Discord ID?",
      type: "text",
      placeholder: "Example: 1010152576232214538",
    },
    {
      name: "age",
      label: "Your age?",
      type: "number",
      placeholder: "Enter your age",
    },
    {
      name: "ownsGtaVAndFiveM",
      label: "Do you own GTA V & FiveM?",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "preferredStaffRole",
      label: "Preferred Role in Staff",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "hoursPerDay",
      label: "How many hours can you dedicate per day?",
      type: "number",
      placeholder: "Enter hours per day",
    },
    {
      name: "previousStaffExperience",
      label: "Have you been staff on any other servers?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "rpPlaytime",
      label: "How long have you been playing Roleplay / FiveM RP?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "rpRulesExperience",
      label: "What's your experience with RP rules and community handling?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "whyJoinStaff",
      label: "Why do you want to join the staff team?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "skillsAndQualities",
      label: "What skills or qualities make you a good fit for this role?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "handleRuleBreaking",
      label: "How would you handle a player breaking rules during RP?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "bannedOrWarned",
      label: "Have you ever been banned or warned in any RP server?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "understandsStaffResponsibility",
      label: "Do you understand that being staff is a responsibility and not a power role?",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "agreeToRules",
      label: "I have read and agree to all rules & conditions for joining the FCRP Staff Team.",
      type: "checkbox",
      options: ["I agree"],
    },
  ],
  "ems": [
    {
      name: "discordNameId",
      label: "1) Discord Name And ID",
      type: "text",
      placeholder: "Example: Username#1234 / 1010152576232214538",
    },
    {
      name: "characterName",
      label: "2) Character Name",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "previousWork",
      label: "3) Have you worked anywhere before and what position were you in?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "departmentProficiency",
      label: "4) In which department have you achieved proficiency?",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "yearsExperience",
      label: "5) How many years of experience do you have?",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "q6BloodPH",
      label: "6) What is the normal pH of human blood?",
      type: "select",
      options: ["A) 6.8", "B) 7.4", "C) 8.5", "D) 5.5"],
    },
    {
      name: "q7HeartChambers",
      label: "7) How many chambers are present in the human heart?",
      type: "select",
      options: ["A) 2", "B) 3", "C) 4", "D) 5"],
    },
    {
      name: "q8BCGVaccine",
      label: "8) BCG vaccine is primarily given to prevent which disease?",
      type: "select",
      options: ["A) Polio", "B) Tuberculosis", "C) Typhoid", "D) Hepatitis"],
    },
    {
      name: "q9Insulin",
      label: "9) Insulin is produced by which cells of the pancreas?",
      type: "select",
      options: ["A) Alpha cells", "B) Beta cells", "C) Delta cells", "D) Acinar cells"],
    },
    {
      name: "q10RespiratoryRate",
      label: "10) What is the normal respiratory rate in a healthy adult?",
      type: "select",
      options: ["A) 4–8/min", "B) 12–20/min", "C) 25–35/min", "D) 40–50/min"],
    },
    {
      name: "q11Malaria",
      label: "11) Malaria is caused by which parasite?",
      type: "select",
      options: ["A) Plasmodium", "B) Salmonella", "C) E. coli", "D) Vibrio"],
    },
    {
      name: "q12OxygenTransport",
      label: "12) Most oxygen in the blood is transported by:",
      type: "select",
      options: ["A) Albumin", "B) Hemoglobin", "C) Platelets", "D) Plasma"],
    },
    {
      name: "q13DengueVector",
      label: "13) Which mosquito is the main vector of dengue?",
      type: "select",
      options: ["A) Anopheles", "B) Aedes", "C) Culex", "D) Mansonia"],
    },
    {
      name: "q14CPR",
      label: "14) What is the recommended chest compression rate during adult CPR?",
      type: "select",
      options: ["A) 60–80/min", "B) 80–90/min", "C) 100–120/min", "D) 140–160/min"],
    },
    {
      name: "q15Jaundice",
      label: "15) Which substance is primarily elevated in jaundice?",
      type: "select",
      options: ["A) Bilirubin", "B) Calcium", "C) Sodium", "D) Urea"],
    },
  ],
  "pd": [
    {
      name: "fullName",
      label: "Full Name (IC)",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "discordId",
      label: "Discord ID",
      type: "text",
      placeholder: "Example: 1010152576232214538",
    },
    {
      name: "discordUsername",
      label: "Discord Username",
      type: "text",
      placeholder: "Example: XYZZ",
    },
    {
      name: "age",
      label: "Age (OOC)",
      type: "number",
      placeholder: "Your answer",
    },
    {
      name: "timeZone",
      label: "Time zone",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "pdExperience",
      label: "Have you ever been part of a Police Department before?",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "preferredShift",
      label: "Please select your Preferred shift",
      type: "select",
      options: [
        "Morning Shift (6:00 AM IST to 12:00 PM IST)",
        "Afternoon Shift (12:00 PM IST to 6:00 PM IST)",
        "Evening Shift (06:00 PM IST to 12:00 AM IST)",
        "Night Shift (12:00 AM IST to 6:00 AM IST)",
        "Other",
      ],
    },
    {
      name: "weeklyActivity",
      label: "How active can you be on duty each week?",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "resumeLink",
      label: "Send your Resume Link if you have one, otherwise it is not required",
      type: "text",
      placeholder: "Your answer",
    },
    {
      name: "whyJoinLspd",
      label: "Why do you want to join the LSPD?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "mainDuty",
      label: "What do you think is the main duty of a Police Officer?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "lspdKnowledge",
      label: "What do you know about the LSPD and its structure?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "strengthsWeaknesses",
      label: "What are your strengths and weaknesses?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "disciplineTeamwork",
      label: "How would you describe your discipline and teamwork skills?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "differentFromOthers",
      label: "What makes you different from other applicants?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "shotsFiredScenario",
      label:
        "You receive a call about shots fired, but when you arrive, there’s no suspect — only bystanders recording you. What do you do?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "trafficStopScenario",
      label:
        "You pull over a vehicle. The driver refuses to show ID and starts shouting at you. What’s your response?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "robberyScenario",
      label:
        "You respond to a store robbery. On arrival, the suspect is armed and inside the store with a hostage. How do you handle the situation?",
      type: "textarea",
      placeholder: "Your answer",
    },
    {
      name: "unsafeOrderScenario",
      label:
        "A senior officer gives you an order you think is unsafe or violates procedure. What should be your approach?",
      type: "textarea",
      placeholder: "Your answer",
    },
  ],
"streamers":[
  {
    name: "Full Name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    name: "Discord User ID",
    label: "Discord User ID",
    type: "text",
    placeholder: "Enter your Discord User ID",
  },
  {
    name: "Creator Channel Name",
    label: "Creator Channel Name",
    type: "text",
    placeholder: "Enter your creator channel name",
  },
  {
    name: "Primary Streaming Platform",
    label: "Primary Streaming Platform",
    type: "checkbox",
    options: [
      "YouTube",
      "Kick",
      "Twitch",
      "Facebook Gaming",
      "Other",
    ],
  },
  {
    name: "Channel Link",
    label: "Channel Link",
    type: "text",
    placeholder: "Enter your channel link",
  },
  {
    name: "Social Media",
    label: "Social Media",
    type: "text",
    placeholder: "Enter your social media links",
  },
]

}

const VALID_FORM_TYPES = ["frontend", "regionalStaff", "ems", "pd", "streamers"] as const;

function isValidFormType(value: string | undefined): value is ValidFormType {
  return VALID_FORM_TYPES.includes(value as ValidFormType);
}

function isSubmittableFormType(value: ValidFormType): value is SubmittableFormType {
  return value !== "frontend";
}

function page() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const params = useParams<{ formType: string | string[] }>();
  const formType = Array.isArray(params.formType) ? params.formType[0] : params.formType;
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "discord",
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowForm(true);
    }, 180);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isValidFormType(formType)) {
    notFound();
  }
  const fields = formConfig[formType];
  if (!fields) {
    notFound();
  }
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data: any) => {
    if (!isSubmittableFormType(formType)) {
      notFound();
    }
    setSubmitting(true);
    try {
      await submitApplication({
        formType,
        data,
        userId: session?.user?.id as string,
      });
      router.push("/applications");
    } catch (err) {
      console.error("Failed to submit application:", err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isPending && !session?.user) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-background px-6 py-20 sm:px-10 flex flex-col justify-center items-center">
        <Navigation />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md w-full rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/60 to-neutral-900/80 p-8 backdrop-blur-md text-center shadow-2xl shadow-purple-950/60">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#5865F2]/20 flex items-center justify-center border border-[#5865F2]/30">
            <svg className="w-7 h-7 fill-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            Please connect your Discord account before filling out and submitting this application form.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#5865F2]/30 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Connect Discord to Continue
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="relative min-h-screen overflow-hidden bg-background px-6 py-20 sm:px-10">
      <Navigation />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <form
        className={`relative z-10 mx-auto flex max-w-2xl flex-col gap-4 rounded-xl border border-purple-700/20 bg-neutral-900/30 p-8 text-purple-300 shadow-lg shadow-purple-900/15 transition-all duration-700 ease-out ${showForm ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        {fields.map((field: FormField, idx: number) => {
          switch (field.type) {
            case "text":
            case "number":
              return (
                <div key={field.name}>
                  <label className="mb-3 block font-bold">
                    {idx + 1}. {field.label}
                  </label>
                  <input
                    placeholder={field.placeholder}
                    {...register(field.name, { required: true })}
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-md text-white placeholder-white/20 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
                  />
                </div>
              );

            case "textarea":
              return (
                <div key={field.name}>
                  <label className="mb-3 block font-bold">
                    {idx + 1}. {field.label}
                  </label>
                  <textarea
                    placeholder={field.placeholder}
                    {...register(field.name, { required: true })}
                    className="min-h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-md text-white placeholder-white/20 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
                  />
                </div>
              );

            case "select":
              return (
                <div key={field.name}>
                  <p className="mb-3 block font-bold">
                    {idx + 1}.{field.label}
                  </p>
                  {field.options.map((opt: string) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-white/80"
                    >
                      <input
                        type="radio"
                        value={opt}
                        {...register(field.name, { required: true })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              );

            case "checkbox":
              return (
                <div key={field.name}>
                  <p className="mb-3 block font-bold">
                    {idx + 1}.{field.label}
                  </p>
                  {field.options.map((opt: string) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-white/80"
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        {...register(field.name, { required: true })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              );

            

            default:
              return null;
          }
        })}
        <button type="submit" className=" flex justify-center px-24 py-3 bg-linear-to-r from-purple-700 to-purple-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-700/50 border border-purple-600/50 cursor-pointer">{submitting ? <div><LoaderCircle className="animate-spin" /></div> : "Submit"}</button>
      </form>
    </section>
  )
}

export default page;
