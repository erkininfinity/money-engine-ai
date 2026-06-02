import { NextResponse } from "next/server";
import { openai, openaiModel } from "@/lib/ai/openai";
import { profileSchema } from "@/lib/schemas/profile";
import {
  GROWTH_OFFER_SYSTEM_PROMPT,
  formatGrowthOfferUserPrompt,
} from "@/lib/prompts/growth-offer-builder";

function getMockGrowthOffers(language: "ru" | "en", currency: string) {
  const isRu = language === "ru";
  const curr = currency || "KZT";

  if (isRu) {
    return {
      retainers: [
        {
          tier: "Lite",
          name: "Базовая Поддержка и Мониторинг",
          priceMonthly: curr === "KZT" ? "39,000 KZT/мес" : `$150/mo`,
          deliverables: [
            "Ежедневная проверка работоспособности автоответов",
            "Исправление сбоев интеграции (до 2 часов работы)",
            "Ежемесячный отчет по пропущенным лидам"
          ],
          whyItMakesSense: "Для компаний, которым важна стабильность работы без лишних затрат."
        },
        {
          tier: "Standard",
          name: "Оптимизация и Масштабирование",
          priceMonthly: curr === "KZT" ? "99,000 KZT/мес" : `$390/mo`,
          deliverables: [
            "Все функции пакета Lite",
            "Настройка 2 новых сценариев автоматизации в месяц",
            "Анализ конверсий и доработка скриптов сообщений",
            "Поддержка по почте/WhatsApp в течение 12 часов"
          ],
          whyItMakesSense: "Идеально для растущих компаний, желающих максимизировать конверсию."
        },
        {
          tier: "Premium",
          name: "Ваш Технический Партнер",
          priceMonthly: curr === "KZT" ? "249,000 KZT/мес" : `$990/mo`,
          deliverables: [
            "Все функции пакета Standard",
            "Неограниченные мелкие правки интеграций",
            "Еженедельные стратегические сессии по оптимизации продаж",
            "Приоритетная поддержка 24/7 (ответ в течение 2 часов)"
          ],
          whyItMakesSense: "Для компаний, передающих всю техническую сторону лидогенерации на аутсорс."
        }
      ],
      upsellPitchScript: `Приветствую, [Имя]!

Рад, что мы успешно запустили первый этап автоматизации. Система работает отлично, и первые результаты показывают хорошую скорость отклика.

Чтобы вы не отвлекались на рутину и технические обновления сценариев, я подготовил варианты ежемесячной поддержки. Мы будем мониторить стабильность Meta API, дорабатывать автоответы и добавлять новые интеграции под ваши новые задачи.

Можем обсудить варианты на следующей неделе? Вот ссылка на варианты поддержки: [Ссылка]`,
      pitchStrategyNotes: "Предлагайте подписку сразу после первой недели работы основной системы, пока ценность свежа в памяти клиента."
    };
  } else {
    return {
      retainers: [
        {
          tier: "Lite",
          name: "Basic Support & Monitoring",
          priceMonthly: `$190/mo`,
          deliverables: [
            "Daily system uptime monitoring",
            "API failure & disconnection resolution (up to 2 hours)",
            "Monthly performance & leak report"
          ],
          whyItMakesSense: "Best for business owners looking to guarantee stability at a low price."
        },
        {
          tier: "Standard",
          name: "Growth & Optimization",
          priceMonthly: `$490/mo`,
          deliverables: [
            "Includes Lite support package",
            "Up to 2 new custom workflows/scenarios built monthly",
            "Conversion rate audits & response copy refinements",
            "12-hour email/chat turnaround support SLA"
          ],
          whyItMakesSense: "Best for growing businesses wanting to capture every dollar of inbound lead flow."
        },
        {
          tier: "Premium",
          name: "Dedicated Fractional CTO Partner",
          priceMonthly: `$1,290/mo`,
          deliverables: [
            "Includes Standard support package",
            "Unlimited minor edits & updates",
            "Weekly strategy and sales funnel optimization reviews",
            "24/7 priority emergency hotline support"
          ],
          whyItMakesSense: "Best for companies scaling rapidly who need custom-fit technology support on-demand."
        }
      ],
      upsellPitchScript: `Hi [Name],

I'm glad the initial automation setup is running smoothly for you!

To keep everything running error-free as APIs change, and to build out new automations as your pipeline grows, I've created monthly retainer options. We take care of all monitoring, testing, and script adjustments so you can focus entirely on closing.

Would you like to review the subscription tiers on a brief call next Tuesday?`,
      pitchStrategyNotes: "Focus on peace of mind and system reliability. Contrast the low retainer price with the high cost of a broken funnel."
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, projectName, projectDescription, oneTimeOfferName, oneTimeOfferPrice } = body;

    const validatedProfile = profileSchema.safeParse(profile);
    if (!validatedProfile.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: validatedProfile.error.format() },
        { status: 400 }
      );
    }

    const currentProfile = validatedProfile.data;

    // Check if API key is not defined, or is dummy, to return demo data
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
      console.log("Using demo fallback for growth offer retainer (no API key configured).");
      return NextResponse.json(getMockGrowthOffers(currentProfile.language, currentProfile.currency || "KZT"));
    }

    const systemPrompt = GROWTH_OFFER_SYSTEM_PROMPT;
    const userPrompt = formatGrowthOfferUserPrompt(
      currentProfile,
      projectName || "AI Automation",
      projectDescription || "B2B client engagement automation.",
      oneTimeOfferName || "WhatsApp Auto-Reply",
      oneTimeOfferPrice || "99k KZT"
    );

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = response.choices[0].message.content || "";
    const parsedJson = JSON.parse(content);
    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error("Error in generate-growth-offer API:", error);
    return NextResponse.json(
      { error: "Failed to generate growth offer", message: error.message },
      { status: 500 }
    );
  }
}
