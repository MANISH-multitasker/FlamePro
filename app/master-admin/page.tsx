"use client";

import Navigation from "@/components/navigation";
import { useEffect, useRef, useState } from "react";
import {
  grantPermission,
  revokePermission,
  getPermissions,
  getRevocationHistory,
  getPartners,
  addPartner,
  updatePartner,
  deletePartner,
  getStreamerChannels,
  addStreamerChannel,
  updateStreamerChannelStatus,
  deleteStreamerChannel,
  getStreamerConfig,
  updateStreamerConfig,
  getStreamHistory,
  clearStreamHistory,
} from "./actions";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Plus,
  Trash2,
  Crown,
  Home,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  FileText,
  User,
  Handshake,
  Globe,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  Tv,
  Radio,
  Key,
  Sliders,
  Play,
  Ban,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Permission = Awaited<ReturnType<typeof getPermissions>>[number];
type Revocation = Awaited<ReturnType<typeof getRevocationHistory>>[number];
type Partner = Awaited<ReturnType<typeof getPartners>>[number];
type StreamerChannel = Awaited<ReturnType<typeof getStreamerChannels>>[number];
type StreamerConfig = Awaited<ReturnType<typeof getStreamerConfig>>;
type StreamHistory = Awaited<ReturnType<typeof getStreamHistory>>[number];

type ActiveTab = "permissions" | "streamers" | "partners" | "audit";

