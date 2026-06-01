"use client";

import React, { useState, useEffect } from "react";
import { BadgeInput } from "@/components/BadgeInput";
import { FounderProfileLite } from "@/lib/schemas/profile";
import { GeneratedPath } from "@/lib/schemas/path-generation";
import { OfferDraft } from "@/lib/schemas/offer";
import { RevenueSprint, SprintMetrics } from "@/lib/schemas/sprint";
import { WeeklyReview } from "@/lib/schemas/review";
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
  RotateCcw
} from "lucide-react";

// Default Profile state
const initialProfile: FounderProfileLite = {
  location: "Astana, Kazakhstan",
  language: "ru",
  targetMonthlyIncome: 300000,
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
  const [activeTab, setActiveTab] = useState<"generator" | "active_sprint">("generator");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profile, setProfile] = useState<FounderProfileLite>(initialProfile);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Data states
  const [paths, setPaths] = useState<GeneratedPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<GeneratedPath | null>(null);
  const [offer, setOffer] = useState<OfferDraft | null>(null);
  const [sprint, setSprint] = useState<RevenueSprint | null>(null);
  
  // Active tracker states
  const [activeSprint, setActiveSprint] = useState<RevenueSprint | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  
  // Metrics form
  const [metrics, setMetrics] = useState<SprintMetrics>(initialMetrics);
  const [userNotes, setUserNotes] = useState("");
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);

  // Copy to clipboard status
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
        body: JSON.stringify(profile)
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
        body: JSON.stringify({ profile, selectedPath, offer })
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

  const handleStartSprint = () => {
    if (!sprint) return;
    setActiveSprint(sprint);
    setCheckedActions({});
    setCompletedDays({});
    setWeeklyReview(null);
    setSelectedDayTab(1);
    
    localStorage.setItem("money_engine_active_sprint", JSON.stringify(sprint));
    localStorage.setItem("money_engine_checked_actions", JSON.stringify({}));
    localStorage.removeItem("money_engine_weekly_review");
    
    setActiveTab("active_sprint");
  };

  const handleActionToggle = (day: number, actionIdx: number) => {
    const key = `${day}-${actionIdx}`;
    const newChecked = { ...checkedActions, [key]: !checkedActions[key] };
    setCheckedActions(newChecked);
    localStorage.setItem("money_engine_checked_actions", JSON.stringify(newChecked));
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
    // (Phase 2 Markdown Exporter logic remains identical for clean code)
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

  const skillSuggestions = ["Make.com automation", "Zapier integration", "n8n workflows", "Notion setup", "Website conversion audit", "Cold calling", "CRM pipeline cleanup", "Short video editing"];
  const experienceSuggestions = ["1 year agency sales rep", "no-code builder hobbyist", "former support specialist", "freelance designer for local shops"];
  const audienceSuggestions = ["10 local business contacts", "member of local startup chat", "past clients from Upwork", "warm contacts in service shops"];
  const constraintSuggestions = ["Cannot work 9-5", "No upfront budget for software licenses", "No past case studies/reviews"];

  return (
    <main className="min-h-screen pb-20 px-4 md:px-8">
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
                Money Engine AI v0.2.0
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
                  {/* Language */}
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

                  {/* Location */}
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

                  {/* Target Income */}
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

                  {/* Hours */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">Available Hours / Часы в неделю</label>
                    <input
                      type="number"
                      value={profile.availableHoursPerWeek || ""}
                      onChange={(e) => updateProfile({ ...profile, availableHoursPerWeek: Number(e.target.value) })}
                      className="glass-input"
                    />
                  </div>

                  {/* Budget */}
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

                  {/* Sales Comfort */}
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

                  {/* Work Type */}
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
                    label={profile.language === "ru" ? "Ваши ключевые навыки (Skills)" : "Your Skills"}
                    suggestions={skillSuggestions}
                  />

                  <BadgeInput
                    value={profile.pastExperience}
                    onChange={(tags) => updateProfile({ ...profile, pastExperience: tags })}
                    placeholder="Type experience & press Enter..."
                    label={profile.language === "ru" ? "Прошлый опыт работы (Experience)" : "Past Experience"}
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

                      {/* Why this score */}
                      <div className="text-xs text-slate-400">
                        <h4 className="font-bold text-slate-200 mb-1">{profile.language === "ru" ? "Почему такой скоринг:" : "Why this score:"}</h4>
                        <ul className="list-disc list-inside space-y-0.5">
                          {p.score.whyThisScore.map((why, i) => (
                            <li key={i}>{why}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Blocker */}
                      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-xs text-amber-400/90">
                        <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold mr-1">{profile.language === "ru" ? "Главный риск:" : "Biggest Risk:"}</span>
                          {p.score.biggestRisk}
                        </div>
                      </div>

                      {/* Score Bars Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/20 border border-slate-900/60 text-[11px] text-slate-400">
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Скорость денег" : "Speed"}</span>
                            <span>{p.score.speedToFirstRevenue}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.speedToFirstRevenue * 10}%`}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Доступ к лидам" : "Reach"}</span>
                            <span>{p.score.abilityToReachBuyers}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.abilityToReachBuyers * 10}%`}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Ваш навык" : "Founder Fit"}</span>
                            <span>{p.score.founderFit}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.founderFit * 10}%`}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Острая боль" : "Pain Urgency"}</span>
                            <span>{p.score.painUrgency}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.painUrgency * 10}%`}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Дешевизна" : "Low Budget"}</span>
                            <span>{p.score.lowStartupCost}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.lowStartupCost * 10}%`}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5 font-medium">
                            <span>{profile.language === "ru" ? "Простота шага" : "Simplicity"}</span>
                            <span>{p.score.executionSimplicity}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${p.score.executionSimplicity * 10}%`}} /></div>
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
                    onClick={() => setStep(2)}
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

            {/* STEP 4: Review generated Sprint before activating */}
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
                    <button onClick={handleStartSprint} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2 rounded-lg transition-all cursor-pointer glow-border">
                      <Play size={16} /> {profile.language === "ru" ? "Запустить этот спринт!" : "Start this Sprint!"}
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="glass-card p-6 flex flex-col gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider w-fit">Draft Plan Ready</span>
                  <h2 className="text-2xl font-black text-white">{sprint.title}</h2>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Goal:</span> {sprint.goal}</p>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Hypothesis:</span> {sprint.hypothesis}</p>
                </div>

                {/* Day preview */}
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">📅 7-Day Actions Schedule Preview</h3>
                  <div className="flex flex-col gap-3">
                    {sprint.dailyActions.map((day) => (
                      <div key={day.day} className="flex gap-3 text-xs bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                        <span className="font-bold text-indigo-400 shrink-0">Day {day.day}:</span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{day.objective}</span>
                          <span className="text-slate-400">{day.actions.join(", ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{activeSprint.hypothesis}</p>
              </div>

              {/* Progress Display */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="text-3xl font-black text-gradient">{calculateSprintProgress()}%</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile.language === "ru" ? "Выполнено" : "Progress"}</div>
              </div>
            </div>

            {/* Daily Tracker & Details Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Days Navigation */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  {profile.language === "ru" ? "Дни спринта" : "Sprint Days"}
                </h3>
                <div className="grid grid-cols-7 md:flex md:flex-col gap-1.5">
                  {activeSprint.dailyActions.map((day) => {
                    const isSelected = selectedDayTab === day.day;
                    // Check if day is completed (all checkboxes on this day checked)
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

              {/* Right Columns: Tasks and Checklist Details */}
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
                        <span className="font-semibold text-slate-300 block mb-0.5">Expected Output / Ожидаемый результат:</span>
                        {day.expectedOutput}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {profile.language === "ru" ? "Задачи на день (Checklist):" : "Daily Actions:"}
                        </span>
                        
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

            {/* Outreach scripts area for quick access during execution */}
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

            {/* Call to complete review */}
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
                  setMetrics(initialMetrics);
                  setUserNotes("");
                  setShowMetricsModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 glow-border whitespace-nowrap"
              >
                {profile.language === "ru" ? "Завершить спринт и запустить AI Review" : "End Sprint & Run AI Review"}
              </button>
            </div>

            {/* WEEKLY REVIEW DISPLAY CARD (if review has been generated) */}
            {weeklyReview && (
              <section className="glass-card p-6 md:p-8 slide-up border-emerald-500/20 bg-emerald-950/5 flex flex-col gap-6" id="weekly-review-report">
                
                {/* Review Header */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase tracking-wider mb-2 inline-block">
                      {profile.language === "ru" ? "Еженедельный разбор готов" : "Weekly Analysis Ready"}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {profile.language === "ru" ? "Анализ эффективности воронки продаж" : "Pipeline Funnel Review"}
                    </h3>
                  </div>
                  
                  <button
                    onClick={handleExportReviewMarkdown}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    <Download size={14} />
                    {profile.language === "ru" ? "Экспорт в Markdown" : "Export Report"}
                  </button>
                </div>

                {/* Bottleneck indicator display */}
                <div className="flex flex-col md:flex-row gap-5 items-center bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 w-44">
                    <AlertTriangle size={32} className="pulse-light mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">{profile.language === "ru" ? "Бутылочное горлышко" : "Bottleneck"}</span>
                    <span className="text-base font-black uppercase text-white mt-1 tracking-tight">
                      {weeklyReview.bottleneck}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-white text-base mb-1.5">{profile.language === "ru" ? "ИИ-оценка воронки:" : "AI Evaluation:"}</h4>
                    <p className="text-slate-300 text-xs leading-relaxed">{weeklyReview.summary}</p>
                  </div>
                </div>

                {/* Evidence and Data logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-2">{profile.language === "ru" ? "Доказательства по метрикам:" : "Evidence & Ratios:"}</span>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
                      {weeklyReview.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-2">{profile.language === "ru" ? "Главная рекомендация:" : "Actionable Recommendation:"}</span>
                    <p className="text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/40 pl-3">
                      "{weeklyReview.recommendation}"
                    </p>
                  </div>
                </div>

                {/* Bullet details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-1">{profile.language === "ru" ? "Что сработало хорошо:" : "What worked well:"}</span>
                    <ul className="list-disc list-inside space-y-1">
                      {weeklyReview.whatWorked.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    <span className="font-bold text-slate-300 block mb-1">{profile.language === "ru" ? "Что пошло не так:" : "What went wrong:"}</span>
                    <ul className="list-disc list-inside space-y-1">
                      {weeklyReview.whatDidNotWork.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendation grids */}
                <div className="bg-indigo-950/5 border border-indigo-500/10 p-5 rounded-2xl flex flex-col gap-4 text-xs text-slate-300">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-indigo-400" />
                    {profile.language === "ru" ? "🔄 Сценарий следующего спринта" : "🔄 Adjustments for the Next Sprint"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-950/20 rounded-lg border border-slate-900">
                      <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">Keep (Оставить):</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {weeklyReview.nextSprint.keep.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-950/20 rounded-lg border border-slate-900">
                      <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider text-[10px]">Change (Изменить):</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {weeklyReview.nextSprint.change.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-950/20 rounded-lg border border-slate-900">
                      <span className="font-bold text-indigo-400 block mb-1 uppercase tracking-wider text-[10px]">Test (Протестировать):</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {weeklyReview.nextSprint.test.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </section>
            )}
            
          </section>
        )}

      </div>

      {/* METRICS MODAL */}
      {showMetricsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full flex flex-col gap-4 shadow-2xl slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-400" />
                {profile.language === "ru" ? "Завершение спринта и ввод метрик" : "Log Sprint Metrics"}
              </h3>
              <button
                onClick={() => setShowMetricsModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Prospects Listed / Найдено контактов</label>
                <input
                  type="number"
                  value={metrics.prospectsListed}
                  onChange={(e) => setMetrics({ ...metrics, prospectsListed: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Messages Sent / Отправлено писем</label>
                <input
                  type="number"
                  value={metrics.messagesSent}
                  onChange={(e) => setMetrics({ ...metrics, messagesSent: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Replies Received / Получено ответов</label>
                <input
                  type="number"
                  value={metrics.replies}
                  onChange={(e) => setMetrics({ ...metrics, replies: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Calls Booked / Записано на созвон</label>
                <input
                  type="number"
                  value={metrics.callsBooked}
                  onChange={(e) => setMetrics({ ...metrics, callsBooked: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Calls Completed / Проведено созвонов</label>
                <input
                  type="number"
                  value={metrics.callsCompleted}
                  onChange={(e) => setMetrics({ ...metrics, callsCompleted: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Offers Sent / Отправлено КП/офферов</label>
                <input
                  type="number"
                  value={metrics.offersSent}
                  onChange={(e) => setMetrics({ ...metrics, offersSent: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Payments Received / Оплат</label>
                <input
                  type="number"
                  value={metrics.paymentsReceived}
                  onChange={(e) => setMetrics({ ...metrics, paymentsReceived: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Revenue Earned / Получено выручки</label>
                <input
                  type="number"
                  value={metrics.revenueAmount}
                  onChange={(e) => setMetrics({ ...metrics, revenueAmount: Number(e.target.value) })}
                  className="glass-input text-xs"
                />
              </div>
            </div>

            {/* Note text field */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-400 font-semibold">
                Customer Objections & Reflections / Возражения клиентов и заметки
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Clients were worried about account bans. Or, I spent too much time researching Day 1."
                className="glass-input text-xs h-20 resize-y"
              />
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

    </main>
  );
}
