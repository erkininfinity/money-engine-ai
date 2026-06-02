"use client";

import React, { useState, useEffect } from "react";
import { BadgeInput } from "@/components/BadgeInput";
import { FounderProfileLite } from "@/lib/schemas/profile";
import { GeneratedPath } from "@/lib/schemas/path-generation";
import { OfferDraft } from "@/lib/schemas/offer";
import { RevenueSprint, SprintMetrics } from "@/lib/schemas/sprint";
import { WeeklyReview } from "@/lib/schemas/review";
import { playbookCategorySchema, RevenuePlaybook } from "@/lib/schemas/playbook";
import { generateICS } from "@/lib/exporters/calendar";
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Copy, 
  Download, 
  AlertTriangle, 
  Clock, 
  Briefcase,
  Layers,
  ShieldAlert,
  Users,
  CheckSquare,
  TrendingUp,
  BarChart2,
  Play,
  RotateCcw,
  BookOpen,
  Search,
  Check,
  CheckSquare as CheckedIcon,
  Calendar,
  Send,
  Flame
} from "lucide-react";

// Default Profile state
const initialProfile: FounderProfileLite = {
  location: "Astana, Kazakhstan",
  language: "ru",
  targetMonthlyIncome: 300000,
  currency: "KZT",
  skills: ["Make.com / Integromat automation", "n8n workflows"],
  pastExperience: ["built several personal automations"],
  availableHoursPerWeek: 12,
  startupBudgetLevel: "low",
  audienceAccess: ["Warm contacts of 10 local service owners"],
  salesComfortLevel: "medium",
  preferredWorkType: "automation",
  constraints: ["Cannot work during 9-5 working hours"]
};