export default function MasterAdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("permissions");

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [history, setHistory] = useState<Revocation[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [streamers, setStreamers] = useState<StreamerChannel[]>([]);
  const [streamConfig, setStreamConfig] = useState<StreamerConfig | null>(null);
  const [streamHistory, setStreamHistory] = useState<StreamHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Grant Form State
  const [selectedPanel, setSelectedPanel] = useState<"APPLICATION" | "TEAM">("APPLICATION");
  const [discordId, setDiscordId] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [grantError, setGrantError] = useState("");
  const [grantSuccess, setGrantSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revoke Modal State
  const [revokingPerm, setRevokingPerm] = useState<Permission | null>(null);
  const [revokeConfirmDiscordId, setRevokeConfirmDiscordId] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [removedByName, setRemovedByName] = useState("");
  const [revokeError, setRevokeError] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  // Partner Form State
  const [partnerName, setPartnerName] = useState("");
  const [partnerWebsite, setPartnerWebsite] = useState("");
  const [partnerLogo, setPartnerLogo] = useState("");
  const [partnerDesc, setPartnerDesc] = useState("");
  const [partnerError, setPartnerError] = useState("");
  const [partnerSuccess, setPartnerSuccess] = useState("");
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const partnerFileInputRef = useRef<HTMLInputElement>(null);

  // Streamer Management State
  const [streamerPlatform, setStreamerPlatform] = useState<"youtube" | "kick">("youtube");
  const [streamerChannelId, setStreamerChannelId] = useState("");
  const [streamerChannelName, setStreamerChannelName] = useState("");
  const [streamerError, setStreamerError] = useState("");
  const [streamerSuccess, setStreamerSuccess] = useState("");
  const [isAddingStreamer, setIsAddingStreamer] = useState(false);

  // Streamer Settings State
  const [ytApiKey, setYtApiKey] = useState("");
  const [keywordsStr, setKeywordsStr] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const router = useRouter();

  async function loadData() {
    setLoading(true);
    try {
      const [permsData, historyData, partnersData, streamersData, configData, streamHistData] =
        await Promise.all([
          getPermissions(),
          getRevocationHistory(),
          getPartners(),
          getStreamerChannels(),
          getStreamerConfig(),
          getStreamHistory(),
        ]);

      setPermissions(permsData ?? []);
      setHistory(historyData ?? []);
      setPartners(partnersData ?? []);
      setStreamers(streamersData ?? []);
      setStreamConfig(configData);
      setStreamHistory(streamHistData ?? []);

      if (configData) {
        setYtApiKey(configData.ytApiKey || "");
        setKeywordsStr((configData.keywords as string[]).join(", "));
        setRefreshInterval(configData.interval || 3);
      }
    } catch (err) {
      console.error("Failed to load master admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ─── Permission Handlers ────────────────────────────────────────── */

  async function handleGrant() {
    if (!discordId.trim()) {
      setGrantError("Please enter Discord ID");
      return;
    }
    if (!name.trim()) {
      setGrantError("Please enter Staff Name");
      return;
    }
    if (!reason.trim()) {
      setGrantError("Please enter Reason for access");
      return;
    }

    setGrantError("");
    setGrantSuccess("");
    setIsSubmitting(true);

    try {
      await grantPermission(discordId.trim(), name.trim(), reason.trim(), selectedPanel);
      setGrantSuccess(
        `Successfully granted ${selectedPanel === "APPLICATION" ? "Application" : "Team"} access to ${name.trim()} (${discordId.trim()})`
      );
      setDiscordId("");
      setName("");
      setReason("");
      await loadData();
    } catch (err: any) {
      setGrantError(err?.message || "Failed to grant permission");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openRevokeModal(perm: Permission) {
    setRevokingPerm(perm);
    setRevokeConfirmDiscordId("");
    setRevokeReason("");
    setRemovedByName("");
    setRevokeError("");
  }

  function closeRevokeModal() {
    setRevokingPerm(null);
    setRevokeConfirmDiscordId("");
    setRevokeReason("");
    setRemovedByName("");
    setRevokeError("");
  }

  async function handleConfirmRevoke() {
    if (!revokingPerm) return;

    if (!revokeConfirmDiscordId.trim()) {
      setRevokeError("Please enter the Discord ID to confirm revocation");
      return;
    }
    if (revokeConfirmDiscordId.trim() !== revokingPerm.discordId) {
      setRevokeError("Confirmation Discord ID does not match!");
      return;
    }
    if (!revokeReason.trim()) {
      setRevokeError("Please provide a reason for revocation");
      return;
    }
    if (!removedByName.trim()) {
      setRevokeError("Please provide Removed By (your name)");
      return;
    }

    setIsRevoking(true);
    setRevokeError("");

    try {
      await revokePermission(
        revokingPerm.id,
        revokeConfirmDiscordId.trim(),
        revokeReason.trim(),
        removedByName.trim()
      );
      closeRevokeModal();
      await loadData();
    } catch (err: any) {
      setRevokeError(err?.message || "Failed to revoke permission");
    } finally {
      setIsRevoking(false);
    }
  }

  /* ─── Partner Handlers ───────────────────────────────────────────── */

  const handlePartnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPartnerLogo(result);
    };
    reader.readAsDataURL(file);
  };

  async function handleAddPartner() {
    if (!partnerName.trim()) {
      setPartnerError("Please enter Company / Partner Name");
      return;
    }
    if (!partnerWebsite.trim()) {
      setPartnerError("Please enter Website URL");
      return;
    }

    let validUrl = partnerWebsite.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    setPartnerError("");
    setPartnerSuccess("");
    setIsAddingPartner(true);

    try {
      await addPartner({
        name: partnerName.trim(),
        websiteUrl: validUrl,
        logo: partnerLogo.trim() || "/swiftsnip-partner.png",
        description: partnerDesc.trim(),
      });

      setPartnerSuccess(`Partner "${partnerName.trim()}" added successfully!`);
      setPartnerName("");
      setPartnerWebsite("");
      setPartnerLogo("");
      setPartnerDesc("");
      if (partnerFileInputRef.current) partnerFileInputRef.current.value = "";
      await loadData();
    } catch (err: any) {
      setPartnerError(err?.message || "Failed to add partner");
    } finally {
      setIsAddingPartner(false);
    }
  }

  async function handleTogglePartnerVisibility(partner: Partner) {
    try {
      await updatePartner(partner.id, { hidden: !partner.hidden });
      await loadData();
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  }

  async function handleDeletePartner(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to remove partner "${name}"?`)) return;

    try {
      await deletePartner(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete partner:", err);
    }
  }

  /* ─── Streamer Channel Handlers ──────────────────────────────────── */

  async function handleAddStreamer() {
    if (!streamerChannelId.trim()) {
      setStreamerError("Please enter Channel ID, username, or @handle");
      return;
    }

    setStreamerError("");
    setStreamerSuccess("");
    setIsAddingStreamer(true);

    try {
      await addStreamerChannel({
        platform: streamerPlatform,
        channelId: streamerChannelId.trim(),
        name: streamerChannelName.trim() || streamerChannelId.trim(),
      });

      setStreamerSuccess(`Streamer channel added successfully!`);
      setStreamerChannelId("");
      setStreamerChannelName("");
      await loadData();
    } catch (err: any) {
      setStreamerError(err?.message || "Failed to add streamer channel");
    } finally {
      setIsAddingStreamer(false);
    }
  }

  async function handleUpdateStreamerStatus(id: string, status: "active" | "suspended" | "hidden") {
    try {
      await updateStreamerChannelStatus(id, status);
      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function handleDeleteStreamer(id: string, name: string) {
    if (!window.confirm(`Remove channel "${name}" from streamers list?`)) return;

    try {
      await deleteStreamerChannel(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete streamer:", err);
    }
  }

  async function handleSaveStreamerSettings() {
    setIsSavingSettings(true);
    setSettingsSuccess("");

    try {
      const keywords = keywordsStr
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      await updateStreamerConfig({
        ytApiKey: ytApiKey.trim(),
        keywords: keywords.length > 0 ? keywords : ["Flame City", "FlameCity", "FlameRP"],
        interval: Number(refreshInterval) || 3,
      });

      setSettingsSuccess("Streamer API settings saved successfully!");
      await loadData();
    } catch (err: any) {
      console.error("Failed to save streamer settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleClearHistory() {
    if (!window.confirm("Clear all recorded stream history logs?")) return;
    try {
      await clearStreamHistory();
      await loadData();
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background px-6 py-20 sm:px-10">
      <Navigation />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-orange-600/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-900/30">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                Master Admin Panel
              </h1>
              <p className="mt-1 text-sm text-foreground/55">
                Manage panel permissions, community streamers, official sponsors, and audit history
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-500/30 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-amber-500/10 transition-colors"
          >
            <Home size={14} className="text-amber-400" />
            Back to Home
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-amber-600/20 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "permissions"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40"
                : "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <Shield size={16} />
            <span>Staff Permissions</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {permissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("streamers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "streamers"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40"
                : "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <Tv size={16} />
            <span>Streamers & Media</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {streamers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "partners"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40"
                : "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <Handshake size={16} />
            <span>Official Partners</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {partners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40"
                : "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <History size={16} />
            <span>Audit & History</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {history.length}
            </span>
          </button>
        </div>

        {/* ═══════════ TAB 1: PERMISSIONS & STAFF ═══════════ */}
        {activeTab === "permissions" && (
          <div className="mt-8 space-y-10">
            {/* Grant Permission Card */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Plus size={20} className="text-emerald-400" />
                Grant Admin Access
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                Enter Discord ID, Staff Name, and Reason to assign Application or Team admin privileges.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Target Panel
                  </label>
                  <select
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value as "APPLICATION" | "TEAM")}
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500/70 transition-colors"
                  >
                    <option value="APPLICATION">📋 Application Admin Panel</option>
                    <option value="TEAM">👥 Team Admin Panel</option>
                  </select>
                </div>

                {/* Discord ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Discord ID
                  </label>
                  <input
                    type="text"
                    value={discordId}
                    onChange={(e) => {
                      setDiscordId(e.target.value);
                      setGrantError("");
                      setGrantSuccess("");
                    }}
                    placeholder="e.g. 1289624252114534548"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Staff Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setGrantError("");
                      setGrantSuccess("");
                    }}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Reason for Access
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setGrantError("");
                      setGrantSuccess("");
                    }}
                    placeholder="e.g. Appointed Head of Staff / Moderator"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>
              </div>

              {grantError && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle size={14} />
                  <span>{grantError}</span>
                </div>
              )}
              {grantSuccess && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>{grantSuccess}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGrant}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/50 bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-700/40 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {isSubmitting ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </div>

            {/* Active Permissions Table */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Users size={20} className="text-amber-400" />
                  Active Permissions ({permissions.length})
                </h2>
              </div>

              {loading ? (
                <p className="mt-6 text-sm text-foreground/50">Loading permissions...</p>
              ) : permissions.length === 0 ? (
                <p className="mt-6 text-sm text-foreground/50">No permissions granted yet.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-600/20">
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Discord ID
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Panel
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Granted At
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((perm) => (
                        <tr
                          key={perm.id}
                          className="border-b border-amber-600/10 hover:bg-amber-900/15 transition-colors"
                        >
                          <td className="px-4 py-4 text-foreground font-semibold text-sm">
                            {perm.name || "—"}
                          </td>
                          <td className="px-4 py-4 text-foreground/80 font-mono text-xs">
                            {perm.discordId}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                perm.panel === "APPLICATION"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {perm.panel === "APPLICATION" ? "📋 Application" : "👥 Team"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-foreground/70 text-xs max-w-xs truncate">
                            {perm.reason || "—"}
                          </td>
                          <td className="px-4 py-4 text-foreground/50 text-xs whitespace-nowrap">
                            {new Date(perm.grantedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {perm.discordId === "745139762909675561" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1">
                                👑 Permanent (Dev)
                              </span>
                            ) : (
                              <button
                                onClick={() => openRevokeModal(perm)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-600/40 bg-rose-900/20 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-800/40 transition-colors"
                              >
                                <Trash2 size={13} />
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 2: STREAMERS & MEDIA ═══════════ */}
        {activeTab === "streamers" && (
          <div className="mt-8 space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-purple-700/30 bg-purple-950/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Tv size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{streamers.length}</div>
                  <div className="text-xs text-white/50">Configured Channels</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-700/30 bg-emerald-950/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                  <Radio size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">
                    {streamers.filter((s) => s.status === "active").length}
                  </div>
                  <div className="text-xs text-white/50">Active & Tracking</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-amber-700/30 bg-amber-950/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400">
                  <History size={24} />
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">{streamHistory.length}</div>
                  <div className="text-xs text-white/50">Streams History Logs</div>
                </div>
              </div>
            </div>

            {/* Add Streamer Form */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Plus size={20} className="text-amber-400" />
                Add Streamer Channel
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                Add a YouTube or Kick creator channel. When they go live, their broadcast appears automatically in Watch Live.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Platform */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Platform
                  </label>
                  <select
                    value={streamerPlatform}
                    onChange={(e) => setStreamerPlatform(e.target.value as "youtube" | "kick")}
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500/70 transition-colors"
                  >
                    <option value="youtube">🔴 YouTube</option>
                    <option value="kick">🟢 Kick</option>
                  </select>
                </div>

                {/* Channel ID / username */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    {streamerPlatform === "youtube" ? "YouTube Channel ID or @handle" : "Kick Username"} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={streamerChannelId}
                    onChange={(e) => {
                      setStreamerChannelId(e.target.value);
                      setStreamerError("");
                      setStreamerSuccess("");
                    }}
                    placeholder={streamerPlatform === "youtube" ? "e.g. UC_x5XG... or @handle" : "e.g. username"}
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Streamer Display Name
                  </label>
                  <input
                    type="text"
                    value={streamerChannelName}
                    onChange={(e) => {
                      setStreamerChannelName(e.target.value);
                      setStreamerError("");
                      setStreamerSuccess("");
                    }}
                    placeholder="e.g. Flame Official"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>
              </div>

              {streamerError && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle size={14} />
                  <span>{streamerError}</span>
                </div>
              )}
              {streamerSuccess && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>{streamerSuccess}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddStreamer}
                  disabled={isAddingStreamer}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-600/50 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-950/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-700/40 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {isAddingStreamer ? "Adding..." : "Add Channel"}
                </button>
              </div>
            </div>

            {/* Channels Table */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Tv size={20} className="text-amber-400" />
                Configured Streamer Channels ({streamers.length})
              </h2>

              {loading ? (
                <p className="mt-6 text-sm text-foreground/50">Loading channels...</p>
              ) : streamers.length === 0 ? (
                <p className="mt-6 text-sm text-foreground/50">No streamer channels added yet.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-600/20">
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Channel Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Platform
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Channel ID / Handle
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {streamers.map((ch) => (
                        <tr
                          key={ch.id}
                          className="border-b border-amber-600/10 hover:bg-amber-900/15 transition-colors"
                        >
                          <td className="px-4 py-4 font-bold text-foreground text-sm">
                            {ch.name}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                ch.platform === "youtube"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {ch.platform === "youtube" ? "YouTube" : "Kick"}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-foreground/75">
                            {ch.channelId}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                ch.status === "active"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : ch.status === "suspended"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                              }`}
                            >
                              {ch.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ch.status === "active" ? (
                                <button
                                  onClick={() => handleUpdateStreamerStatus(ch.id, "suspended")}
                                  title="Suspend channel"
                                  className="p-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
                                >
                                  <Ban size={13} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStreamerStatus(ch.id, "active")}
                                  title="Activate channel"
                                  className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <Check size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteStreamer(ch.id, ch.name)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-600/40 bg-rose-900/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-800/40 transition-colors"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* API Settings & Search Keywords Card */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Sliders size={20} className="text-amber-400" />
                Live Streams Engine Settings
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                Configure your YouTube Data API Key, search tags, and refresh rate.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    YouTube Data API v3 Key
                  </label>
                  <input
                    type="password"
                    value={ytApiKey}
                    onChange={(e) => {
                      setYtApiKey(e.target.value);
                      setSettingsSuccess("");
                    }}
                    placeholder="Paste YouTube API key..."
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors font-mono"
                  />
                </div>

                {/* Refresh Interval */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Auto-Refresh Rate
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => {
                      setRefreshInterval(Number(e.target.value));
                      setSettingsSuccess("");
                    }}
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500/70 transition-colors"
                  >
                    <option value={1}>Every 1 minute</option>
                    <option value={3}>Every 3 minutes (Recommended)</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={10}>Every 10 minutes</option>
                  </select>
                </div>

                {/* Search Keywords */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Search Keywords (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsStr}
                    onChange={(e) => {
                      setKeywordsStr(e.target.value);
                      setSettingsSuccess("");
                    }}
                    placeholder="e.g. Flame City, FlameCity, FlameRP"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>
              </div>

              {settingsSuccess && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveStreamerSettings}
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-600/50 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-950/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-700/40 disabled:opacity-50"
                >
                  <Sliders size={16} />
                  {isSavingSettings ? "Saving..." : "Save Engine Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 3: OFFICIAL PARTNERS ═══════════ */}
        {activeTab === "partners" && (
          <div className="mt-8 space-y-10">
            {/* Add Partner Form */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Handshake size={20} className="text-amber-400" />
                Add Official Partner
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                Configure company logos, names, and clickable links that float in the bottom ticker banner.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Partner / Company Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => {
                      setPartnerName(e.target.value);
                      setPartnerError("");
                      setPartnerSuccess("");
                    }}
                    placeholder="e.g. SwiftSnip"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Website URL <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={partnerWebsite}
                    onChange={(e) => {
                      setPartnerWebsite(e.target.value);
                      setPartnerError("");
                      setPartnerSuccess("");
                    }}
                    placeholder="e.g. https://swiftsnip.in/"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Description / Tagline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Tagline / Description
                  </label>
                  <input
                    type="text"
                    value={partnerDesc}
                    onChange={(e) => {
                      setPartnerDesc(e.target.value);
                      setPartnerError("");
                      setPartnerSuccess("");
                    }}
                    placeholder="e.g. #1 Stream Clipping Tool for YouTube & Twitch"
                    className="w-full rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                  />
                </div>

                {/* Logo input & upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Logo (Image URL or Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={partnerLogo}
                      onChange={(e) => {
                        setPartnerLogo(e.target.value);
                        setPartnerError("");
                        setPartnerSuccess("");
                      }}
                      placeholder="e.g. /swiftsnip-partner.png or https://..."
                      className="flex-1 rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-amber-500/70 transition-colors"
                    />
                    <input
                      ref={partnerFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => partnerFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors whitespace-nowrap"
                    >
                      <Upload size={14} />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              {partnerLogo && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-black/40 border border-amber-500/20 rounded-xl w-fit">
                  <span className="text-xs text-white/50">Logo Preview:</span>
                  <img
                    src={partnerLogo}
                    alt="Preview"
                    className="h-8 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {partnerError && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle size={14} />
                  <span>{partnerError}</span>
                </div>
              )}
              {partnerSuccess && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>{partnerSuccess}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddPartner}
                  disabled={isAddingPartner}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-600/50 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-950/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-700/40 disabled:opacity-50"
                >
                  <Plus size={16} />
                  {isAddingPartner ? "Saving..." : "Add Official Partner"}
                </button>
              </div>
            </div>

            {/* Partners Table */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Handshake size={20} className="text-amber-400" />
                Current Official Partners ({partners.length})
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                All visible partners will float across the bottom ticker banner in real-time.
              </p>

              {loading ? (
                <p className="mt-6 text-sm text-foreground/50">Loading partners...</p>
              ) : partners.length === 0 ? (
                <p className="mt-6 text-sm text-foreground/50">No official partners added yet.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-600/20">
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Logo
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Partner Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Website URL
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Tagline / Description
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map((partner) => (
                        <tr
                          key={partner.id}
                          className="border-b border-amber-600/10 hover:bg-amber-900/15 transition-colors"
                        >
                          <td className="px-4 py-4">
                            {partner.logo ? (
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-7 max-w-[90px] object-contain rounded bg-black/40 p-1 border border-white/10"
                              />
                            ) : (
                              <span className="text-xs text-white/40">No logo</span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-bold text-foreground text-sm">
                            {partner.name}
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={partner.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 hover:underline"
                            >
                              <span>{partner.websiteUrl}</span>
                              <ExternalLink size={11} />
                            </a>
                          </td>
                          <td className="px-4 py-4 text-foreground/70 text-xs max-w-xs truncate">
                            {partner.description || "—"}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                !partner.hidden
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                              }`}
                            >
                              {!partner.hidden ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTogglePartnerVisibility(partner)}
                                title={partner.hidden ? "Show in ticker" : "Hide from ticker"}
                                className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                {partner.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => handleDeletePartner(partner.id, partner.name)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-600/40 bg-rose-900/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-800/40 transition-colors"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 4: AUDIT & HISTORY ═══════════ */}
        {activeTab === "audit" && (
          <div className="mt-8 space-y-10">
            {/* Revocation Logs */}
            <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-amber-950/30 to-orange-950/15 p-6 sm:p-8 shadow-xl shadow-amber-950/20">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <History size={20} className="text-orange-400" />
                Revocation Audit Logs ({history.length})
              </h2>
              <p className="mt-1 text-xs text-foreground/50">
                Complete history of revoked staff permissions, including reason and who removed access.
              </p>

              {loading ? (
                <p className="mt-6 text-sm text-foreground/50">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="mt-6 text-sm text-foreground/50">No revocations logged yet.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-600/20">
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Discord ID
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Panel
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Revocation Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Removed By
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground/60 uppercase text-xs tracking-wider">
                          Revoked At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-amber-600/10 hover:bg-amber-900/10 transition-colors"
                        >
                          <td className="px-4 py-4 text-foreground/80 font-medium text-sm">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 text-foreground/70 font-mono text-xs">
                            {item.discordId}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                item.panel === "APPLICATION"
                                  ? "bg-purple-500/15 text-purple-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {item.panel === "APPLICATION" ? "Application" : "Team"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-rose-300/80 text-xs">
                            {item.reason}
                          </td>
                          <td className="px-4 py-4 text-amber-300 text-xs font-semibold">
                            {item.removedBy}
                          </td>
                          <td className="px-4 py-4 text-foreground/40 text-xs whitespace-nowrap">
                            {new Date(item.revokedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ REVOKE CONFIRMATION MODAL ═══════════ */}
      <AnimatePresence>
        {revokingPerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={closeRevokeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-[#0f0907] border border-rose-600/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-rose-950/40"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Revoke Permission</h3>
                    <p className="text-white/50 text-xs">
                      Remove {revokingPerm.name || "staff"} from {revokingPerm.panel} Admin Panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeRevokeModal}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Target info */}
                <div className="rounded-xl border border-rose-600/20 bg-rose-950/20 p-3 text-xs text-foreground/80 space-y-1">
                  <p><strong>Target Staff:</strong> {revokingPerm.name || "N/A"}</p>
                  <p><strong>Expected Discord ID:</strong> <span className="font-mono text-amber-400">{revokingPerm.discordId}</span></p>
                  <p><strong>Panel:</strong> {revokingPerm.panel}</p>
                </div>

                {/* Confirm Discord ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Confirm Discord ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={revokeConfirmDiscordId}
                    onChange={(e) => {
                      setRevokeConfirmDiscordId(e.target.value);
                      setRevokeError("");
                    }}
                    placeholder={`Type ${revokingPerm.discordId} to confirm`}
                    className="w-full rounded-xl border border-rose-600/30 bg-black/60 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Reason for Revocation <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => {
                      setRevokeReason(e.target.value);
                      setRevokeError("");
                    }}
                    placeholder="e.g. Inactive / Stepped down / Terminated"
                    className="w-full rounded-xl border border-rose-600/30 bg-black/60 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Removed By */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Removed By (Your Name) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={removedByName}
                    onChange={(e) => {
                      setRemovedByName(e.target.value);
                      setRevokeError("");
                    }}
                    placeholder="e.g. Master Admin Flame"
                    className="w-full rounded-xl border border-rose-600/30 bg-black/60 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {revokeError && (
                  <p className="text-rose-400 text-xs">{revokeError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeRevokeModal}
                    className="flex-1 px-4 py-2.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isRevoking}
                    onClick={handleConfirmRevoke}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 rounded-xl transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking..." : "Confirm Revoke"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
