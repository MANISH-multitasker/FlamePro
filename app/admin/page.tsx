"use client";

import Navigation from "@/components/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  getPendingForms,
  reviewApplication,
} from "./actions";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

type PendingApplication = Awaited<ReturnType<typeof getPendingForms>>[number];

const formTypeLabels: Record<string, string> = {
  REGIONAL_STAFF: "Staff Form",
  PD: "Police Department",
  EMS: "EMS",
  STREAMER: "Streamer",
};

function parseFormData(formData: PendingApplication["formData"]) {
  if (formData == null) return {};

  if (typeof formData === "string") {
    try {
      const parsed = JSON.parse(formData);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : { value: parsed };
    } catch {
      return { value: formData };
    }
  }

  if (typeof formData === "object" && !Array.isArray(formData)) {
    return formData as Record<string, unknown>;
  }

  return { value: formData };
}

function formatFieldValue(value: unknown): string {
  if (value == null) return "-";
  if (Array.isArray(value)) return value.length ? value.map(formatFieldValue).join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_/]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export default function page() {
  const [responses, setResponses] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadPendingForms() {
    setLoading(true);
    try {
      const data = await getPendingForms();
      console.log(data)
      setResponses(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingForms();
  }, []);

  function handleStatusUpdate(
    id: string,
    status: typeof ApplicationStatus.ACCEPTED | typeof ApplicationStatus.REJECTED,
    formType: PendingApplication["formType"],
    userId: string,
  ) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await reviewApplication(id, status, formType, userId);
        setResponses((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error(error);
      } finally {
        setPendingId(null);
      }
    });
  }
  

  const router = useRouter();

  async function handleLogout() {
    await logoutAdmin();
    router.push("/applications");
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background px-6 py-20 sm:px-10">
      <Navigation />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Pending Applications
            </h1>
            <p className="mt-3 text-sm text-foreground/55">
              Review submissions and approve or reject them.
            </p>
          </div>
          <div>
            <button
              onClick={() => router.push("/applications")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/30 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-purple-500/10 transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-foreground/50">Loading applications...</p>
        ) : responses.length === 0 ? (
          <p className="mt-10 text-sm text-foreground/50">No pending applications.</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {responses.map((response) => {
              const fields = parseFormData(response.formData);
              const busy = isPending && pendingId === response.id;

              return (
                <article
                  key={response.id}
                  className="group relative flex min-h-88 flex-col overflow-hidden rounded-xl border border-purple-700/40 bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-6 shadow-lg shadow-purple-900/15 transition-all duration-300 hover:border-purple-500/60"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10 flex h-full flex-col">
                    <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight text-foreground">
                      {formTypeLabels[response.formType] ?? response.formType}
                    </h2>

                    <p className="mt-2 text-sm text-foreground/55">
                      {response.user?.name ?? "Unknown user"}
                      {response.user?.email ? ` · ${response.user.email}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-foreground/40">
                      Submitted {new Date(response.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-5 space-y-2">
                      {Object.entries(fields).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg border border-purple-700/30 bg-purple-950/20 px-3 py-2"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
                            {formatKey(key)}
                          </p>
                          <p className="mt-1 break-words text-sm text-foreground/80">
                            {formatFieldValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex gap-3 pt-6">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleStatusUpdate(response.id, ApplicationStatus.ACCEPTED, response.formType, response.user.id)
                        }
                        className="flex-1 rounded-lg border border-emerald-600/50 bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-700/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "Updating..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleStatusUpdate(response.id, ApplicationStatus.REJECTED, response.formType, response.user.id)
                        }
                        className="flex-1 rounded-lg border border-rose-600/50 bg-gradient-to-r from-rose-800 to-rose-700 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-700/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