// Default Metrics state
const initialMetrics: SprintMetrics = {
  prospectsListed: 15,
  messagesSent: 15,
  replies: 4,
  callsBooked: 2,
  callsCompleted: 2,
  offersSent: 1,
  paymentsReceived: 0,
  revenueAmount: 0,
  bestReplySource: "",
  biggestBlocker: "",
  notes: ""
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"generator" | "active_sprint" | "library" | "workspace" | "market_research">("generator");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profile, setProfile] = useState<FounderProfileLite>(initialProfile);
  
  // Market Research states
  const [researchNiche, setResearchNiche] = useState<string>("WhatsApp automation");
  const [researchLocation, setResearchLocation] = useState<string>("Astana, Kazakhstan");
  const [researchReport, setResearchReport] = useState<any | null>(null);
  const [researchLoading, setResearchLoading] = useState<boolean>(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Data states
  const [paths, setPaths] = useState<GeneratedPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<GeneratedPath | null>(null);
  const [offer, setOffer] = useState<OfferDraft | null>(null);
  const [sprint, setSprint] = useState<RevenueSprint | null>(null);
  
  // Playbook Library state
  const [playbooks, setPlaybooks] = useState<RevenuePlaybook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [detailPlaybook, setDetailPlaybook] = useState<RevenuePlaybook | null>(null);

  // Active tracker states
  const [activeSprint, setActiveSprint] = useState<RevenueSprint | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  
  // Metrics form
  const [metrics, setMetrics] = useState<SprintMetrics>(initialMetrics);
  const [userNotes, setUserNotes] = useState("");
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);

  // Copy to clipboard status
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }).catch((e) => {
        console.error("Failed to copy text: ", e);
      });
    }
  };

  // Workspace and Projects state
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [prospectsList, setProspectsList] = useState<any[]>([]);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  
  // New prospect form state
  const [newProspectName, setNewProspectName] = useState("");
  const [newProspectContact, setNewProspectContact] = useState("");
  const [newProspectStatus, setNewProspectStatus] = useState<string>("identified");
  const [newProspectNotes, setNewProspectNotes] = useState("");

  // Integrations & Gamification state
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [streakCount, setStreakCount] = useState<number>(0);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [showStreakFlame, setShowStreakFlame] = useState<boolean>(false);

  // Growth Mode states
  const [workspaceMode, setWorkspaceMode] = useState<"mvp" | "growth">("mvp");
  const [selectedCaseStudyProspect, setSelectedCaseStudyProspect] = useState<any | null>(null);
  const [caseStudyMarkdown, setCaseStudyMarkdown] = useState<string>("");
  const [isGeneratingCaseStudy, setIsGeneratingCaseStudy] = useState(false);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);

  const [retainersData, setRetainersData] = useState<any | null>(null);
  const [isGeneratingRetainers, setIsGeneratingRetainers] = useState(false);
  const [showRetainersModal, setShowRetainersModal] = useState(false);

  // Load projects from DB
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) {
        setProjectsList(data.projects);
        if (data.projects.length > 0) {
          const savedProjId = localStorage.getItem("money_engine_active_project_id");
          const found = data.projects.find((p: any) => p.id === savedProjId);
          if (found) {
            setActiveProject(found);
          } else {
            setActiveProject(data.projects[0]);
            localStorage.setItem("money_engine_active_project_id", data.projects[0].id);
          }
        } else {
          await handleCreateDefaultProject();
        }
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  };

  const handleCreateDefaultProject = async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.language === "ru" ? "Мой первый B2B Проект" : "My First B2B Project",
          description: profile.language === "ru" ? "По умолчанию созданный проект для трекинга" : "Default created project for tracking"
        })
      });
      const newProj = await res.json();
      if (newProj && newProj.id) {
        setProjectsList([newProj]);
        setActiveProject(newProj);
        localStorage.setItem("money_engine_active_project_id", newProj.id);
      }
    } catch (e) {
      console.error("Error creating default project:", e);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc
        })
      });
      const newProj = await res.json();
      if (newProj && newProj.id) {
        const updatedList = [newProj, ...projectsList];
        setProjectsList(updatedList);
        setActiveProject(newProj);
        localStorage.setItem("money_engine_active_project_id", newProj.id);
        setNewProjectName("");
        setNewProjectDesc("");
        setShowCreateProjectModal(false);
      }
    } catch (e) {
      console.error(e);
      alert("Error creating project");
    }
  };

  const fetchProspects = async (projectId: string) => {
    try {
      const res = await fetch(`/api/prospects?projectId=${projectId}`);
      const data = await res.json();
      if (data.prospects) {
        setProspectsList(data.prospects);
      }
    } catch (e) {
      console.error("Error loading prospects:", e);
    }
  };

  useEffect(() => {
    fetchProjects();
    const savedMode = localStorage.getItem("money_engine_workspace_mode") as "mvp" | "growth";
    if (savedMode) {
      setWorkspaceMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (activeProject?.id) {
      fetchProspects(activeProject.id);
      localStorage.setItem("money_engine_active_project_id", activeProject.id);
    }
  }, [activeProject]);

  const handleToggleWorkspaceMode = (mode: "mvp" | "growth") => {
    setWorkspaceMode(mode);
    localStorage.setItem("money_engine_workspace_mode", mode);
  };

  const handleGenerateCaseStudy = async (prospect: any) => {
    setSelectedCaseStudyProspect(prospect);
    setCaseStudyMarkdown("");
    setIsGeneratingCaseStudy(true);
    setShowCaseStudyModal(true);

    try {
      const res = await fetch("/api/generate-case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          projectName: activeProject?.name || "",
          projectDescription: activeProject?.description || "",
          offerName: activeSprint?.offer?.name || "",
          offerPrice: activeSprint?.offer?.priceRange || "",
          prospectName: prospect.name,
          prospectNotes: prospect.notes || "",
        }),
      });
      const data = await res.json();
      if (data.markdown) {
        setCaseStudyMarkdown(data.markdown);
      } else {
        setCaseStudyMarkdown(profile.language === "ru" ? "Ошибка при генерации кейса." : "Failed to generate case study.");
      }
    } catch (e) {
      console.error(e);
      setCaseStudyMarkdown(profile.language === "ru" ? "Ошибка при соединении с сервером." : "Network error generating case study.");
    } finally {
      setIsGeneratingCaseStudy(false);
    }
  };

  const handleGenerateRetainers = async () => {
    setRetainersData(null);
    setIsGeneratingRetainers(true);
    setShowRetainersModal(true);

    try {
      const res = await fetch("/api/generate-growth-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          projectName: activeProject?.name || "",
          projectDescription: activeProject?.description || "",
          oneTimeOfferName: activeSprint?.offer?.name || "",
          oneTimeOfferPrice: activeSprint?.offer?.priceRange || "",
        }),
      });
      const data = await res.json();
      if (data.retainers) {
        setRetainersData(data);
      } else {
        alert(profile.language === "ru" ? "Не удалось сгенерировать подписки." : "Failed to generate retainers.");
      }
    } catch (e) {
      console.error(e);
      alert(profile.language === "ru" ? "Ошибка при подключении к серверу." : "Network error generating retainers.");
    } finally {
      setIsGeneratingRetainers(false);
    }
  };

  const handleAddProspect = async () => {
    if (!activeProject?.id || !newProspectName.trim() || !newProspectContact.trim()) return;
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          sprintId: activeSprint?.id || null,
          name: newProspectName,
          contactInfo: newProspectContact,
          status: newProspectStatus,
          notes: newProspectNotes
        })
      });
      const data = await res.json();
      if (data && data.id) {
        setProspectsList([data, ...prospectsList]);
        setNewProspectName("");
        setNewProspectContact("");
        setNewProspectNotes("");
        setNewProspectStatus("identified");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding prospect");
    }
  };

  const handleUpdateProspectStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setProspectsList(prospectsList.map(p => p.id === id ? { ...p, status: newStatus, updatedAt: Date.now() } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProspectNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes })
      });
      if (res.ok) {
        setProspectsList(prospectsList.map(p => p.id === id ? { ...p, notes, updatedAt: Date.now() } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProspectObjection = async (id: string, objection: string) => {
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, objection })
      });
      if (res.ok) {
        setProspectsList(prospectsList.map(p => p.id === id ? { ...p, objection, updatedAt: Date.now() } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProspect = async (id: string) => {
    if (!confirm(profile.language === "ru" ? "Удалить этого клиента?" : "Delete this prospect?")) return;
    try {
      const res = await fetch(`/api/prospects?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProspectsList(prospectsList.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject?.id) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const parsedProspects = [];

      const startIdx = lines[0].toLowerCase().includes("name") ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = [];
        let current = "";
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            parts.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        if (parts.length >= 2) {
          parsedProspects.push({
            name: parts[0].replace(/^"|"$/g, ""),
            contactInfo: parts[1].replace(/^"|"$/g, ""),
            status: parts[2] ? parts[2].replace(/^"|"$/g, "") : "identified",
            notes: parts[3] ? parts[3].replace(/^"|"$/g, "") : "",
            objection: parts[4] ? parts[4].replace(/^"|"$/g, "") : ""
          });
        }
      }

      if (parsedProspects.length === 0) {
        alert(profile.language === "ru" ? "Не найдено корректных строк" : "No valid rows found");
        return;
      }

      try {
        const res = await fetch("/api/prospects/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: activeProject.id,
            prospectsList: parsedProspects
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchProspects(activeProject.id);
          alert(profile.language === "ru" ? `Успешно импортировано: ${data.count}` : `Successfully imported: ${data.count}`);
        } else {
          alert("Import failed");
        }
      } catch (err) {
        console.error(err);
        alert("Error during import");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getCalculatedMetrics = () => {
    const listed = prospectsList.length;
    const sent = prospectsList.filter(p => p.status !== "identified").length;
    const replies = prospectsList.filter(p => !["identified", "contacted"].includes(p.status)).length;
    const booked = prospectsList.filter(p => ["meeting_booked", "offer_sent", "paid"].includes(p.status)).length;
    const completed = prospectsList.filter(p => ["offer_sent", "paid"].includes(p.status)).length;
    const offers = prospectsList.filter(p => ["offer_sent", "paid"].includes(p.status)).length;
    const payments = prospectsList.filter(p => p.status === "paid").length;
    
    let revenue = 0;
    if (activeSprint?.offer?.priceRange) {
      const match = activeSprint.offer.priceRange.match(/(\d+)/);
      if (match) {
        const unitPrice = parseInt(match[0], 10);
        revenue = payments * unitPrice;
      }
    }

    return {
      prospectsListed: listed,
      messagesSent: sent,
      replies: replies,
      callsBooked: booked,
      callsCompleted: completed,
      offersSent: offers,
      paymentsReceived: payments,
      revenueAmount: revenue,
      bestReplySource: "",
      biggestBlocker: "",
      notes: ""
    };
  };

  // Load state from localStorage on mount
  useEffect(() => {
    // Profile
    const savedProfile = localStorage.getItem("money_engine_profile");
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    // Active Sprint
    const savedActiveSprint = localStorage.getItem("money_engine_active_sprint");
    if (savedActiveSprint) {
      try {
        const parsed = JSON.parse(savedActiveSprint);
        setActiveSprint(parsed);
        setActiveTab("active_sprint");
      } catch (e) {
        console.error(e);
      }
    }

    // Checked Actions
    const savedCheckedActions = localStorage.getItem("money_engine_checked_actions");
    if (savedCheckedActions) {
      try { setCheckedActions(JSON.parse(savedCheckedActions)); } catch (e) { console.error(e); }
    }

    // Weekly Review
    const savedReview = localStorage.getItem("money_engine_weekly_review");
    if (savedReview) {
      try { setWeeklyReview(JSON.parse(savedReview)); } catch (e) { console.error(e); }
    }

    // Webhook Url
    const savedWebhook = localStorage.getItem("money_engine_webhook_url");
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }

    // Streak Count
    const savedStreak = localStorage.getItem("money_engine_streak_count");
    if (savedStreak) {
      setStreakCount(parseInt(savedStreak, 10) || 0);
    }

    // Completed Days
    const savedCompletedDays = localStorage.getItem("money_engine_completed_days");
    if (savedCompletedDays) {
      try { setCompletedDays(JSON.parse(savedCompletedDays)); } catch (e) { console.error(e); }
    }
  }, []);

  // Fetch Playbook Library on mount
  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const res = await fetch("/api/playbooks");
        const data = await res.json();
        if (data.playbooks) {
          setPlaybooks(data.playbooks);
        }
      } catch (e) {
        console.error("Error loading playbooks library:", e);
      }
    };
    fetchPlaybooks();
  }, []);

  const updateProfile = (newProfile: FounderProfileLite) => {
    setProfile(newProfile);
    localStorage.setItem("money_engine_profile", JSON.stringify(newProfile));
  };

  const handleGeneratePaths = async () => {
    setLoading(true);
    setLoadingMessage(profile.language === "ru" ? "ИИ подбирает playbooks и рассчитывает Fit Score..." : "AI matching playbooks and scoring fit...");
    
    try {
      const response = await fetch("/api/generate-paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, mode: workspaceMode })
      });
      const data = await response.json();
      if (data.paths) {
        const sortedPaths = [...data.paths].sort((a, b) => b.score.total - a.score.total);
        setPaths(sortedPaths);
        setStep(2);
      } else {
        alert("Failed to generate paths. Please check your API key.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating paths.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPath = async (pathItem: GeneratedPath) => {
    setSelectedPath(pathItem);
    setLoading(true);
    setLoadingMessage(profile.language === "ru" ? "Формируем оффер по формуле боли и результата..." : "Drafting offer based on pain and outcome...");
    
    try {
      const response = await fetch("/api/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, selectedPath: pathItem })
      });
      const data = await response.json();
      if (data && data.name) {
        setOffer(data);
        setStep(3);
      } else {
        alert("Failed to generate offer.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating offer.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSprint = async () => {
    if (!selectedPath || !offer) return;
    setLoading(true);
    setLoadingMessage(profile.language === "ru" ? "ИИ строит 7-дневный спринт и аутрич-скрипты..." : "AI building 7-day schedule and outreach...");
    
    try {
      const response = await fetch("/api/generate-sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, selectedPath, offer, mode: workspaceMode })
      });
      const data = await response.json();
      if (data && data.title) {
        setSprint(data);
        setStep(4);
      } else {
        alert("Failed to generate sprint.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating sprint.");
    } finally {
      setLoading(false);
    }
  };

  // Skip wizard and use a playbook directly
  const handleUsePlaybookDirectly = (pb: RevenuePlaybook) => {
    // Create a simulated GeneratedPath
    const simulatedPath: GeneratedPath = {
      id: pb.id,
      name: pb.name,
      category: pb.category,
      targetCustomers: pb.targetCustomers,
      pain: pb.painfulProblem,
      firstOfferExample: pb.firstOffer.promise,
      score: {
        total: 100,
        speedToFirstRevenue: pb.speedToFirstRevenue === "fast" ? 10 : pb.speedToFirstRevenue === "medium" ? 7 : 4,
        abilityToReachBuyers: pb.trustRequired === "low" ? 10 : pb.trustRequired === "medium" ? 7 : 4,
        founderFit: 10,
        painUrgency: 8,
        lowStartupCost: pb.startupCostLevel === "none" ? 10 : pb.startupCostLevel === "low" ? 7 : 4,
        executionSimplicity: pb.executionDifficulty === "low" ? 10 : pb.executionDifficulty === "medium" ? 7 : 4,
        whyThisScore: ["Loaded directly from the verified playbook library."],
        biggestRisk: pb.risks[0] || "None specified.",
        fastestValidationStep: pb.firstOffer.callToAction
      },
      risks: pb.risks,
      firstChannels: pb.firstChannels,
      nextSteps: pb.improvements
    };

    // Create OfferDraft
    const initialOfferDraft: OfferDraft = {
      name: pb.firstOffer.name,
      targetCustomer: pb.targetCustomers[0] || "B2B Clients",
      painfulProblem: pb.painfulProblem,
      promisedOutcome: pb.promisedOutcome,
      timeframe: "7 Days",
      mechanism: pb.requiredSkills.join(", "),
      deliverables: pb.firstOffer.deliverables,
      exclusions: pb.firstOffer.exclusions,
      priceRange: `${pb.priceRange.min || 49000}-${pb.priceRange.max || 99000} ${pb.priceRange.currency}`,
      proofNeeded: pb.risks.slice(0, 2),
      trustBuilders: pb.improvements.slice(0, 2),
      objections: pb.antiPatterns.slice(0, 2),
      callToAction: pb.firstOffer.callToAction
    };

    // Create Sprint Plan directly from Playbook to support token-free offline use
    const initialSprintDraft: RevenueSprint = {
      id: pb.id,
      title: pb.name,
      goal: pb.first7DaySprint.goal,
      hypothesis: pb.promisedOutcome,
      offer: initialOfferDraft,
      targetAudience: pb.targetCustomers.join(", "),
      channelPlan: {
        primaryChannel: pb.firstChannels[0] || "Outreach",
        secondaryChannel: pb.firstChannels[1],
        whyThisChannel: `Pre-configured channel strategy for ${pb.name}`,
        firstProspectListInstructions: [
          "Search local directories and LinkedIn to locate targets",
          "Identify 15 decision makers",
          "Log links in active spreadsheet"
        ],
        dailyOutreachLimit: 10,
        personalizationRules: ["Address the owner by name", "Offer the specific diagnostic CTA"],
        complianceNotes: ["Do not spam", "Respect opt-out requests"]
      },
      dailyActions: pb.first7DaySprint.dailyActions.map(day => ({
        day: day.day,
        objective: day.objective,
        actions: day.actions,
        expectedOutput: `Output for day ${day.day}`,
        timeEstimateMinutes: 90
      })),
      outreachMessages: (pb.exampleMessages || []).map((msg, i) => ({
        type: "cold_personal",
        label: `Script variant ${i + 1}`,
        content: msg,
        instructions: pb.firstOffer.callToAction
      })),
      reviewQuestions: pb.reviewQuestions,
      nextExperimentOptions: pb.improvements
    };

    setSelectedPath(simulatedPath);
    setOffer(initialOfferDraft);
    setSprint(initialSprintDraft);
    setDetailPlaybook(null);
    setStep(3); // Go straight to Offer Editor
    setActiveTab("generator");
  };

  const handleStartSprint = () => {
    if (!sprint) return;
    setActiveSprint(sprint);
    setCheckedActions({});
    setWeeklyReview(null);
    setSelectedDayTab(1);
    
    localStorage.setItem("money_engine_active_sprint", JSON.stringify(sprint));
    localStorage.setItem("money_engine_checked_actions", JSON.stringify({}));
    localStorage.removeItem("money_engine_weekly_review");
    
    setActiveTab("active_sprint");
  };

  const updateStreakStatus = (newChecked: Record<string, boolean>, currentSprint: RevenueSprint | null) => {
    if (!currentSprint) return;
    
    let newCompletedDays = [...completedDays];
    let newStreak = streakCount;
    let triggeredAnimation = false;

    currentSprint.dailyActions.forEach((day) => {
      const dayKey = `${currentSprint.id || "sprint"}-${day.day}`;
      const allDone = day.actions.length > 0 && day.actions.every((_, idx) => newChecked[`${day.day}-${idx}`]);
      const alreadyCompleted = newCompletedDays.includes(dayKey);

      if (allDone && !alreadyCompleted) {
        newCompletedDays.push(dayKey);
        newStreak += 1;
        triggeredAnimation = true;
      } else if (!allDone && alreadyCompleted) {
        newCompletedDays = newCompletedDays.filter(k => k !== dayKey);
        newStreak = Math.max(0, newStreak - 1);
      }
    });

    if (newStreak !== streakCount) {
      setStreakCount(newStreak);
      localStorage.setItem("money_engine_streak_count", String(newStreak));
    }
    
    if (JSON.stringify(newCompletedDays) !== JSON.stringify(completedDays)) {
      setCompletedDays(newCompletedDays);
      localStorage.setItem("money_engine_completed_days", JSON.stringify(newCompletedDays));
    }

    if (triggeredAnimation) {
      setShowStreakFlame(true);
      setTimeout(() => setShowStreakFlame(false), 4000);
    }
  };

  const handleActionToggle = (day: number, actionIdx: number) => {
    const key = `${day}-${actionIdx}`;
    const newChecked = { ...checkedActions, [key]: !checkedActions[key] };
    setCheckedActions(newChecked);
    localStorage.setItem("money_engine_checked_actions", JSON.stringify(newChecked));
    updateStreakStatus(newChecked, activeSprint);
  };

  const handleUpdateWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem("money_engine_webhook_url", url);
  };

  const handleTriggerWebhook = async () => {
    if (!activeSprint) return;
    if (!webhookUrl) {
      alert(profile.language === "ru" 
        ? "Пожалуйста, сначала настройте Webhook URL в Рабочей области (Workspace)." 
        : "Please configure a Webhook URL in the Workspace tab first.");
      return;
    }

    const currentDay = activeSprint.dailyActions.find(d => d.day === selectedDayTab);
    if (!currentDay) return;

    const payload = {
      sprintId: activeSprint.id,
      sprintTitle: activeSprint.title,
      day: currentDay.day,
      objective: currentDay.objective,
      expectedOutput: currentDay.expectedOutput,
      timeEstimateMinutes: currentDay.timeEstimateMinutes,
      actions: currentDay.actions.map((action, idx) => ({
        text: action,
        completed: !!checkedActions[`${currentDay.day}-${idx}`]
      }))
    };

    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl, payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to trigger webhook");
      }

      alert(profile.language === "ru" 
        ? "Задачи дня успешно отправлены!" 
        : "Daily tasks sent successfully!");
    } catch (e: any) {
      console.error(e);
      alert((profile.language === "ru" ? "Ошибка при отправке вебхука: " : "Webhook error: ") + e.message);
    }
  };

  const handleAnalyzeMarket = async () => {
    if (!researchNiche || !researchLocation) return;
    setResearchLoading(true);
    try {
      const res = await fetch("/api/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: researchNiche,
          location: researchLocation,
          language: profile.language
        })
      });
      const data = await res.json();
      if (data && data.averagePriceRange) {
        setResearchReport(data);
      } else {
        alert(profile.language === "ru" 
          ? "Не удалось сгенерировать отчет. Попробуйте еще раз." 
          : "Failed to generate market research. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert(profile.language === "ru" ? "Ошибка при анализе рынка." : "Error analyzing market.");
    } finally {
      setResearchLoading(false);
    }
  };

  const handleApplyResearch = () => {
    if (!researchReport) return;
    
    const notesText = `[Niche: ${researchReport.niche} in ${researchReport.location}] ` +
      `Price range: ${researchReport.averagePriceRange}. ` +
      `Competitors: ${researchReport.competitorAnalysis} ` +
      `Outreach Norms: ${researchReport.outreachNorms} ` +
      `Objections: ${researchReport.objections.join("; ")}`;
      
    const updated = {
      ...profile,
      marketResearchNotes: notesText,
      skills: profile.skills.includes(researchReport.niche) 
        ? profile.skills 
        : [...profile.skills, researchReport.niche]
    };
    
    updateProfile(updated);
    
    alert(profile.language === "ru"
      ? "Исследования успешно сохранены и применены к профилю основателя!"
      : "Research notes applied to your founder profile!");
      
    setActiveTab("generator");
  };

  const calculateSprintProgress = () => {
    if (!activeSprint) return 0;
    let totalActions = 0;
    let completedCount = 0;
    activeSprint.dailyActions.forEach((day) => {
      day.actions.forEach((_, idx) => {
        totalActions++;
        if (checkedActions[`${day.day}-${idx}`]) {
          completedCount++;
        }
      });
    });
    return totalActions === 0 ? 0 : Math.round((completedCount / totalActions) * 100);
  };

  const handleSubmitMetrics = async () => {
    if (!activeSprint) return;
    setLoading(true);
    setLoadingMessage(profile.language === "ru" ? "Анализируем метрики и выявляем бутылочные горлышки..." : "Analyzing metrics and identifying bottlenecks...");
    
    try {
      const response = await fetch("/api/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprint: activeSprint, metrics, userNotes })
      });
      const data = await response.json();
      if (data && data.summary) {
        setWeeklyReview(data);
        localStorage.setItem("money_engine_weekly_review", JSON.stringify(data));
        setShowMetricsModal(false);
      } else {
        alert("Failed to analyze metrics.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating weekly review.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSprint = () => {
    if (confirm(profile.language === "ru" ? "Вы уверены, что хотите завершить текущий спринт и начать сначала?" : "Are you sure you want to end this sprint and start fresh?")) {
      setActiveSprint(null);
      setWeeklyReview(null);
      setCheckedActions({});
      
      localStorage.removeItem("money_engine_active_sprint");
      localStorage.removeItem("money_engine_checked_actions");
      localStorage.removeItem("money_engine_weekly_review");
      
      setStep(1);
      setActiveTab("generator");
    }
  };

  const handleExportReviewMarkdown = () => {
    if (!weeklyReview || !activeSprint) return;

    const lines = [
      `# Отчет по еженедельному разбору спринта: ${activeSprint.title}`,
      `\n## 📊 Результаты воронки (Actual Metrics)`,
      `* Список потенциальных клиентов: ${metrics.prospectsListed}`,
      `* Отправлено сообщений: ${metrics.messagesSent}`,
      `* Получено ответов: ${metrics.replies}`,
      `* Забронировано созвонов: ${metrics.callsBooked}`,
      `* Проведено созвонов: ${metrics.callsCompleted}`,
      `* Выставлено предложений: ${metrics.offersSent}`,
      `* Оплат: ${metrics.paymentsReceived}`,
      `* Выручка: ${metrics.revenueAmount} ${activeSprint.offer.priceRange.includes("KZT") ? "KZT" : ""}`,
      `\n## 🛑 Главное бутылочное горлышко (Bottleneck)`,
      `**BOTTLENECK:** ${weeklyReview.bottleneck.toUpperCase()}`,
      `\n### Описание:`,
      weeklyReview.summary,
      `\n### Доказательства (Evidence):`,
      weeklyReview.evidence.map(e => `* ${e}`).join("\n"),
      `\n## 👍 Что сработало хорошо`,
      weeklyReview.whatWorked.map(w => `* ${w}`).join("\n"),
      `\n## 👎 Что пошло не так`,
      weeklyReview.whatDidNotWork.map(d => `* ${d}`).join("\n"),
      `\n## 💡 Главная рекомендация`,
      weeklyReview.recommendation,
      `\n## 🔄 План на следующий спринт`,
      `### Оставить (Keep):`,
      weeklyReview.nextSprint.keep.map(k => `* ${k}`).join("\n"),
      `\n### Изменить (Change):`,
      weeklyReview.nextSprint.change.map(c => `* ${c}`).join("\n"),
      `\n### Протестировать (Test):`,
      weeklyReview.nextSprint.test.map(t => `* ${t}`).join("\n"),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weekly-review-${activeSprint.id || "sprint"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!sprint) return;
    const lines = [
      `# Спринт: ${sprint.title}`,
      `\n**Цель:** ${sprint.goal}`,
      `**Гипотеза:** ${sprint.hypothesis}`,
      `**Целевая аудитория:** ${sprint.targetAudience}`,
      `\n## 📋 Упакованный оффер: ${sprint.offer.name}`,
      `* **Клиент:** ${sprint.offer.targetCustomer}`,
      `* **Проблема:** ${sprint.offer.painfulProblem}`,
      `* **Результат:** ${sprint.offer.promisedOutcome}`,
      `* **Сроки доставки:** ${sprint.offer.timeframe}`,
      `* **Механизм решения:** ${sprint.offer.mechanism}`,
      `* **Цена:** ${sprint.offer.priceRange}`,
      `* **Призыв к действию (CTA):** ${sprint.offer.callToAction}`,
      `\n### Включено в услугу (Deliverables):`,
      sprint.offer.deliverables.map(d => `* ${d}`).join("\n"),
      `\n### Исключено из услуги (Exclusions):`,
      sprint.offer.exclusions.map(e => `* ${e}`).join("\n"),
      `\n## 📣 Стратегия по каналам (Channel Plan)`,
      `* **Основной канал:** ${sprint.channelPlan.primaryChannel}`,
      sprint.channelPlan.secondaryChannel ? `* **Вторичный канал:** ${sprint.channelPlan.secondaryChannel}` : "",
      `* **Почему выбран этот канал:** ${sprint.channelPlan.whyThisChannel}`,
      `* **Лимит контактов в день:** ${sprint.channelPlan.dailyOutreachLimit}`,
      `\n### Инструкция по поиску клиентов:`,
      sprint.channelPlan.firstProspectListInstructions.map(i => `1. ${i}`).join("\n"),
      `\n### Правила персонализации:`,
      sprint.channelPlan.personalizationRules.map(p => `* ${p}`).join("\n"),
      `\n## 📅 Ежедневный план действий (7-Day Schedule)`,
    ];
    sprint.dailyActions.forEach(day => {
      lines.push(`\n### День ${day.day}: ${day.objective}`);
      lines.push(`* **Время:** ${day.timeEstimateMinutes} минут`);
      lines.push(`* **Ожидаемый результат:** ${day.expectedOutput}`);
      lines.push(`* **Действия:**`);
      day.actions.forEach(action => lines.push(`  - [ ] ${action}`));
    });
    lines.push(`\n## ✉️ Шаблоны этичных сообщений (Outreach Scripts)`);
    sprint.outreachMessages.forEach(msg => {
      lines.push(`\n### ${msg.label} (${msg.type})`);
      if (msg.instructions) lines.push(`*Инструкция: ${msg.instructions}*`);
      lines.push(`\n\`\`\`text\n${msg.content}\n\`\`\``);
    });
    lines.push(`\n## 🧠 Вопросы для ретроспективы (Review Questions)`);
    sprint.reviewQuestions.forEach(q => lines.push(`* ${q}`));
    lines.push(`\n## 🔄 Следующие шаги (Next Experiments)`);
    sprint.nextExperimentOptions.forEach(o => lines.push(`* ${o}`));

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sprint-plan.md`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportCalendar = (targetSprint?: RevenueSprint | null) => {
    const s = targetSprint || sprint;
    if (!s) return;
    try {
      const icsContent = generateICS(s);
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sprint-schedule-${s.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export calendar:", error);
    }
  };

  // Filter playbooks library
  const filteredPlaybooks = playbooks.filter((pb) => {
    const matchesSearch =
      pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.painfulProblem.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory =
      selectedCategoryFilter === "all" || pb.category === selectedCategoryFilter;
      
    return matchesSearch && matchesCategory;
  });

  // Badge Input Suggestions
  const skillSuggestions = ["Make.com automation", "Zapier integration", "n8n workflows", "Notion setup", "Website conversion audit", "Cold calling", "CRM pipeline cleanup", "Short video editing"];
  const experienceSuggestions = ["1 year agency sales rep", "no-code builder hobbyist", "former support specialist", "freelance designer for local shops"];
  const audienceSuggestions = ["10 local business contacts", "member of local startup chat", "past clients from Upwork", "warm contacts in service shops"];
  const constraintSuggestions = ["Cannot work 9-5", "No upfront budget for software licenses", "No past case studies/reviews"];

  const listedCount = prospectsList.length;
  const contactedCount = prospectsList.filter((p) => p.status !== "identified").length;
  const repliedCount = prospectsList.filter((p) => !["identified", "contacted"].includes(p.status)).length;
  const meetingCount = prospectsList.filter((p) => ["meeting_booked", "offer_sent", "paid"].includes(p.status)).length;
  const offerCount = prospectsList.filter((p) => ["offer_sent", "paid"].includes(p.status)).length;
  const paidCount = prospectsList.filter((p) => p.status === "paid").length;

  const replyRate = contactedCount > 0 ? Math.round((repliedCount / contactedCount) * 100) : 0;
  const meetingRate = repliedCount > 0 ? Math.round((meetingCount / repliedCount) * 100) : 0;
  const offerRate = meetingCount > 0 ? Math.round((offerCount / meetingCount) * 100) : 0;
  const closingRate = offerCount > 0 ? Math.round((paidCount / offerCount) * 100) : 0;

  return (
    <main className="min-h-screen pb-20 px-4 md:px-8">
      {/* Streak Flame Congratulations Modal / Toast */}
      {showStreakFlame && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur border border-amber-500/30 p-4 rounded-2xl shadow-2xl shadow-amber-500/10 animate-bounce">
          <div className="relative">
            <Flame className="w-10 h-10 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="absolute inset-0 bg-amber-500/20 rounded-full filter blur animate-ping" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-400">
              {profile.language === "ru" ? "Ударный день! 🔥" : "Streak Day! 🔥"}
            </h4>
            <p className="text-xs text-slate-300">
              {profile.language === "ru" 
                ? `Вы закрыли все задачи на сегодня! Стрейк: ${streakCount} дн.` 
                : `You completed all tasks for today! Streak: ${streakCount} days.`}
            </p>
          </div>
        </div>
      )}

      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Navigation tabs */}
      <div className="max-w-4xl mx-auto pt-6 flex justify-between items-center border-b border-slate-900 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === "generator"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={14} />
            {profile.language === "ru" ? "Генератор планов" : "Plan Generator"}
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === "library"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen size={14} />
            {profile.language === "ru" ? "Библиотека сценариев" : "Playbook Library"}
          </button>

          <button
            onClick={() => setActiveTab("workspace")}
            className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === "workspace"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers size={14} />
            {profile.language === "ru" ? "Рабочая область" : "Workspace"}
          </button>

          <button
            onClick={() => setActiveTab("market_research")}
            className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === "market_research"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search size={14} />
            {profile.language === "ru" ? "Анализ рынка" : "Market Research"}
          </button>

          {activeSprint && (
            <button
              onClick={() => setActiveTab("active_sprint")}
              className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === "active_sprint"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckSquare size={14} className="pulse-light" />
              {profile.language === "ru" ? "Мой спринт" : "My Active Sprint"}
            </button>
          )}
        </div>

        {activeSprint && activeTab === "active_sprint" && (
          <button
            onClick={handleResetSprint}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
          >
            <RotateCcw size={12} />
            {profile.language === "ru" ? "Завершить спринт" : "End Sprint"}
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto pt-8">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-indigo-400 text-sm font-semibold tracking-wide pulse-light">{loadingMessage}</p>
          </div>
        )}

        {/* TAB 1: SPRINT GENERATOR */}
        {activeTab === "generator" && (
          <div>
            {/* Header */}
            <header className="text-center mb-10 slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={12} className="pulse-light" />
                Money Engine AI v0.3.0
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                <span className="text-gradient">Money Engine AI</span>
              </h1>
              <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
                {profile.language === "ru" 
                  ? "Собери оффер. Найди первых клиентов. Запусти 7-дневный sprint. Улучши следующий шаг."
                  : "Turn your skills into a testable offer. Run a 7-day revenue sprint. Learn what works. Repeat."}
              </p>
            </header>

            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/50 max-w-lg mx-auto slide-up">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    step === s 
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20" 
                      : step > s 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-800 text-slate-500"
                  }`}>
                    {step > s ? "✓" : s}
                  </span>
                  {s < 4 && <div className={`w-6 h-[2px] ${step > s ? "bg-emerald-600/50" : "bg-slate-800"}`} />}
                </div>
              ))}
            </div>

            {/* STEP 1: Profile Form */}
            {step === 1 && (
              <section className="glass-card p-6 md:p-8 slide-up">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block" />
                  {profile.language === "ru" ? "1. Профиль основателя" : "1. Founder Profile"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Language / Язык вывода ИИ</label>
                    <select
                      value={profile.language}
                      onChange={(e) => updateProfile({ ...profile, language: e.target.value as "en" | "ru" })}
                      className="glass-input"
                    >
                      <option value="ru" className="bg-slate-900 text-white">Русский (RU)</option>
                      <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Location / Локация</label>
                    <input
                      type="text"
                      value={profile.location || ""}
                      onChange={(e) => updateProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. Astana, Kazakhstan"
                      className="glass-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Currency / Валюта расчетов</label>
                    <select
                      value={profile.currency || "KZT"}
                      onChange={(e) => updateProfile({ ...profile, currency: e.target.value })}
                      className="glass-input"
                    >
                      <option value="KZT" className="bg-slate-900 text-white">KZT (₸) — Казахстан</option>
                      <option value="USD" className="bg-slate-900 text-white">USD ($) — Global</option>
                      <option value="EUR" className="bg-slate-900 text-white">EUR (€) — Europe</option>
                      <option value="RUB" className="bg-slate-900 text-white">RUB (₽) — Россия</option>
                      <option value="GBP" className="bg-slate-900 text-white">GBP (£) — United Kingdom</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Target Monthly Income / Цель по доходу</label>
                    <input
                      type="number"
                      value={profile.targetMonthlyIncome || ""}
                      onChange={(e) => updateProfile({ ...profile, targetMonthlyIncome: Number(e.target.value) })}
                      placeholder="e.g. 300000"
                      className="glass-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Available Hours / Часы в неделю</label>
                    <input
                      type="number"
                      value={profile.availableHoursPerWeek || ""}
                      onChange={(e) => updateProfile({ ...profile, availableHoursPerWeek: Number(e.target.value) })}
                      className="glass-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Startup Budget / Стартовый бюджет</label>
                    <select
                      value={profile.startupBudgetLevel}
                      onChange={(e) => updateProfile({ ...profile, startupBudgetLevel: e.target.value as any })}
                      className="glass-input"
                    >
                      <option value="none" className="bg-slate-900 text-white">None ($0)</option>
                      <option value="low" className="bg-slate-900 text-white">Low (under $100)</option>
                      <option value="medium" className="bg-slate-900 text-white">Medium (under $500)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Sales Comfort / Комфорт в продажах</label>
                    <select
                      value={profile.salesComfortLevel}
                      onChange={(e) => updateProfile({ ...profile, salesComfortLevel: e.target.value as any })}
                      className="glass-input"
                    >
                      <option value="low" className="bg-slate-900 text-white">Low (no calls)</option>
                      <option value="medium" className="bg-slate-900 text-white">Medium (calls ok, warm only)</option>
                      <option value="high" className="bg-slate-900 text-white">High (cold calls, pitches)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Preferred Work Type / Вид работы</label>
                    <select
                      value={profile.preferredWorkType}
                      onChange={(e) => updateProfile({ ...profile, preferredWorkType: e.target.value as any })}
                      className="glass-input"
                    >
                      <option value="automation" className="bg-slate-900 text-white">Automation setups</option>
                      <option value="consulting" className="bg-slate-900 text-white">Consulting & Audits</option>
                      <option value="service" className="bg-slate-900 text-white">Productized B2B services</option>
                      <option value="content" className="bg-slate-900 text-white">Content creation</option>
                      <option value="local" className="bg-slate-900 text-white">Local business operations</option>
                      <option value="not_sure" className="bg-slate-900 text-white">Not sure</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-6 mb-8">
                  <BadgeInput
                    value={profile.skills}
                    onChange={(tags) => updateProfile({ ...profile, skills: tags })}
                    placeholder="Type skill & press Enter..."
                    label={profile.language === "ru" ? "Ваши навыки (Skills)" : "Your Skills"}
                    suggestions={skillSuggestions}
                  />

                  <BadgeInput
                    value={profile.pastExperience}
                    onChange={(tags) => updateProfile({ ...profile, pastExperience: tags })}
                    placeholder="Type experience & press Enter..."
                    label={profile.language === "ru" ? "Прошлый опыт (Experience)" : "Past Experience"}
                    suggestions={experienceSuggestions}
                  />

                  <BadgeInput
                    value={profile.audienceAccess}
                    onChange={(tags) => updateProfile({ ...profile, audienceAccess: tags })}
                    placeholder="Type audience & press Enter..."
                    label={profile.language === "ru" ? "Доступ к аудитории (Audience Access)" : "Audience Access"}
                    suggestions={audienceSuggestions}
                  />

                  <BadgeInput
                    value={profile.constraints}
                    onChange={(tags) => updateProfile({ ...profile, constraints: tags })}
                    placeholder="Type constraint & press Enter..."
                    label={profile.language === "ru" ? "Ограничения (Constraints)" : "Constraints"}
                    suggestions={constraintSuggestions}
                  />
                </div>

                <button
                  onClick={handleGeneratePaths}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer glow-border"
                >
                  {profile.language === "ru" ? "Подобрать направления дохода" : "Generate Revenue Paths"}
                  <ArrowRight size={18} />
                </button>
              </section>
            )}

            {/* STEP 2: Revenue Paths List */}
            {step === 2 && (
              <section className="slide-up">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    {profile.language === "ru" ? "Назад к профилю" : "Back to Profile"}
                  </button>
                  <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                    {profile.language === "ru" ? "Рекомендуемые пути: " : "Recommended: "}{paths.length}
                  </h2>
                </div>

                <div className="flex flex-col gap-6 mb-8">
                  {paths.map((p, idx) => (
                    <div key={p.id || idx} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider mb-2 inline-block">
                            {p.category.replace("_", " ")}
                          </span>
                          <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500">
                          <span className="text-base font-black text-white">{p.score.total}%</span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">FIT</span>
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm italic mb-1 border-l-2 border-indigo-500/40 pl-3">
                        "{p.firstOfferExample}"
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2 text-sm">
                        <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                            <AlertTriangle size={14} className="text-amber-500" />
                            {profile.language === "ru" ? "Проблема клиента" : "Client Pain"}
                          </div>
                          <p className="text-slate-400 text-xs">{p.pain}</p>
                        </div>

                        <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {profile.language === "ru" ? "Быстрая валидация" : "Fast Validation"}
                          </div>
                          <p className="text-slate-400 text-xs">{p.score.fastestValidationStep}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectPath(p)}
                        className="w-full bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 hover:border-transparent py-2.5 rounded-xl font-bold transition-all text-sm mt-2 cursor-pointer text-center"
                      >
                        {profile.language === "ru" ? "Выбрать этот путь и собрать оффер" : "Select this path & build offer"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3: Offer Editor */}
            {step === 3 && offer && (
              <section className="glass-card p-6 md:p-8 slide-up">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-3">
                  <button
                    onClick={() => {
                      if (selectedPath?.id && playbooks.some(pb => pb.id === selectedPath.id)) {
                        setActiveTab("library");
                      } else {
                        setStep(2);
                      }
                    }}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    {profile.language === "ru" ? "Назад" : "Back"}
                  </button>
                  <h2 className="text-xl font-bold text-white">
                    {profile.language === "ru" ? "3. Настройка предложения (Offer)" : "3. Edit Offer"}
                  </h2>
                </div>

                <div className="flex flex-col gap-5 mb-8">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offer Name</label>
                    <input type="text" value={offer.name} onChange={(e) => setOffer({ ...offer, name: e.target.value })} className="glass-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Customer</label>
                    <input type="text" value={offer.targetCustomer} onChange={(e) => setOffer({ ...offer, targetCustomer: e.target.value })} className="glass-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Painful Problem</label>
                    <textarea value={offer.painfulProblem} onChange={(e) => setOffer({ ...offer, painfulProblem: e.target.value })} className="glass-input h-20 resize-y" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promised Outcome</label>
                    <textarea value={offer.promisedOutcome} onChange={(e) => setOffer({ ...offer, promisedOutcome: e.target.value })} className="glass-input h-20 resize-y" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeframe</label>
                      <input type="text" value={offer.timeframe} onChange={(e) => setOffer({ ...offer, timeframe: e.target.value })} className="glass-input" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range</label>
                      <input type="text" value={offer.priceRange} onChange={(e) => setOffer({ ...offer, priceRange: e.target.value })} className="glass-input" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deliverables (one per line)</label>
                    <textarea value={offer.deliverables.join("\n")} onChange={(e) => setOffer({ ...offer, deliverables: e.target.value.split("\n") })} className="glass-input h-28 resize-y" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CTA</label>
                    <input type="text" value={offer.callToAction} onChange={(e) => setOffer({ ...offer, callToAction: e.target.value })} className="glass-input" />
                  </div>
                </div>

                <button
                  onClick={handleGenerateSprint}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer glow-border"
                >
                  {profile.language === "ru" ? "Сформировать 7-дневный Спринт" : "Generate 7-Day Sprint Plan"}
                  <Sparkles size={18} />
                </button>
              </section>
            )}

            {/* STEP 4: Sprint preview */}
            {step === 4 && sprint && (
              <section className="flex flex-col gap-8 slide-up">
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft size={16} /> {profile.language === "ru" ? "Назад" : "Back"}
                  </button>
                  
                  <div className="flex gap-3">
                    <button onClick={handleExportMarkdown} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer">
                      <Download size={16} /> {profile.language === "ru" ? "Экспорт в .md" : "Export .md"}
                    </button>
                    <button onClick={() => handleExportCalendar(sprint)} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer">
                      <Calendar size={16} /> {profile.language === "ru" ? "Календарь (.ics)" : "Calendar (.ics)"}
                    </button>
                    <button onClick={handleStartSprint} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2 rounded-lg transition-all cursor-pointer glow-border">
                      <Play size={16} /> {profile.language === "ru" ? "Запустить этот спринт!" : "Start this Sprint!"}
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 flex flex-col gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider w-fit">Draft Plan Ready</span>
                  <h2 className="text-2xl font-black text-white">{sprint.title}</h2>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Goal:</span> {sprint.goal}</p>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Hypothesis:</span> {sprint.hypothesis}</p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE SPRINT TRACKER */}
        {activeTab === "active_sprint" && activeSprint && (
          <section className="flex flex-col gap-8 slide-up">
            
            {/* Header info */}
            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  {profile.language === "ru" ? "Активный спринт" : "Active Sprint"}
                </span>
                <h2 className="text-2xl font-black text-white mb-1">{activeSprint.title}</h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xl mb-4">{activeSprint.hypothesis}</p>
                
                {/* Integrations triggers */}
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleExportCalendar(activeSprint)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Calendar size={13} />
                    {profile.language === "ru" ? "Экспорт в Календарь" : "Export Calendar"}
                  </button>
                  <button
                    onClick={handleTriggerWebhook}
                    className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Send size={13} />
                    {profile.language === "ru" ? "Отправить задачи дня" : "Send Daily Tasks"}
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-5">
                {/* Streak Counter */}
                <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-amber-500/20 px-3.5 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1">
                    <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="text-xl font-black text-amber-400">{streakCount}</span>
                  </div>
                  <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-widest mt-0.5">
                    {profile.language === "ru" ? "СТРЕЙК" : "STREAK"}
                  </span>
                </div>

                <div className="shrink-0 flex flex-col items-center">
                  <div className="text-3xl font-black text-gradient">{calculateSprintProgress()}%</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile.language === "ru" ? "Выполнено" : "Progress"}</div>
                </div>
              </div>
            </div>

            {/* Daily Tracker & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  {profile.language === "ru" ? "Дни спринта" : "Sprint Days"}
                </h3>
                <div className="grid grid-cols-7 md:flex md:flex-col gap-1.5">
                  {activeSprint.dailyActions.map((day) => {
                    const isSelected = selectedDayTab === day.day;
                    let totalActions = day.actions.length;
                    let checkedCount = 0;
                    day.actions.forEach((_, idx) => {
                      if (checkedActions[`${day.day}-${idx}`]) checkedCount++;
                    });
                    const isDayDone = totalActions > 0 && checkedCount === totalActions;

                    return (
                      <button
                        key={day.day}
                        onClick={() => setSelectedDayTab(day.day)}
                        className={`flex items-center justify-center md:justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-transparent text-white shadow-lg"
                            : isDayDone
                              ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400"
                              : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="md:hidden">{day.day}</span>
                        <span className="hidden md:inline">Day {day.day}: {day.objective.slice(0, 18)}...</span>
                        {isDayDone && <CheckCircle size={12} className="hidden md:inline text-emerald-400 ml-1.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-5">
                {activeSprint.dailyActions
                  .filter((day) => day.day === selectedDayTab)
                  .map((day) => (
                    <div key={day.day} className="glass-card p-6 flex flex-col gap-4 slide-up">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-white text-lg">{day.objective}</h4>
                        <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                          <Clock size={12} />
                          {day.timeEstimateMinutes} min
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 bg-slate-950/30 p-3 rounded-lg border border-slate-900/80">
                        <span className="font-semibold text-slate-300 block mb-0.5">Expected Output:</span>
                        {day.expectedOutput}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {day.actions.map((action, idx) => {
                          const isChecked = !!checkedActions[`${day.day}-${idx}`];
                          return (
                            <label
                              key={idx}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-indigo-950/10 border-indigo-900/40 text-slate-400 line-through"
                                  : "bg-slate-900/30 border-slate-800/80 text-slate-200 hover:border-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleActionToggle(day.day, idx)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs leading-relaxed">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Outreach scripts */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {profile.language === "ru" ? "✉️ Быстрый доступ к скриптам аутрича" : "✉️ Outreach Script Templates"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSprint.outreachMessages.map((msg, idx) => (
                  <div key={idx} className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <div>
                        <h4 className="font-bold text-white text-xs">{msg.label}</h4>
                        <span className="text-[9px] text-indigo-400 uppercase font-semibold">{msg.type}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded transition-all cursor-pointer"
                      >
                        {copiedIndex === idx ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Sprint Action */}
            <div className="glass-card p-6 border-indigo-500/20 bg-indigo-950/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {profile.language === "ru" ? "Завершили 7-дневный эксперимент?" : "Finished your 7-day experiment?"}
                </h3>
                <p className="text-slate-400 text-xs">
                  {profile.language === "ru" 
                    ? "Введите ваши фактические метрики, и локальный ИИ проанализирует бутылочные горлышки вашей воронки продаж."
                    : "Enter your actual metrics, and local AI will evaluate your sales pipeline bottlenecks."}
                </p>
              </div>
              <button
                onClick={() => {
                  const calculated = getCalculatedMetrics();
                  setMetrics(calculated);
                  
                  // Gathers objections from prospects in the list
                  const objectionsText = prospectsList
                    .filter(p => p.objection)
                    .map(p => `${p.name}: ${p.objection}`)
                    .join("\n");
                  setUserNotes(objectionsText);
                  
                  setShowMetricsModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 glow-border whitespace-nowrap"
              >
                {profile.language === "ru" ? "Завершить спринт и запустить AI Review" : "End Sprint & Run AI Review"}
              </button>
            </div>

            {/* Weekly review screen */}
            {weeklyReview && (
              <section className="glass-card p-6 md:p-8 slide-up border-emerald-500/20 bg-emerald-950/5 flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase tracking-wider mb-2 inline-block">
                      {profile.language === "ru" ? "Еженедельный разбор готов" : "Weekly Analysis Ready"}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {profile.language === "ru" ? "Анализ эффективности воронки продаж" : "Pipeline Funnel Review"}
                    </h3>
                  </div>
                  <button onClick={handleExportReviewMarkdown} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg cursor-pointer">
                    <Download size={14} /> {profile.language === "ru" ? "Экспорт отчета" : "Export Report"}
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-center bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 w-44">
                    <AlertTriangle size={32} className="pulse-light mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">{profile.language === "ru" ? "Бутылочное горлышко" : "Bottleneck"}</span>
                    <span className="text-base font-black uppercase text-white mt-1">{weeklyReview.bottleneck}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-base mb-1.5">{profile.language === "ru" ? "ИИ-оценка воронки:" : "AI Evaluation:"}</h4>
                    <p className="text-slate-300 text-xs leading-relaxed">{weeklyReview.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-2">Evidence & Ratios:</span>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                      {weeklyReview.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-2">Recommendation:</span>
                    <p className="text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/40 pl-3">"{weeklyReview.recommendation}"</p>
                  </div>
                </div>
              </section>
            )}
          </section>
        )}

        {/* TAB 3: PLAYBOOK LIBRARY */}
        {activeTab === "library" && (
          <section className="slide-up">
            <header className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">
                {profile.language === "ru" ? "📖 Библиотека проверенных B2B сценариев" : "📖 Verified Playbook Registry"}
              </h2>
              <p className="text-slate-400 text-sm">
                {profile.language === "ru" 
                  ? "Выберите готовый сценарий для быстрого старта. Вы перейдете сразу к настройке оффера, минуя форму профиля."
                  : "Browse community playbooks and start a sprint directly, skipping profile generation."}
              </p>
            </header>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={profile.language === "ru" ? "Поиск по названию, боли или нише..." : "Search playbooks..."}
                  className="glass-input pl-10 w-full text-sm"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="glass-input text-sm md:w-56"
              >
                <option value="all">{profile.language === "ru" ? "Все категории" : "All Categories"}</option>
                <option value="diagnostic_offer">Diagnostic Offer</option>
                <option value="productized_service">Productized Service</option>
                <option value="implementation_service">Implementation Service</option>
                <option value="consulting">Consulting</option>
                <option value="local_business">Local Business</option>
              </select>
            </div>

            {/* Playbooks list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {filteredPlaybooks.length === 0 ? (
                <div className="md:col-span-2 text-center py-10 glass-card text-slate-500 text-sm">
                  {profile.language === "ru" ? "Ничего не найдено" : "No playbooks match your filters"}
                </div>
              ) : (
                filteredPlaybooks.map((pb) => (
                  <div key={pb.id} className="glass-card p-5 flex flex-col gap-3.5 relative justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                          {pb.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">v{pb.version}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mt-2 mb-1.5">{pb.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-2">{pb.summary}</p>
                      
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {pb.bestFor.slice(0, 3).map((bf, i) => (
                          <span key={i} className="text-[10px] bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded text-slate-300">
                            {bf}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-slate-500 mt-2 flex flex-col gap-1 border-t border-slate-900 pt-2">
                        <p><span className="font-semibold text-slate-400">Target:</span> {pb.targetCustomers.join(", ")}</p>
                        <p><span className="font-semibold text-slate-400">Price Range:</span> {pb.priceRange.min}-{pb.priceRange.max} {pb.priceRange.currency}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-3">
                      <button
                        onClick={() => setDetailPlaybook(pb)}
                        className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-all text-center"
                      >
                        {profile.language === "ru" ? "Детали" : "View Details"}
                      </button>
                      <button
                        onClick={() => handleUsePlaybookDirectly(pb)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-all text-center shadow hover:shadow-indigo-500/10"
                      >
                        {profile.language === "ru" ? "Использовать" : "Use Playbook"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 4: REVENUE WORKSPACE */}
        {activeTab === "workspace" && (
          <section className="slide-up flex flex-col gap-6">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-900 pb-5">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {profile.language === "ru" ? "💼 Рабочая область B2B" : "💼 B2B Revenue Workspace"}
                </h2>
                <p className="text-slate-400 text-xs">
                  {profile.language === "ru" 
                    ? "Управляйте проектами, списком лидов и анализируйте воронку продаж в реальном времени."
                    : "Manage your outreach pipeline, track customer objections, and visualize conversions."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* MVP / Growth Mode Switcher */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-0.5 flex">
                  <button
                    onClick={() => handleToggleWorkspaceMode("mvp")}
                    className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      workspaceMode === "mvp"
                        ? "bg-indigo-600 text-white shadow animate-fade-in"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    MVP Mode
                  </button>
                  <button
                    onClick={() => handleToggleWorkspaceMode("growth")}
                    className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      workspaceMode === "growth"
                        ? "bg-emerald-600 text-white shadow animate-fade-in"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Growth Mode
                  </button>
                </div>

                {/* Project Selector */}
                <select
                  value={activeProject?.id || ""}
                  onChange={(e) => {
                    const found = projectsList.find(p => p.id === e.target.value);
                    if (found) setActiveProject(found);
                  }}
                  className="glass-input text-xs w-40 py-2"
                >
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow hover:shadow-indigo-500/10 glow-border whitespace-nowrap"
                >
                  + {profile.language === "ru" ? "Новый проект" : "New Project"}
                </button>
              </div>
            </header>

            {activeProject && (
              <div className="flex flex-col gap-8">
                {/* Project Info card */}
                {activeProject.description && (
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900 text-xs text-slate-400 italic">
                    <span className="font-semibold text-slate-300 not-italic block mb-0.5">Project Description:</span>
                    {activeProject.description}
                  </div>
                )}

                {/* Dashboard: Funnel & Key Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Funnel Progress */}
                  <div className="glass-card p-6 flex flex-col gap-4.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      {profile.language === "ru" ? "📊 Воронка продаж" : "📊 Conversion Funnel"}
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      {/* 1. Identified */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                          <span>Identified / Добавлено в базу</span>
                          <span>{listedCount}</span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      {/* 2. Contacted */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                          <span>Contacted / Отправлено писем</span>
                          <span>{contactedCount} <span className="text-[10px] text-slate-500 font-normal">({listedCount > 0 ? Math.round((contactedCount/listedCount)*100) : 0}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-400 h-full rounded-full" style={{ width: listedCount > 0 ? `${(contactedCount/listedCount)*100}%` : "0%" }} />
                        </div>
                      </div>

                      {/* 3. Replied */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                          <span>Replied / Получено ответов</span>
                          <span>{repliedCount} <span className="text-[10px] text-slate-500 font-normal">({contactedCount > 0 ? Math.round((repliedCount/contactedCount)*100) : 0}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: listedCount > 0 ? `${(repliedCount/listedCount)*100}%` : "0%" }} />
                        </div>
                      </div>

                      {/* 4. Meetings Booked */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                          <span>Meetings / Назначено созвонов</span>
                          <span>{meetingCount} <span className="text-[10px] text-slate-500 font-normal">({repliedCount > 0 ? Math.round((meetingCount/repliedCount)*100) : 0}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: listedCount > 0 ? `${(meetingCount/listedCount)*100}%` : "0%" }} />
                        </div>
                      </div>

                      {/* 5. Offers Sent */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                          <span>Offers Sent / Выставлено офферов</span>
                          <span>{offerCount} <span className="text-[10px] text-slate-500 font-normal">({meetingCount > 0 ? Math.round((offerCount/meetingCount)*100) : 0}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: listedCount > 0 ? `${(offerCount/listedCount)*100}%` : "0%" }} />
                        </div>
                      </div>

                      {/* 6. Closed Paid */}
                      <div>
                        <div className="flex justify-between text-xs text-emerald-400 font-semibold mb-1">
                          <span>Paid Deals / Успешные оплаты 🎉</span>
                          <span>{paidCount} <span className="text-[10px] text-emerald-500/80 font-normal">({offerCount > 0 ? Math.round((paidCount/offerCount)*100) : 0}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: listedCount > 0 ? `${(paidCount/listedCount)*100}%` : "0%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Funnel Metrics & Financials */}
                  <div className="glass-card p-6 flex flex-col justify-between gap-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4.5">
                        {profile.language === "ru" ? "📈 Показатели конверсии" : "📈 Funnel Performance"}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-900/60">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Reply Rate</span>
                          <span className="text-xl font-black text-white">{replyRate}%</span>
                        </div>
                        <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-900/60">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Book Rate</span>
                          <span className="text-xl font-black text-white">{meetingRate}%</span>
                        </div>
                        <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-900/60">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Offer Rate</span>
                          <span className="text-xl font-black text-white">{offerRate}%</span>
                        </div>
                        <div className="bg-slate-950/30 p-3.5 rounded-xl border border-slate-900/60">
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Closing Rate</span>
                          <span className="text-xl font-black text-white">{closingRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-950/10 border border-indigo-900/30 p-4.5 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Estimated Revenue</span>
                        <h4 className="text-2xl font-black text-white mt-0.5">
                          {getCalculatedMetrics().revenueAmount.toLocaleString()} {activeSprint?.offer?.priceRange.includes("KZT") ? "KZT" : activeSprint?.offer?.priceRange.includes("KZT") ? "KZT" : ""}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400 italic">
                        {paidCount} {profile.language === "ru" ? "оплат(ы)" : "payment(s)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Tools Panel (Import/Export) */}
                <div className="glass-card p-4.5 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-3">
                    <a
                      href={`/api/prospects/export?projectId=${activeProject.id}&format=csv`}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold"
                    >
                      <Download size={14} /> Export CSV
                    </a>
                    <a
                      href={`/api/prospects/export?projectId=${activeProject.id}&format=markdown`}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold"
                    >
                      <Download size={14} /> Export Markdown (Notion)
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 font-semibold">
                      {profile.language === "ru" ? "Импорт лидов (CSV):" : "Import Leads (CSV):"}
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-950/20 file:text-indigo-400 hover:file:bg-indigo-950/30 file:cursor-pointer max-w-xs"
                    />
                  </div>
                </div>

                {/* Prospects list CRM grid */}
                <div className="glass-card p-6 flex flex-col gap-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-900 pb-3">
                    👥 {profile.language === "ru" ? "Список потенциальных клиентов" : "Pipeline Contact List"}
                  </h3>

                  {/* Add Prospect Form */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-end bg-slate-950/20 p-4 rounded-xl border border-slate-900/60">
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Saloon Beauty Astana"
                        value={newProspectName}
                        onChange={(e) => setNewProspectName(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Info / Link</label>
                      <input
                        type="text"
                        placeholder="e.g. @beauty_astana / instagram.com"
                        value={newProspectContact}
                        onChange={(e) => setNewProspectContact(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pipeline Status</label>
                      <select
                        value={newProspectStatus}
                        onChange={(e) => setNewProspectStatus(e.target.value)}
                        className="glass-input text-xs"
                      >
                        <option value="identified">Identified (В базе)</option>
                        <option value="contacted">Contacted (Связь)</option>
                        <option value="replied">Replied (Ответ)</option>
                        <option value="meeting_booked">Meeting (Созвон)</option>
                        <option value="offer_sent">Offer Sent (Оффер)</option>
                        <option value="paid">Paid (Оплата 🎉)</option>
                        <option value="rejected">Rejected (Отказ)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Warm lead, needs follow up"
                        value={newProspectNotes}
                        onChange={(e) => setNewProspectNotes(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                    <button
                      onClick={handleAddProspect}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer md:col-span-1"
                    >
                      + {profile.language === "ru" ? "Добавить лид" : "Add Lead"}
                    </button>
                  </div>

                  {/* CRM Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-3">Name</th>
                          <th className="py-3 px-3">Contact</th>
                          <th className="py-3 px-3 w-40">Status</th>
                          <th className="py-3 px-3">Notes (click to edit)</th>
                          <th className="py-3 px-3">Objection / Reason</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-950/60">
                        {prospectsList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">
                              {profile.language === "ru" ? "Список пуст. Добавьте первых клиентов выше!" : "No leads tracked yet. Add your first prospects above!"}
                            </td>
                          </tr>
                        ) : (
                          prospectsList.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-900/20 text-slate-200">
                              <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                              <td className="py-3 px-3 text-slate-400 font-mono select-all">{p.contactInfo}</td>
                              <td className="py-3 px-3">
                                <select
                                  value={p.status}
                                  onChange={(e) => handleUpdateProspectStatus(p.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 w-full focus:outline-none"
                                >
                                  <option value="identified">Identified (В базе)</option>
                                  <option value="contacted">Contacted (Связь)</option>
                                  <option value="replied">Replied (Ответ)</option>
                                  <option value="meeting_booked">Meeting (Созвон)</option>
                                  <option value="offer_sent">Offer Sent (Оффер)</option>
                                  <option value="paid">Paid (Оплата 🎉)</option>
                                  <option value="rejected">Rejected (Отказ)</option>
                                </select>
                              </td>
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  value={p.notes || ""}
                                  onChange={(e) => handleUpdateProspectNotes(p.id, e.target.value)}
                                  className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 text-xs px-1 py-0.5 w-full text-slate-300 focus:outline-none transition-all"
                                  placeholder="..."
                                />
                              </td>
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  value={p.objection || ""}
                                  onChange={(e) => handleUpdateProspectObjection(p.id, e.target.value)}
                                  className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 text-xs px-1 py-0.5 w-full text-slate-300 focus:outline-none transition-all"
                                  placeholder={profile.language === "ru" ? "Возражение клиента..." : "Log objection..."}
                                />
                              </td>
                              <td className="py-3 px-3 text-right flex items-center justify-end gap-2">
                                {p.status === "paid" && (
                                  <button
                                    onClick={() => handleGenerateCaseStudy(p)}
                                    className="bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded px-2 py-0.5 text-[10px] font-semibold cursor-pointer transition-all whitespace-nowrap"
                                  >
                                    {profile.language === "ru" ? "Создать кейс" : "Case Study"}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteProspect(p.id)}
                                  className="text-rose-400 hover:text-rose-300 transition-colors font-semibold px-2 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GROWTH MODE RETAINER AND UPSELL OFFERS */}
                {workspaceMode === "growth" && (
                  <div className="glass-card p-6 flex flex-col gap-5 border border-emerald-500/25 slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            {profile.language === "ru" ? "🔄 Сборка подписочных офферов (Retainer Builder)" : "🔄 Retainer & Subscription Builder"}
                          </h3>
                          <p className="text-slate-400 text-[11px]">
                            {profile.language === "ru"
                              ? "Создайте модель ежемесячной поддержки для удержания клиентов и увеличения LTV."
                              : "Generate recurring monthly support, audit, and monitoring tiers for your clients."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateRetainers}
                        disabled={isGeneratingRetainers}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer shadow hover:shadow-emerald-500/10 glow-border whitespace-nowrap self-start sm:self-auto"
                      >
                        {isGeneratingRetainers 
                          ? (profile.language === "ru" ? "Генерация..." : "Generating...") 
                          : (profile.language === "ru" ? "Собрать подписочные офферы" : "Build Subscription Offer")}
                      </button>
                    </div>

                    {retainersData && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                        {retainersData.retainers?.map((tier: any, i: number) => (
                          <div key={i} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{tier.tier}</span>
                                <span className="text-xs font-black text-white">{tier.priceMonthly}</span>
                              </div>
                              <h4 className="font-bold text-white text-xs mb-3">{tier.name}</h4>
                              <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-1.5 mb-4">
                                {tier.deliverables?.map((d: string, idx: number) => (
                                  <li key={idx} className="line-clamp-2">{d}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-[10px] text-slate-500 italic border-t border-slate-900/60 pt-2">
                              {tier.whyItMakesSense}
                            </div>
                          </div>
                        ))}

                        {retainersData.upsellPitchScript && (
                          <div className="lg:col-span-3 bg-slate-950/20 p-4 rounded-xl border border-slate-900 mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Send size={12} className="text-indigo-400" />
                                {profile.language === "ru" ? "Скрипт перехода на ретейнер" : "Upsell Message Template"}
                              </span>
                              <button
                                onClick={() => copyToClipboard(retainersData.upsellPitchScript, 999)}
                                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-all"
                              >
                                {copiedIndex === 999 ? (
                                  <>
                                    <Check size={12} className="text-emerald-400" />
                                    {profile.language === "ru" ? "Скопировано!" : "Copied!"}
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    {profile.language === "ru" ? "Копировать" : "Copy"}
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-900">
                              {retainersData.upsellPitchScript}
                            </pre>
                            {retainersData.pitchStrategyNotes && (
                              <p className="text-slate-500 text-[10px] mt-2 italic">
                                💡 {retainersData.pitchStrategyNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* INTEGRATIONS & AUTOMATIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* n8n Prospecting Template Card */}
                  <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {profile.language === "ru" ? "Шаблон автопоиска для n8n" : "n8n Prospecting Template"}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {profile.language === "ru" ? "Сбор лидов" : "Lead Generation"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {profile.language === "ru"
                        ? "Скачайте готовый сценарий для n8n. Он автоматически находит контакты компаний через Hunter.io по домену и сохраняет их в Google Таблицы для последующего импорта в Money Engine."
                        : "Download a ready-to-run n8n workflow. It automatically retrieves company contact details via Hunter.io by domain, and appends them to Google Sheets for importing."}
                    </p>

                    <div className="mt-auto">
                      <a
                        href="/templates/n8n_prospecting_template.json"
                        download="n8n_prospecting_template.json"
                        className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/85 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        {profile.language === "ru" ? "Скачать n8n сценарий (.json)" : "Download n8n script (.json)"}
                      </a>
                    </div>
                  </div>

                  {/* Webhook Integration Card */}
                  <div className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                        <Send size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {profile.language === "ru" ? "Интеграция с Webhook" : "Webhook Integration"}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {profile.language === "ru" ? "Ежедневный фокус" : "Daily Workflow Focus"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {profile.language === "ru"
                        ? "Настройте Webhook URL (n8n, Make.com или Telegram бот). Вы сможете отправлять список задач текущего дня одной кнопкой прямо из активного трекера."
                        : "Configure a Webhook URL (n8n, Make.com, or Telegram webhook). Send today's tasks list to your Slack/Telegram notification bot with a single click."}
                    </p>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        value={webhookUrl}
                        onChange={(e) => handleUpdateWebhookUrl(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 5: LOCAL MARKET RESEARCH ASSISTANT */}
        {activeTab === "market_research" && (
          <section className="slide-up flex flex-col gap-6">
            <header className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-black text-white mb-1">
                {profile.language === "ru" ? "🔍 Локальная аналитика рынка" : "🔍 Local Market Intelligence"}
              </h2>
              <p className="text-slate-400 text-xs">
                {profile.language === "ru"
                  ? "Исследуйте цены, конкурентов и каналы связи в вашем городе с помощью умного веб-поиска."
                  : "Analyze B2B pricing, competitor landscapes, and regional outreach norms using real-time search."}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Search Settings Card */}
              <div className="glass-card p-6 flex flex-col gap-5 md:col-span-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {profile.language === "ru" ? "Параметры поиска" : "Search Parameters"}
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {profile.language === "ru" ? "Ниша / B2B Услуга" : "Niche / B2B Service"}
                  </label>
                  <input
                    type="text"
                    value={researchNiche}
                    onChange={(e) => setResearchNiche(e.target.value)}
                    placeholder="e.g. WhatsApp Automation"
                    className="glass-input text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {profile.language === "ru" ? "Город / Локация" : "City / Location"}
                  </label>
                  <input
                    type="text"
                    value={researchLocation}
                    onChange={(e) => setResearchLocation(e.target.value)}
                    placeholder="e.g. Astana, Kazakhstan"
                    className="glass-input text-xs"
                  />
                </div>

                <button
                  onClick={handleAnalyzeMarket}
                  disabled={researchLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 glow-border text-xs mt-2"
                >
                  {researchLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {profile.language === "ru" ? "Анализируем..." : "Researching..."}
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      {profile.language === "ru" ? "Исследовать рынок" : "Analyze Local Market"}
                    </>
                  )}
                </button>
              </div>

              {/* Research Report Visualizer */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {!researchReport ? (
                  <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3">
                    <Search size={36} className="text-slate-600 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-slate-400 text-sm">
                        {profile.language === "ru" ? "Анализ еще не запущен" : "No Market Research Yet"}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                        {profile.language === "ru"
                          ? "Введите нишу и город слева, чтобы запустить ИИ-сканирование локальных цен и каналов аутрича."
                          : "Enter a B2B niche and target location to scan pricing estimates, directories, and outreach norms."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 slide-up">
                    {/* Header info */}
                    <div className="glass-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          {profile.language === "ru" ? "Рыночный отчет готов" : "Report Generated"}
                        </span>
                        <h3 className="text-lg font-black text-white">{researchReport.niche}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{researchReport.location}</p>
                      </div>
                      
                      <button
                        onClick={handleApplyResearch}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow hover:shadow-emerald-500/10 glow-border shrink-0"
                      >
                        ✓ {profile.language === "ru" ? "Применить к генератору" : "Apply to Generator"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price Range */}
                      <div className="glass-card p-5 flex flex-col gap-2.5 border-amber-500/10">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          {profile.language === "ru" ? "💰 Средние локальные цены" : "💰 Local Price Range"}
                        </span>
                        <div className="text-2xl font-black text-white">{researchReport.averagePriceRange}</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                          {profile.language === "ru"
                            ? "Рекомендуемый ориентир стоимости для вашего региона при ручной валидации экспериментов."
                            : "Recommended pricing benchmark for your target location to validate your services."}
                        </p>
                      </div>

                      {/* Outreach Norms */}
                      <div className="glass-card p-5 flex flex-col gap-2.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          {profile.language === "ru" ? "📣 Нормы коммуникации" : "📣 Outreach Communication Norms"}
                        </span>
                        <div className="text-slate-200 text-xs font-semibold leading-relaxed">
                          {researchReport.outreachNorms}
                        </div>
                      </div>
                    </div>

                    {/* Competitor Landscape */}
                    <div className="glass-card p-5 flex flex-col gap-2.5">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        {profile.language === "ru" ? "📊 Состояние конкуренции" : "📊 Local Competitor Landscape"}
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {researchReport.competitorAnalysis}
                      </p>
                    </div>

                    {/* Local Directories & objections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Directories */}
                      <div className="glass-card p-5 flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {profile.language === "ru" ? "📋 Где искать лиды (Справочники)" : "📋 Leads Databases & Directories"}
                        </span>
                        <div className="flex flex-col gap-2">
                          {researchReport.directories.map((dir: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/20 border border-slate-900 px-3 py-2 rounded-xl">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              <span>{dir}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Objections */}
                      <div className="glass-card p-5 flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {profile.language === "ru" ? "⚠️ Возражения местных клиентов" : "⚠️ Local Client Objections"}
                        </span>
                        <div className="flex flex-col gap-2">
                          {researchReport.objections.map((obj: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/20 border border-slate-900/60 p-2.5 rounded-xl">
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
                              <span className="leading-relaxed">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* PLAYBOOK DETAIL MODAL */}
      {detailPlaybook && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-2xl w-full flex flex-col gap-4 shadow-2xl slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{detailPlaybook.category}</span>
                <h3 className="font-bold text-white text-lg">{detailPlaybook.name}</h3>
              </div>
              <button
                onClick={() => setDetailPlaybook(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-300">
              <p className="italic text-slate-400">"{detailPlaybook.summary}"</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                  <span className="font-bold text-slate-200 block mb-1">Target Customers:</span>
                  <p className="text-slate-400">{detailPlaybook.targetCustomers.join(", ")}</p>
                </div>

                <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                  <span className="font-bold text-slate-200 block mb-1">Price Range:</span>
                  <p className="text-slate-400">
                    {detailPlaybook.priceRange.min}-{detailPlaybook.priceRange.max} {detailPlaybook.priceRange.currency} 
                    {detailPlaybook.priceRange.note && ` (${detailPlaybook.priceRange.note})`}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Painful Problem Solved:</span>
                <p className="text-slate-400 leading-relaxed">{detailPlaybook.painfulProblem}</p>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">Promised Outcome:</span>
                <p className="text-slate-400 leading-relaxed">{detailPlaybook.promisedOutcome}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-900/60 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Startup Cost</span>
                  <span className="font-bold text-white capitalize">{detailPlaybook.startupCostLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Trust Level Needed</span>
                  <span className="font-bold text-white capitalize">{detailPlaybook.trustRequired}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Difficulty</span>
                  <span className="font-bold text-white capitalize">{detailPlaybook.executionDifficulty}</span>
                </div>
              </div>

              {/* 7 Day schedule preview */}
              <div>
                <span className="font-bold text-slate-200 block mb-2">7-Day Actions Schedule:</span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {detailPlaybook.first7DaySprint.dailyActions.map((day) => (
                    <div key={day.day} className="flex gap-2.5 p-2 bg-slate-950/20 rounded border border-slate-900 text-[11px]">
                      <span className="font-bold text-indigo-400">Day {day.day}:</span>
                      <div>
                        <span className="font-semibold text-slate-300">{day.objective}</span>
                        <p className="text-slate-400 mt-0.5">{day.actions.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setDetailPlaybook(null)}
                className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-sm py-2.5 rounded-xl cursor-pointer transition-colors border border-slate-850"
              >
                {profile.language === "ru" ? "Закрыть" : "Close"}
              </button>
              <button
                onClick={() => handleUsePlaybookDirectly(detailPlaybook)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl cursor-pointer transition-all glow-border"
              >
                {profile.language === "ru" ? "Запустить этот сценарий" : "Use this Playbook"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* METRICS MODAL */}
      {showMetricsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full flex flex-col gap-4 shadow-2xl slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-400" />
                {profile.language === "ru" ? "Завершение спринта и ввод метрик" : "Log Sprint Metrics"}
              </h3>
              <button onClick={() => setShowMetricsModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Prospects Listed</label>
                <input type="number" value={metrics.prospectsListed} onChange={(e) => setMetrics({ ...metrics, prospectsListed: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Messages Sent</label>
                <input type="number" value={metrics.messagesSent} onChange={(e) => setMetrics({ ...metrics, messagesSent: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Replies Received</label>
                <input type="number" value={metrics.replies} onChange={(e) => setMetrics({ ...metrics, replies: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Calls Booked</label>
                <input type="number" value={metrics.callsBooked} onChange={(e) => setMetrics({ ...metrics, callsBooked: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Calls Completed</label>
                <input type="number" value={metrics.callsCompleted} onChange={(e) => setMetrics({ ...metrics, callsCompleted: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Offers Sent</label>
                <input type="number" value={metrics.offersSent} onChange={(e) => setMetrics({ ...metrics, offersSent: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Payments Received</label>
                <input type="number" value={metrics.paymentsReceived} onChange={(e) => setMetrics({ ...metrics, paymentsReceived: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Revenue Earned</label>
                <input type="number" value={metrics.revenueAmount} onChange={(e) => setMetrics({ ...metrics, revenueAmount: Number(e.target.value) })} className="glass-input text-xs" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">Customer Objections & Notes</label>
              <textarea value={userNotes} onChange={(e) => setUserNotes(e.target.value)} placeholder="Objections or notes..." className="glass-input text-xs h-20 resize-y" />
            </div>

            <button
              onClick={handleSubmitMetrics}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer glow-border text-sm"
            >
              {profile.language === "ru" ? "Отправить метрики и запустить ИИ-Анализ" : "Submit & Run AI review"}
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      )}
      {/* CREATE PROJECT MODAL */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full flex flex-col gap-4 shadow-2xl slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base">
                {profile.language === "ru" ? "Создать новый B2B проект" : "Create New B2B Project"}
              </h3>
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Gen for Medical Clinics"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Description / Goal</label>
                <textarea
                  placeholder="e.g. Build diagnostic offers and audit 15 local clinics"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="glass-input text-xs h-20 resize-y"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-800 pt-3 mt-1">
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs py-2 rounded-xl transition-colors border border-slate-850"
              >
                {profile.language === "ru" ? "Отмена" : "Cancel"}
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition-all glow-border"
              >
                {profile.language === "ru" ? "Создать" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CASE STUDY MODAL */}
      {showCaseStudyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-2xl w-full flex flex-col gap-4 shadow-2xl slide-up max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                {profile.language === "ru" ? `Кейс клиента: ${selectedCaseStudyProspect?.name}` : `Client Case Study: ${selectedCaseStudyProspect?.name}`}
              </h3>
              <button
                onClick={() => setShowCaseStudyModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-slate-950 p-4 rounded-xl border border-slate-900/60 max-h-[50vh]">
              {isGeneratingCaseStudy ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400 animate-pulse font-mono">
                    {profile.language === "ru" ? "ИИ рассчитывает ROI и пишет кейс..." : "AI calculating ROI and drafting case study..."}
                  </span>
                </div>
              ) : (
                <pre className="text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                  {caseStudyMarkdown}
                </pre>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-800 pt-3 mt-1">
              <button
                onClick={() => setShowCaseStudyModal(false)}
                className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs py-2 rounded-xl transition-colors border border-slate-850 cursor-pointer"
              >
                {profile.language === "ru" ? "Закрыть" : "Close"}
              </button>
              <button
                onClick={() => copyToClipboard(caseStudyMarkdown, 888)}
                disabled={isGeneratingCaseStudy}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 glow-border"
              >
                {copiedIndex === 888 ? (
                  <>
                    <Check size={14} />
                    {profile.language === "ru" ? "Скопировано!" : "Copied!"}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {profile.language === "ru" ? "Копировать Markdown" : "Copy Markdown"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
