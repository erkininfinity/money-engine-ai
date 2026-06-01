import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { openai, openaiModel } from "@/lib/ai/openai";
import { profileSchema } from "@/lib/schemas/profile";
import { pathsResponseSchema } from "@/lib/schemas/path-generation";
import { calculateFitScore } from "@/lib/scoring/fit-score";
import { playbookSchema, RevenuePlaybook } from "@/lib/schemas/playbook";
import {
  PATH_GENERATOR_SYSTEM_PROMPT,
  formatPathGeneratorUserPrompt,
} from "@/lib/prompts/path-generator";

// Helper to load seed playbooks
function loadSeedPlaybooks(): RevenuePlaybook[] {
  try {
    const playbooksDir = path.join(process.cwd(), "data/playbooks");
    if (!fs.existsSync(playbooksDir)) return [];

    const files = fs.readdirSync(playbooksDir);
    return files
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
      .map((file) => {
        const filePath = path.join(playbooksDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const parsed = yaml.parse(fileContent);
        // Validating against playbook schema
        const validated = playbookSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        } else {
          console.warn(`Playbook ${file} failed validation:`, validated.error);
          return parsed as RevenuePlaybook; // fallback
        }
      });
  } catch (error) {
    console.error("Error loading playbooks:", error);
    return [];
  }
}

