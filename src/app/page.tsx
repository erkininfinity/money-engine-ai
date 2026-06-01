"use client";

import React, { useState, useEffect } from "react";
import { BadgeInput } from "@/components/BadgeInput";
import { FounderProfileLite } from "@/lib/schemas/profile";
import { GeneratedPath } from "@/lib/schemas/path-generation";
import { OfferDraft } from "@/lib/schemas/offer";
import { RevenueSprint } from "@/lib/schemas/sprint";
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
  Users
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

export default function Home() {
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
  
  // Copy to clipboard status
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("money_engine_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save profile to localStorage when it changes
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
        // Sort by total score descending
        const sortedPaths = [...data.paths].sort((a, b) => b.score.total - a.score.total);
        setPaths(sortedPaths);
        setStep(2);
      } else {
        alert("Failed to generate paths. Please check your API key setup in .env.local.");
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
    setLoadingMessage(profile.language === "ru" ? "ИИ строит 7-дневный спринт и аутрич-скрипты..." : "AI building 7-day schedule and outreach scripts...");
    
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
    link.download = `sprint-plan-${selectedPath?.id || "revenue"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Suggesions for BadgeInputs
  const skillSuggestions = ["Make.com automation", "Zapier integration", "n8n workflows", "Notion setup", "Website conversion audit", "Cold calling", "CRM pipeline cleanup", "Short video editing"];
  const experienceSuggestions = ["1 year agency sales rep", "no-code builder hobbyist", "former support specialist", "freelance designer for local shops"];
  const audienceSuggestions = ["10 local business contacts", "member of local startup chat", "past clients from Upwork", "warm contacts in service shops"];
  const constraintSuggestions = ["Cannot work 9-5", "No upfront budget for software licenses", "No past case studies/reviews"];

  return (
    <main className="min-h-screen pb-20 px-4 md:px-8">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Container */}
      <div className="max-w-4xl mx-auto pt-10">
        
        {/* Header */}
        <header className="text-center mb-10 slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={12} className="pulse-light" />
            Money Engine AI v0.1
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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-indigo-400 text-sm font-semibold tracking-wide pulse-light">{loadingMessage}</p>
          </div>
        )}

        {/* STEP 1: Founder Profile Form */}
        {step === 1 && (
          <section className="glass-card p-6 md:p-8 slide-up">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block" />
              {profile.language === "ru" ? "1. Профиль основателя" : "1. Founder Profile"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Language */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Language / Язык вывода ИИ
                </label>
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
                <label className="text-sm font-semibold text-slate-300">
                  Location / Локация
                </label>
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
                <label className="text-sm font-semibold text-slate-300">
                  Target Monthly Income / Цель по доходу (валюта)
                </label>
                <input
                  type="number"
                  value={profile.targetMonthlyIncome || ""}
                  onChange={(e) => updateProfile({ ...profile, targetMonthlyIncome: Number(e.target.value) })}
                  placeholder="e.g. 300000"
                  className="glass-input"
                />
              </div>

              {/* Hours per week */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Available Hours / Часы в неделю на эксперимент
                </label>
                <input
                  type="number"
                  value={profile.availableHoursPerWeek || ""}
                  onChange={(e) => updateProfile({ ...profile, availableHoursPerWeek: Number(e.target.value) })}
                  className="glass-input"
                />
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Startup Budget / Стартовый бюджет
                </label>
                <select
                  value={profile.startupBudgetLevel}
                  onChange={(e) => updateProfile({ ...profile, startupBudgetLevel: e.target.value as "none" | "low" | "medium" })}
                  className="glass-input"
                >
                  <option value="none" className="bg-slate-900 text-white">None ($0)</option>
                  <option value="low" className="bg-slate-900 text-white">Low (under $100)</option>
                  <option value="medium" className="bg-slate-900 text-white">Medium (under $500)</option>
                </select>
              </div>

              {/* Sales Comfort */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Comfort with Manual Sales / Комфорт в ручных продажах
                </label>
                <select
                  value={profile.salesComfortLevel}
                  onChange={(e) => updateProfile({ ...profile, salesComfortLevel: e.target.value as "low" | "medium" | "high" })}
                  className="glass-input"
                >
                  <option value="low" className="bg-slate-900 text-white">Low (pref email/chat, no calls)</option>
                  <option value="medium" className="bg-slate-900 text-white">Medium (calls ok, warm only)</option>
                  <option value="high" className="bg-slate-900 text-white">High (cold calls, networking, pitches)</option>
                </select>
              </div>

              {/* Work Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Preferred Work Type / Желаемый вид работы
                </label>
                <select
                  value={profile.preferredWorkType}
                  onChange={(e) => updateProfile({ ...profile, preferredWorkType: e.target.value as any })}
                  className="glass-input"
                >
                  <option value="automation" className="bg-slate-900 text-white">Automation setups</option>
                  <option value="consulting" className="bg-slate-900 text-white">Consulting & Audits</option>
                  <option value="service" className="bg-slate-900 text-white">Productized B2B services</option>
                  <option value="content" className="bg-slate-900 text-white">Content creation / systems</option>
                  <option value="local" className="bg-slate-900 text-white">Local business operations</option>
                  <option value="not_sure" className="bg-slate-900 text-white">Not sure / Help me choose</option>
                </select>
              </div>
            </div>

            {/* Badge Inputs */}
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
                label={profile.language === "ru" ? "Доступ к аудитории (например: чат предпринимателей)" : "Audience Access / Assets"}
                suggestions={audienceSuggestions}
              />

              <BadgeInput
                value={profile.constraints}
                onChange={(tags) => updateProfile({ ...profile, constraints: tags })}
                placeholder="Type constraint & press Enter..."
                label={profile.language === "ru" ? "Ограничения (Constraints)" : "Constraints / Limitations"}
                suggestions={constraintSuggestions}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGeneratePaths}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] glow-border cursor-pointer"
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
                {profile.language === "ru" ? "Найдено путей: " : "Recommended paths: "}{paths.length}
              </h2>
            </div>

            <div className="flex flex-col gap-6 mb-8">
              {paths.map((p, idx) => (
                <div key={p.id || idx} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden">
                  
                  {/* Circular Score display */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider mb-2 inline-block">
                        {p.category.replace("_", " ")}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500 shadow-md">
                      <span className="text-base font-black text-white">{p.score.total}%</span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">FIT</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm italic mb-1 border-l-2 border-indigo-500/40 pl-3">
                    "{p.firstOfferExample}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2 text-sm">
                    {/* Pain */}
                    <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                        <AlertTriangle size={14} className="text-amber-500" />
                        {profile.language === "ru" ? "Проблема клиента" : "Client Pain"}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{p.pain}</p>
                    </div>

                    {/* Fastest validation */}
                    <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {profile.language === "ru" ? "Быстрая валидация" : "Fast Validation"}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{p.score.fastestValidationStep}</p>
                    </div>
                  </div>

                  {/* Why this score bullet points */}
                  <div className="text-xs text-slate-400">
                    <h4 className="font-bold text-slate-200 mb-1">
                      {profile.language === "ru" ? "Почему такой скоринг:" : "Why this score:"}
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5">
                      {p.score.whyThisScore.map((why, i) => (
                        <li key={i}>{why}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Blocker alert */}
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-xs text-amber-400/90">
                    <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold mr-1">
                        {profile.language === "ru" ? "Главный риск:" : "Biggest Risk:"}
                      </span>
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

        {/* STEP 3: Offer Builder & Editor */}
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
              {/* Offer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Offer Name / Название оффера
                </label>
                <input
                  type="text"
                  value={offer.name}
                  onChange={(e) => setOffer({ ...offer, name: e.target.value })}
                  className="glass-input"
                />
              </div>

              {/* Target Customer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Customer / Целевой клиент
                </label>
                <input
                  type="text"
                  value={offer.targetCustomer}
                  onChange={(e) => setOffer({ ...offer, targetCustomer: e.target.value })}
                  className="glass-input"
                />
              </div>

              {/* Pain */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Painful Problem / Проблема клиента
                </label>
                <textarea
                  value={offer.painfulProblem}
                  onChange={(e) => setOffer({ ...offer, painfulProblem: e.target.value })}
                  className="glass-input h-20 resize-y"
                />
              </div>

              {/* Promised Outcome */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Promised Outcome / Результат оффера
                </label>
                <textarea
                  value={offer.promisedOutcome}
                  onChange={(e) => setOffer({ ...offer, promisedOutcome: e.target.value })}
                  className="glass-input h-20 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timeframe */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Timeframe / Срок выполнения
                  </label>
                  <input
                    type="text"
                    value={offer.timeframe}
                    onChange={(e) => setOffer({ ...offer, timeframe: e.target.value })}
                    className="glass-input"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Price Range / Стоимость
                  </label>
                  <input
                    type="text"
                    value={offer.priceRange}
                    onChange={(e) => setOffer({ ...offer, priceRange: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              {/* Deliverables (as editable list or comma separated) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Deliverables / Что входит (по одному в строке)
                </label>
                <textarea
                  value={offer.deliverables.join("\n")}
                  onChange={(e) => setOffer({ ...offer, deliverables: e.target.value.split("\n") })}
                  className="glass-input h-28 resize-y"
                  placeholder="Enter deliverables..."
                />
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Call To Action (CTA) / Призыв к действию
                </label>
                <input
                  type="text"
                  value={offer.callToAction}
                  onChange={(e) => setOffer({ ...offer, callToAction: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSprint}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] glow-border cursor-pointer"
            >
              {profile.language === "ru" ? "Сформировать 7-дневный Спринт" : "Generate 7-Day Sprint Plan"}
              <Sparkles size={18} />
            </button>

          </section>
        )}

        {/* STEP 4: 7-Day Sprint & Export */}
        {step === 4 && sprint && (
          <section className="flex flex-col gap-8 slide-up">
            
            {/* Nav & Export controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                {profile.language === "ru" ? "Назад к офферу" : "Back to Offer"}
              </button>
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                <Download size={16} />
                {profile.language === "ru" ? "Экспорт в Markdown" : "Export Markdown"}
              </button>
            </div>

            {/* General details */}
            <div className="glass-card p-6 flex flex-col gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider w-fit">
                {profile.language === "ru" ? "Спринт сформирован" : "Sprint Created"}
              </span>
              <h2 className="text-2xl font-black text-white">{sprint.title}</h2>
              <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Цель:</span> {sprint.goal}</p>
              <p className="text-slate-300 text-sm"><span className="font-bold text-slate-200">Гипотеза:</span> {sprint.hypothesis}</p>
            </div>

            {/* Channel strategy card */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Users size={16} className="text-indigo-400" />
                {profile.language === "ru" ? "📣 Стратегия поиска клиентов" : "📣 Channel Strategy"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <p className="mb-2"><span className="font-semibold text-slate-100">Канал:</span> {sprint.channelPlan.primaryChannel}</p>
                  <p className="text-slate-400 text-xs">{sprint.channelPlan.whyThisChannel}</p>
                </div>
                <div>
                  <p className="mb-1"><span className="font-semibold text-slate-100">Лимит в день:</span> {sprint.channelPlan.dailyOutreachLimit} сообщений</p>
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Как искать лиды:</span>
                    <ol className="list-decimal list-inside mt-1 space-y-0.5">
                      {sprint.channelPlan.firstProspectListInstructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily schedule interactive board */}
            <div className="glass-card p-6 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Clock size={16} className="text-indigo-400" />
                {profile.language === "ru" ? "📅 Пошаговое расписание на 7 дней" : "📅 7-Day Actions Schedule"}
              </h3>
              
              <div className="flex flex-col gap-4">
                {sprint.dailyActions.map((day) => (
                  <div key={day.day} className="flex gap-4 p-4 rounded-xl bg-slate-950/20 border border-slate-900">
                    <div className="flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 w-12 h-12 rounded-lg shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider leading-none">Day</span>
                      <span className="text-lg font-bold leading-none">{day.day}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white text-base">{day.objective}</h4>
                        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
                          {day.timeEstimateMinutes} min
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Expected Result:</span> {day.expectedOutput}
                      </p>
                      
                      <ul className="mt-1 space-y-1.5 text-xs text-slate-300">
                        {day.actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 accent-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach messages templates */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                <Briefcase size={16} className="text-indigo-400" />
                {profile.language === "ru" ? "✉️ Шаблоны этичных скриптов" : "✉️ Ethical Outreach Scripts"}
              </h3>
              
              {sprint.outreachMessages.map((msg, idx) => (
                <div key={idx} className="glass-card p-5 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{msg.label}</h4>
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">{msg.type}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Copy size={12} />
                      {copiedIndex === idx 
                        ? (profile.language === "ru" ? "Скопировано!" : "Copied!") 
                        : (profile.language === "ru" ? "Копировать" : "Copy")}
                    </button>
                  </div>
                  
                  {msg.instructions && (
                    <p className="text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded border border-slate-900/60 leading-relaxed">
                      <span className="font-bold text-slate-300 mr-1">Rule:</span>
                      {msg.instructions}
                    </p>
                  )}
                  
                  <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-900 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Review questions and adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="glass-card p-5">
                <h4 className="font-bold text-white text-sm border-b border-slate-800/80 pb-2 mb-3">
                  {profile.language === "ru" ? "🧠 Вопросы для разбора (Review)" : "🧠 Review Questions"}
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5">
                  {sprint.reviewQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-5">
                <h4 className="font-bold text-white text-sm border-b border-slate-800/80 pb-2 mb-3">
                  {profile.language === "ru" ? "🔄 Варианты адаптации оффера" : "🔄 Next Experiment Steps"}
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5">
                  {sprint.nextExperimentOptions.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                setStep(1);
                setSelectedPath(null);
                setOffer(null);
                setSprint(null);
              }}
              className="w-fit mx-auto text-slate-500 hover:text-slate-300 transition-colors text-sm font-semibold mb-10 cursor-pointer"
            >
              {profile.language === "ru" ? "Сбросить и начать заново" : "Start over"}
            </button>

          </section>
        )}

      </div>
    </main>
  );
}
