"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Clock, ChevronDown } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export default function RulesPage() {
  const [expandedCategory, setExpandedCategory] = useState("support-rules")
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const categoryRef = useRef(null)
  const rulesContainerRef = useRef(null)
  const ruleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const ruleCategories = [
  {
    id: "support-rules",
    name: "Support Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "support-rules-sub",
        name: "Support Rules",
        rules: [
          {
            id: "follow-staff",
            title: "Follow Staff Decisions",
            description:
              "The decision taken by staff should be followed at all times. Counter-intuitive questions regarding staff decisions are null & void. You are not allowed to seek interactions with higher management for relief from bans or staff actions. Every staff member is considered qualified and their decisions should be respected. Abusive behavior towards staff will not be tolerated. Comply respectfully with staff in all decisions.",
          },
        ],
      },
    ],
  },

  {
    id: "voice-communication",
    name: "Voice Communication",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "voice-communication-sub",
        name: "Voice Rules",
        rules: [
          {
            id: "mic-quality",
            title: "Microphone & Headset",
            description:
              "Players are required to use a good quality, functioning microphone and headset to ensure clear communication during roleplay.",
          },
          {
            id: "no-external-comm",
            title: "No External Communication",
            description:
              "Players must not use external communication platforms (Discord, Zoom, etc.) to interact with others while actively playing on the server.",
          },
          {
            id: "voice-behaviour",
            title: "Voice Behaviour",
            description:
              "Out-of-character offensive language, threats, or racism are strictly prohibited. Any form of death threat toward real individuals is unacceptable and will lead to serious consequences.",
          },
        ],
      },
    ],
  },

  {
    id: "no-toxicity",
    name: "No Toxicity",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "no-toxicity-sub",
        name: "Anti-Toxicity",
        rules: [
          {
            id: "zero-tolerance",
            title: "Zero Tolerance for Toxicity",
            description:
              "FCRP has a zero-tolerance policy for toxic behaviors across all platforms. Offensive or explicit usernames, racism, trolling, discrimination, homophobia, and sexism will not be tolerated. Treat all members with respect and equality in voice, text, and streams. Publicly criticizing others is not allowed; report violations through proper channels. Content creators must moderate their communities or face consequences.",
          },
          {
            id: "insult-terms",
            title: "No Derogatory Language",
            description:
              'Using terms like "weird" or "strange" or any similar derogatory words to insult or demean roleplay is unacceptable.',
          },
        ],
      },
    ],
  },

  {
    id: "account",
    name: "Account Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "account-rules-sub",
        name: "Account",
        rules: [
          {
            id: "account-responsibility",
            title: "Account Responsibility",
            description:
              "You are solely responsible for all actions taken through your account. Keep it secure and follow community guidelines. If your account is hacked, compromised, or transferred (for example, using a different Steam, GTA, or Discord account), FCRP will not be responsible for any issues arising from it.",
          },
          {
            id: "no-account-trade",
            title: "No Account Sharing / Trading",
            description:
              "Account sharing, buying, or selling (including valuables) is strictly prohibited unless done through official channels approved by the server owner. Unauthorized transactions can result in scams, bans, or permanent character death.",
          },
          {
            id: "allowlist",
            title: "Allowlist Transfers",
            description:
              "If you lose access to your Discord account, we cannot transfer your Allowlist status. You must reapply with a new account.",
          },
          {
            id: "inactivity",
            title: "Inactivity",
            description:
              "If you are inactive for more than 30 days, your allowlist role may be removed without prior notice.",
          },
        ],
      },
    ],
  },

  {
    id: "donation",
    name: "Donation Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "donation-sub",
        name: "Donations",
        rules: [
          {
            id: "donation-ownership",
            title: "Donations & Purchases",
            description:
              "All donations and purchases are tied to your specific account and character. Perks must be selected during purchase and cannot be changed once confirmed. Gifting is allowed, meaning a player may purchase perks for another player; however, once the purchase is completed, the perks will remain bound to the recipient’s account. If you are banned, purchases are forfeited and non-refundable. Chargebacks will result in a permanent, non-appealable ban.",
          },
          {
            id: "no-resale",
            title: "No Resale or Transfer",
            description:
              "The resale or transfer of purchased items is strictly prohibited. All items are for personal use only.",
          },
        ],
      },
    ],
  },

  {
    id: "character",
    name: "Character Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "character-sub",
        name: "Character",
        rules: [
          {
            id: "character-separation",
            title: "Character Separation",
            description:
              "Each character must be completely independent. Characters may not share knowledge, relationships, or connections unless established in roleplay. Cross-character relationships (siblings, cousins, alter egos) are prohibited.",
          },
          {
            id: "naming-policy",
            title: "Naming Policy",
            description:
              "Character names must be realistic and immersive. Meme, troll, or inappropriate names will be changed or punished. Any names intended to insult, target, or mock other players, streamers, or public figures are strictly prohibited and will not be tolerated.",
          },
          {
            id: "unique-affiliations",
            title: "Unique Affiliations",
            description:
              "You cannot have multiple characters in the same gang, group, or faction. Each character must have distinct affiliations and storylines.",
          },
          {
            id: "inactivity-property",
            title: "Inactivity & Property",
            description:
              "Properties (vehicles, homes) can be reclaimed within ~30 days of inactivity. Logging once per week will not reset the inactivity timer.",
          },
          {
            id: "permadeath",
            title: "Permanent Death (Perma-Death)",
            description:
              "If a character is declared without a pulse (dead) three or more times, they are permanently dead and cannot be used again.",
          },
        ],
      },
    ],
  },

  {
    id: "ooc",
    name: "Out-Of-Character Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "ooc-sub",
        name: "OOC Rules",
        rules: [
          {
            id: "ooc-channel",
            title: "OOC Only in Discord",
            description:
              "OOC conversations are only allowed in Discord—not in-game. Immersion-breaking language is prohibited in-game.",
          },
          {
            id: "no-city-ref",
            title: "No External References",
            description:
              "Do not reference other 'cities' or 'counties' within the community. Avoid terms like 'the government', 'Gods', or 'look to the skies' when referring to staff.",
          },
          {
            id: "bug-reporting",
            title: "Bug Reporting Procedure",
            description:
              "If you encounter a bug or script issue, continue RP and report it later via the proper channels. Do not break character.",
          },
          {
            id: "ooc-comments",
            title: "Immersion & OOC Comments",
            description:
              'Comments like "you must be bored" to police or other RP roles are considered OOC and are not allowed. Avoid terms like key, server, or HP in roleplay; use proper RP terms.',
          },
        ],
      },
    ],
  },

  {
    id: "admin-actions",
    name: "Admin Actions",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "admin-actions-sub",
        name: "Admin Actions",
        rules: [
          {
            id: "respond-admin",
            title: "Respond to Admins",
            description:
              "If an admin contacts you regarding a timeout or rule violation, you must respond promptly. Bans will not be lifted until you have communicated with the Ban Team.",
          },
          {
            id: "acknowledge-admin",
            title: "Acknowledge Admin Messages",
            description:
              "Failure to acknowledge admin messages may result in a Ban until you respond.",
          },
        ],
      },
    ],
  },

  {
    id: "stream-sniping",
    name: "Stream Sniping",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "stream-sniping-sub",
        name: "Stream Sniping",
        rules: [
          {
            id: "no-stream-sniping",
            title: "No Stream Sniping",
            description:
              "Stream sniping is strictly prohibited. Being present in a streamer’s chat while playing on the server may be considered evidence of stream sniping if a complaint is filed.",
          },
        ],
      },
    ],
  },

  {
    id: "fairplay",
    name: "Character & Fair Play Guidelines",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "fairplay-sub",
        name: "Fair Play",
        rules: [
          {
            id: "char-age",
            title: "Character Age",
            description:
              "All player characters must be 18 years or older. If you have a special backstory or RP concept that requires an exception to this rule, please raise a support ticket for prior approval.",
          },
          {
            id: "no-win-only",
            title: "No Win-Only Mentality",
            description:
              "Roleplay is a two-way experience — counterplay is essential. Focus on storytelling, not just winning.",
          },
          {
            id: "no-afk-loot",
            title: "No AFK Looting",
            description:
              "Killing or robbing AFK players is strictly prohibited. Ensure the other party is present and responsive before hostile actions.",
          },
        ],
      },
    ],
  },

  {
    id: "exploits",
    name: "Glitching, Exploiting & Modifications",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "exploits-sub",
        name: "Exploits & Mods",
        rules: [
          {
            id: "no-glitching",
            title: "No Glitching or Exploiting",
            description:
              "Glitching and exploiting client or server bugs is prohibited. Abuse will result in a ban and removal of gained benefits.",
          },
          {
            id: "no-spawn-camping",
            title: "No Spawn Camping",
            description:
              "Camping animal or vehicle spawns to exploit mechanics is considered exploitation and is banned.",
          },
          {
            id: "no-cheats",
            title: "No Cheats / Unfair Mods",
            description:
              "Use of modifications or cheats that provide unfair advantages is strictly banned. Visual enhancements that do not grant advantage are allowed.",
          },
          {
            id: "no-macroing",
            title: "No Macroing",
            description:
              "Macroing (automating actions with third-party software/hardware) is prohibited. Offenders will have property or progress revoked and face bans.",
          },
          {
            id: "no-graphic-advantages",
            title: "No Graphic Advantage Mods",
            description:
              "No shadows or similar graphic modifications that grant unfair advantages are allowed. Shadows must be enabled to maintain fairness.",
          },
        ],
      },
    ],
  },

  {
    id: "reports",
    name: "Reports",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "reports-sub",
        name: "Report System",
        rules: [
          {
            id: "use-ticket-system",
            title: "Use Ticket System",
            description:
              "Use the Discord ticketing system to report incidents—past or present. The /report command should be used only for urgent admin assistance. For player/bug reports open a ticket in Discord.",
          },
          {
            id: "report-details",
            title: "Report Requirements",
            description:
              "When submitting a report, provide clear details, timestamps, involved players, and any evidence (screenshots, videos, chat logs). This helps staff investigate accurately.",
          },
          {
            id: "report-timeline",
            title: "Report Processing",
            description:
              "We aim to process reports within 48 hours; complex cases may take up to a week.",
          },
          {
            id: "suspect-staff-abuse",
            title: "Suspected Staff Abuse",
            description:
              "If you suspect staff abuse, submit a report via the Discord ticket system for investigation. Do not message staff privately about community issues—use tickets.",
          },
        ],
      },
    ],
  },

  {
    id: "prohibited",
    name: "Prohibited Roleplay",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "prohibited-sub",
        name: "Prohibited RP",
        rules: [
          {
            id: "prohibited-rp-themes",
            title: "Strictly Prohibited Roleplay",
            description:
              "Rape, suicide, pregnancy, children, slavery roleplay are strictly prohibited. Also banned: racism, hate speech, slurs, real-life terrorism or threats, and real-life pandemics or mental illness portrayals.",
          },
          {
            id: "admin-approval",
            title: "Admin Approval Exceptions",
            description:
              "Animal RP may be allowed upon explicit admin approval.",
          },
        ],
      },
    ],
  },

  {
    id: "safe-zones",
    name: "Safe Zones",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "safezones-sub",
        name: "Safe Zones",
        rules: [
          {
            id: "safe-zone-definition",
            title: "Safe Zones",
            description:
              "Designated areas where hostile actions (combat/theft) are prohibited to allow players to interact or perform tasks. Examples: Hospital/Pillbox, Event Areas.",
          },
        ],
      },
    ],
  },

  {
    id: "criminal-leo-interaction",
    name: "Criminal & LEO Interaction",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "criminal-leo-sub",
        name: "Criminal & Police",
        rules: [
          {
            id: "proper-communication",
            title: "Communication",
            description:
              "Arrests and detentions must be done with proper communication and engagement.",
          },
          {
            id: "kidnapping-leo",
            title: "Kidnapping LEO",
            description:
              "Kidnapping LEOs is allowed only with reasonable RP and not during unrelated LEO scenarios.",
          },
          {
            id: "rob-leo",
            title: "Robbing Police",
            description:
              "Robbing police officers is not allowed, as they are not considered loot sources. However, if you engage in an RP scenario involving robbing a cop, you are only allowed to take non-police items listed as Permitted Items.",
          },
          {
            id: "permitted-loot-items",
            title: "Permitted Loot Items",
            description:
              "Ammunition, IFAKs, Bandages, Armor only. Attempting to steal weapons, police gear or anything else is a violation.",
          },
        ],
      },
    ],
  },

  {
    id: "semi-safe-zones",
    name: "Semi Safe Zones",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "semi-safe-sub",
        name: "Semi Safe Zones",
        rules: [
          {
            id: "semi-safe",
            title: "Semi-Safe Zones",
            description:
              "Semi-safe zones allow limited hostile actions (bar fights, minor disturbances, arrests) provided they do not escalate or negatively impact others. Examples: Police Station, City Hall, PDM, garages, restaurants, bars, cafes, other player-owned businesses.",
          },
        ],
      },
    ],
  },

  {
    id: "roleplay-guide",
    name: "Roleplay Guide",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "roleplay-guide-sub",
        name: "Roleplay Rules",
        rules: [
          {
            id: "stay-in-character",
            title: "Stay IC",
            description:
              "You must remain in character at all times. RP should only pause if all parties agree or staff requests via Discord ticket.",
          },
          {
            id: "consent-communication",
            title: "Consent & Communication",
            description:
              "Respect player comfort. If issues arise, discuss OOC in Discord (not in-game).",
          },
          {
            id: "ic-conflict",
            title: "IC Conflict = IC Resolution",
            description:
              "Disagreements during RP must be resolved in-character. If a rule was broken, finish the scene IC and submit a report afterwards.",
          },
          {
            id: "staff-intervention",
            title: "Staff Intervention",
            description:
              "Staff will not ask you to break character in-game but may request a pause via Discord if rules are violated.",
          },
          {
            id: "rp-before-bloodshed",
            title: "Roleplay Before Bloodshed",
            description:
              "No RDM or KOS. Violent actions must be preceded by verbal interaction or a clear story build-up; targets must understand the threat before harm occurs.",
          },
        ],
      },
    ],
  },

  {
    id: "rdm-vdm-powergaming-metagaming",
    name: "RDM / VDM / Powergaming / Metagaming",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "rdm-sub",
        name: "Combat RP Rules",
        rules: [
          {
            id: "rdm",
            title: "Random Deathmatch (RDM)",
            description:
              "RDM is intentionally killing or hurting another player or damaging their property without valid IC reason or roleplay justification.",
          },
          {
            id: "vdm",
            title: "Vehicle Deathmatch (VDM)",
            description:
              "VDM is using a vehicle to kill/hurt another player without valid IC justification. Avoid using vehicles as weapons; this may be LQRP.",
          },
          {
            id: "powergaming",
            title: "Powergaming",
            description:
              "Powergaming is forcing unrealistic actions/outcomes, exploiting mechanics, or manipulating RP outcomes (e.g., /me abuse, spamming jump to move faster). It's prohibited.",
          },
          {
            id: "metagaming",
            title: "No Metagaming",
            description:
              "Using out-of-game information (streams, Discord, etc.) to gain an in-game advantage is serious and punished. Accidental metagaming is discouraged.",
          },
        ],
      },
    ],
  },

  {
    id: "nlr-combat-logging",
    name: "NLR & Combat Logging",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "nlr-sub",
        name: "NLR & Combat",
        rules: [
          {
            id: "nlr",
            title: "New Life Rule (NLR)",
            description:
              "After incapacitation/respawn you forget events leading to death. Do not return to the scene for 40 minutes or take hostile action for 90 minutes. Do not respawn while situation is ongoing or EMS en route.",
          },
          {
            id: "combat-logging",
            title: "Combat Logging",
            description:
              "Disconnecting to avoid roleplay, arrest, or death is cheating and prohibited. Examples include logging out during scenarios or using safe zones to escape.",
          },
          {
            id: "combat-storing",
            title: "Combat Storing",
            description:
              "Putting away items involved in a hot situation to avoid loss (e.g., storing illegal items once cops lose sight) is prohibited.",
          },
        ],
      },
    ],
  },

  {
    id: "roleplay-blurring-permadeath",
    name: "RP Blurring & Perma-Death",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "rp-blur-sub",
        name: "RP Blurring",
        rules: [
          {
            id: "roleplay-blurring",
            title: "Roleplay Blurring",
            description:
              "Keep a clear line between IC and OOC. If personal feelings bleed into RP, take a break from the server.",
          },
          {
            id: "perma-death-rule",
            title: "Perma Death",
            description:
              "You cannot force permanent death on others. If you choose permadeath for your character, roleplay it properly with EMS/doctor and use /me to indicate you will not continue that character.",
          },
          {
            id: "character-mixing",
            title: "Character Mixing",
            description:
              "Mixing info or money between characters for advantage is prohibited.",
          },
          {
            id: "force-roleplay",
            title: "Force Roleplay",
            description:
              "Forcing unrealistic actions on others without a chance to evade or choose is forbidden.",
          },
          {
            id: "fear-rp",
            title: "Fear Roleplay / Value of Life",
            description:
              "Roleplay as if your character has one life. Take realistic precautions, comply if outnumbered, and make escape attempts realistic.",
          },
        ],
      },
    ],
  },

  {
    id: "failrp-copbaiting",
    name: "FailRP / Cop Baiting",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "failrp-sub",
        name: "FailRP",
        rules: [
          {
            id: "failrp",
            title: "Fail / LQRP",
            description:
              "Unrealistic/disruptive actions that ruin immersion (e.g., ignoring /me, talking normally while downed, exploiting safe zones) are FailRP and can be punished.",
          },
          {
            id: "copbaiting",
            title: "Cop Baiting",
            description:
              "Deliberately provoking police to force confrontations is prohibited (e.g., causing collisions to start chases).",
          },
          {
            id: "interference",
            title: "No 3rd-Party Interference",
            description:
              "If Group A fights Group B, Group C cannot interfere, except specified exceptions (store owner, gangs within turf).",
          },
        ],
      },
    ],
  },

  {
    id: "criminal-rules",
    name: "Criminal Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "criminal-rules-sub",
        name: "Criminal Rules",
        rules: [
          {
            id: "6-man-rule",
            title: "6-Man Rule",
            description:
              "Criminal activities are limited to a maximum of six participants at a time. Separate scenario rules apply for events like prison transport.",
          },
          {
            id: "friendly-hostages",
            title: "Friendly Hostages",
            description:
              "Friendly hostages are strictly prohibited for any criminal activity.",
          },
          {
            id: "cooldown-periods",
            title: "Cooldown Periods",
            description:
              "Shooting cooldown: 90 minutes between any shootout. Store Robberies: 45 min | Fleeca: 120 min | High-Value: 180 min. Respect cooldowns and leave the area for at least 5 minutes before returning.",
          },
          {
            id: "robbery-planning",
            title: "Robbery Planning",
            description:
              "Participants must have a planned robbery. Evading police by merely driving is not acceptable. No outside assistance (lookouts/radio/info sharing).",
          },
          {
            id: "house-robbery",
            title: "House Robbery Rules",
            description: "Participants: 2 to 4 players. Backpack required.",
          },
          {
            id: "store-robbery",
            title: "Store Robbery Rules",
            description:
              "Participants: 2 to 4 players. Hostages allowed: max 1. Backpack required. Do not kidnap AFK players.",
          },
          {
            id: "fleeca-robbery",
            title: "Fleeca Bank Rules",
            description:
              "Participants: 4 to 6 players. Hostages allowed: max 1. Backpack required. Do not kidnap AFK players.",
          },
          {
            id: "vangelico",
            title: "Vangelico Jewelry Robbery",
            description:
              "Participants: 4 to 6 players. Hostages allowed: max 1. Backpack required. Do not kidnap AFK players.",
          },
          {
            id: "pacific",
            title: "Pacific Bank Robbery",
            description:
              "Participants: minimum 4, maximum 6. Escape vehicles: 2. Hostages allowed: max 2. Backpack required. Do not kidnap AFK players.",
          },
          {
            id: "loot-rules",
            title: "Loot & Interference Rules",
            description:
              "No chain robberies. No outside assistance or coordinating separate criminal groups in overlapping objectives. Camping or staking areas for crimes is not allowed.",
          },
          {
            id: "mechanics-limit",
            title: "Mechanics & Job Restrictions",
            description:
              "Mechanics cannot use F1 menu or job-specific abilities during criminal activities. Criminals cannot rob other players at spawn/teleport locations.",
          },
        ],
      },
    ],
  },

  {
    id: "scenario-rules",
    name: "Scenario Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "scenario-sub",
        name: "Scenario Rules",
        rules: [
          {
            id: "interference-hostage",
            title: "Interference & Hostage Rules",
            description:
              "Interfering in ongoing robberies is not allowed except specified exceptions. Fake hostages are strictly prohibited.",
          },
          {
            id: "police-respect",
            title: "Respect for Law Enforcement",
            description:
              "Show IC respect and fear for police. Robbing police should not yield police-only items or money.",
          },
          {
            id: "money-exploits",
            title: "Money Exploits",
            description:
              "Exploits or middlemen schemes to double/transfer money between characters are banned.",
          },
        ],
      },
    ],
  },

  {
    id: "server-restart",
    name: "Server Restart Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "restart-sub",
        name: "Restart Rules",
        rules: [
          {
            id: "restart-ban-criminal",
            title: "No Criminal Activity Around Restarts",
            description:
              "No criminal activity 30 minutes before and 30 minutes after server restart. After an unscheduled crash/restart, wait 15 minutes before resuming criminal activity.",
          },
        ],
      },
    ],
  },

  {
    id: "shooting-cooldown",
    name: "Shooting Cooldown",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "shooting-sub",
        name: "Shooting Cooldown",
        rules: [
          {
            id: "shooting-cooldown-rule",
            title: "Shooting Cooldown",
            description:
              "There is a 90-minute cooldown between any form of shootout, regardless of scenario type.",
          },
        ],
      },
    ],
  },

  {
    id: "torture-rp",
    name: "Torture RP Rules",
    color: "from-purple-700/20 to-purple-700/10",
    borderColor: "border-purple-700/30",
    accentColor: "purple",
    subcategories: [
      {
        id: "torture-sub",
        name: "Torture RP",
        rules: [
          {
            id: "torture-rp-overview",
            title: "Torture RP - Overview & Requirements",
            description:
              "Torture RP is a sensitive element allowed only in interrogation scenarios to extract critical information (names of accomplices, item locations, plans). It must be concise, targeted, and not prolonged.",
          },
          {
            id: "torture-consent",
            title: "Consent & Awareness",
            description:
              "Torture RP must be clearly communicated OOC. The player being tortured must provide OOC consent before proceeding. If they express discomfort, the RP must be adjusted or stopped immediately.",
          },
          {
            id: "torture-methods",
            title: "Allowed Methods",
            description:
              "Allowed methods include non-lethal physical harm (slaps, punches) and psychological or verbal intimidation. Sparing non-lethal gunfire near feet/hands may be allowed but with no permanent injury or death.",
          },
          {
            id: "torture-rp-focus",
            title: "RP Focus",
            description:
              "Torture RP must be concise, targeted toward a specific RP goal, and not unnecessarily prolonged.",
          },
        ],
      },
    ],
  },
]

  const getAllRules = () => {
    const allRules: Array<{
      id: string
      title: string
      description: string
      categoryId: string
      categoryName: string
      subcategoryName: string
    }> = []

    ruleCategories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.rules.forEach((rule) => {
          allRules.push({
            ...rule,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryName: subcategory.name,
          })
        })
      })
    })

    return allRules
  }

  const allRules = getAllRules()

  const handleRuleClick = (ruleId: string) => {
    setSelectedRule(ruleId)
    const element = ruleRefs.current[ruleId]

    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 150

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })

      // Highlight the rule briefly
      gsap.to(element, {
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      })
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30, blur: 10 },
        {
          opacity: 1,
          y: 0,
          blur: 0,
          duration: 1,
          ease: "power3.out",
        },
      )

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -100, skewY: 10 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center+=100",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          x: 0,
          skewY: 0,
          duration: 1,
          ease: "power3.out",
        },
      )

      gsap.fromTo(
        categoryRef.current,
        { opacity: 0, x: -50 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center+=150",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power2.out",
        },
      )

      gsap.fromTo(
        rulesContainerRef.current,
        { opacity: 0, x: 50 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center+=150",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power2.out",
        },
      )

      Object.values(ruleRefs.current).forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.05,
              ease: "back.out",
            },
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        Object.values(ruleRefs.current).forEach((card, index) => {
          if (card) {
            gsap.fromTo(
              card,
              { opacity: 0, y: 30, scale: 0.9 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.05,
                ease: "back.out",
              },
            )
          }
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [allRules])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div
        ref={headerRef}
        className="pt-32 pb-16 px-4 bg-gradient-to-b from-purple-700/10 to-transparent border-b border-purple-700/20"
      >
        <div className="max-w-8xl mx-auto text-center">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 leading-tight tracking-tighter"
          >
            SERVER RULES
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last updated: November 22, 2025</span>
          </div>
        </div>
      </div>

      <div ref={sectionRef} className="relative py-20 px-10 overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-700/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div ref={categoryRef} className="lg:col-span-1">
              <div className="lg:sticky h-fit space-y-3">
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-md border border-purple-700/30 rounded-2xl p-6 shadow-lg shadow-purple-900/10">
                  <h2 className="text-base font-bold text-purple-400 mb-6 tracking-widest uppercase">ALL RULES</h2>
                 <div className="
  space-y-2 
  max-h-[600px] 
  overflow-y-auto 
  pr-2 
  scrollbar-thin 
  scrollbar-track-transparent 
  scrollbar-thumb-purple-700/40 
  hover:scrollbar-thumb-purple-500/50
">

                    {ruleCategories.map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category.id ? "" : category.id)}
                          className={`w-full relative px-4 py-2.5 rounded-lg font-medium text-xs transition-all duration-300 overflow-hidden group ${
                            expandedCategory === category.id
                              ? "text-purple-300 bg-purple-500/10 border border-purple-500/50"
                              : "text-gray-400 hover:text-gray-300 border border-transparent hover:bg-white/5"
                          }`}
                        >
                          <span className="relative flex items-center gap-2 z-10">
                            <span
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                expandedCategory === category.id ? "bg-purple-400" : "bg-gray-600"
                              }`}
                            />
                            <span className="flex-1 text-left">{category.name}</span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                expandedCategory === category.id ? "rotate-180" : ""
                              }`}
                            />
                          </span>
                        </button>

                        {expandedCategory === category.id && (
                          <div className="ml-4 mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="space-y-1">
                                <p className="text-gray-600 text-xs font-semibold px-3 py-1">{subcategory.name}</p>
                                {subcategory.rules.map((rule) => (
                                  <button
                                    key={rule.id}
                                    onClick={() => handleRuleClick(rule.id)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-300 ${
                                      selectedRule === rule.id
                                        ? "text-purple-300 bg-purple-500/20 border border-purple-500/60"
                                        : "text-gray-500 hover:text-gray-400 border border-transparent hover:bg-white/5"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-1 h-1 rounded-full transition-all ${
                                          selectedRule === rule.id ? "bg-purple-400" : "bg-gray-600"
                                        }`}
                                      />
                                      {rule.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div ref={rulesContainerRef} className="lg:col-span-3">
              <div className="space-y-12">
                {ruleCategories.map((category) => (
                  <div key={category.id} className="space-y-6">
                    <div className="space-y-2 sticky backdrop-blur-md py-4 z-5">
                      <h2 className="text-3xl font-bold text-purple-400">{category.name}</h2>
                      <p className="text-gray-400 text-sm">All rules for {category.name}</p>
                    </div>

                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-3">
                        <h3 className="text-lg font-semibold text-purple-300 ml-2">{subcategory.name}</h3>
                        {subcategory.rules.map((rule, idx) => (
                          <div
                            key={rule.id}
                            ref={(el) => (ruleRefs.current[rule.id] = el)}
                            id={rule.id}
                            className="group relative p-5 rounded-xl backdrop-blur-md border border-gray-700/40 bg-gradient-to-br from-gray-900/30 to-gray-800/20 transition-all duration-300 hover:border-purple-500/40 hover:bg-gradient-to-br hover:from-gray-900/40 hover:to-gray-800/30 shadow-lg shadow-black/20 hover:shadow-purple-600/10 overflow-hidden cursor-pointer"
                            onClick={() => handleRuleClick(rule.id)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/0 to-purple-600/0 group-hover:via-purple-500/5 transition-all duration-300 pointer-events-none" />

                            <div className="relative z-10 flex items-start gap-4">
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-purple-600/40 to-purple-700/20 border border-purple-500/60 text-purple-300 group-hover:from-purple-600/60 group-hover:to-purple-700/40 group-hover:border-purple-400/80 transition-all">
                                {idx + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                  {rule.title}
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors">
                                  {rule.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