// Mock/demo fallback when no API key is provided
function getDemoPaths(language: "ru" | "en") {
  if (language === "ru") {
    return {
      paths: [
        {
          id: "ai-automation-audit",
          name: "ИИ-Аудит процессов и автоответов для локальных компаний",
          category: "productized_service",
          targetCustomers: ["Салоны красоты", "Стоматологические клиники", "Автосервисы в Астане"],
          pain: "Администраторы долго отвечают в Instagram/WhatsApp, из-за чего клиенты уходят к конкурентам.",
          firstOfferExample: "Я помогаю салонам красоты настроить моментальный WhatsApp-автоответчик за 48 часов, чтобы не терять до 40% лидов.",
          score: calculateFitScore({
            speedToFirstRevenue: 9,
            abilityToReachBuyers: 8,
            founderFit: 9,
            painUrgency: 8,
            lowStartupCost: 10,
            executionSimplicity: 8,
            whyThisScore: [
              "Очень высокая скорость запуска (до 48 часов)",
              "Не требует стартового бюджета",
              "Легко проверить через тайного покупателя в Instagram"
            ],
            biggestRisk: "Трудности с получением доступа к Meta API/аккаунту клиента",
            fastestValidationStep: "Написать 10 салонам в Instagram как тайный покупатель и замерить время их ответа"
          }),
          risks: [" Meta API требует верификацию", "Клиент ждёт сложного чат-бота вместо простой маршрутизации"],
          firstChannels: ["Instagram Direct", "Локальные бизнес-чаты в Telegram"],
          nextSteps: ["Провести аудит времени ответа для 15 местных салонов", "Отправить отчет владельцам"]
        },
        {
          id: "revenue-leak-audit",
          name: "Аудит утечки лидов в агентствах услуг",
          category: "diagnostic_offer",
          targetCustomers: ["Маркетинговые агентства", "Дизайн-студии", "Консалтинговые компании"],
          pain: "Бюджет на маркетинг тратится, но менеджеры забывают перезванивать или не отправляют коммерческие предложения вовремя.",
          firstOfferExample: "Я помогаю диджитал-агентствам найти дыры в воронке продаж с помощью Mystery Shopping теста за 3 дня.",
          score: calculateFitScore({
            speedToFirstRevenue: 7,
            abilityToReachBuyers: 7,
            founderFit: 8,
            painUrgency: 9,
            lowStartupCost: 10,
            executionSimplicity: 7,
            whyThisScore: [
              "Срочная боль (утечка денег прямо сейчас)",
              "Высокий средний чек на B2B услуги",
              "Простой тест для демонстрации проблемы"
            ],
            biggestRisk: "Сложно получить доверие владельца агентства без кейсов",
            fastestValidationStep: "Оставить заявку на сайтах 5 агентств и зафиксировать ошибки их менеджеров"
          }),
          risks: ["Оборонительная позиция менеджеров продаж", "Требуется временный доступ к CRM для полного аудита"],
          firstChannels: ["Личные контакты", "Профессиональные группы в LinkedIn/Facebook"],
          nextSteps: ["Провести аудит для 5 дружественных компаний", "Оформить первый кейс-отчет"]
        }
      ]
    };
  } else {
    return {
      paths: [
        {
          id: "ai-automation-audit",
          name: "AI & Automation Audit for Local Services",
          category: "productized_service",
          targetCustomers: ["Salons & Spas", "Medical Clinics", "Local Agencies"],
          pain: "Slow response times to new leads on Instagram DMs and WhatsApp leads to lost sales.",
          firstOfferExample: "I help medical clinics set up automated WhatsApp routing in 48 hours to secure bookings instantly.",
          score: calculateFitScore({
            speedToFirstRevenue: 9,
            abilityToReachBuyers: 8,
            founderFit: 9,
            painUrgency: 8,
            lowStartupCost: 10,
            executionSimplicity: 8,
            whyThisScore: [
              "Fast validation loop",
              "No starting budget needed",
              "Highly demonstrable problem via mystery shopping"
            ],
            biggestRisk: "Getting Meta App approvals",
            fastestValidationStep: "Mystery shop 10 local business pages and log response times"
          }),
          risks: ["Client expects complete AI chatbot instead of simple routing"],
          firstChannels: ["Instagram Direct", "Warm referrals"],
          nextSteps: ["Mystery shop 15 businesses", "Send reports to the business owners"]
        }
      ]
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedProfile = profileSchema.safeParse(body);

    if (!validatedProfile.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: validatedProfile.error.format() },
        { status: 400 }
      );
    }

    const profile = validatedProfile.data;

    // Check if API key is not defined, or is dummy, to return demo data
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
      console.log("Using demo fallback for path generation (no API key configured).");
      return NextResponse.json(getDemoPaths(profile.language));
    }

    const playbooks = loadSeedPlaybooks();
    const systemPrompt = PATH_GENERATOR_SYSTEM_PROMPT;
    const userPrompt = formatPathGeneratorUserPrompt(profile, playbooks);

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedJson = JSON.parse(content);

    // Apply exact formula for scores calculated on backend
    if (parsedJson.paths && Array.isArray(parsedJson.paths)) {
      parsedJson.paths = parsedJson.paths.map((pathItem: any) => {
        if (pathItem.score) {
          pathItem.score = calculateFitScore({
            speedToFirstRevenue: Number(pathItem.score.speedToFirstRevenue) || 0,
            abilityToReachBuyers: Number(pathItem.score.abilityToReachBuyers) || 0,
            founderFit: Number(pathItem.score.founderFit) || 0,
            painUrgency: Number(pathItem.score.painUrgency) || 0,
            lowStartupCost: Number(pathItem.score.lowStartupCost) || 0,
            executionSimplicity: Number(pathItem.score.executionSimplicity) || 0,
            whyThisScore: Array.isArray(pathItem.score.whyThisScore) ? pathItem.score.whyThisScore : [],
            biggestRisk: String(pathItem.score.biggestRisk || ""),
            fastestValidationStep: String(pathItem.score.fastestValidationStep || ""),
          });
        }
        return pathItem;
      });
    }

    const validatedPaths = pathsResponseSchema.safeParse(parsedJson);
    if (!validatedPaths.success) {
      console.error("AI response failed Zod validation:", validatedPaths.error);
      // Fallback to parsed JSON anyway if schema structure is mostly correct, or return error
      return NextResponse.json(parsedJson);
    }

    return NextResponse.json(validatedPaths.data);
  } catch (error: any) {
    console.error("Error in generate-paths API:", error);
    return NextResponse.json(
      { error: "Failed to generate revenue paths", message: error.message },
      { status: 500 }
    );
  }
}
