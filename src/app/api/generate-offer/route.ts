import { NextResponse } from "next/server";
import { openai, openaiModel } from "@/lib/ai/openai";
import { profileSchema } from "@/lib/schemas/profile";
import { generatedPathSchema } from "@/lib/schemas/path-generation";
import { offerSchema } from "@/lib/schemas/offer";
import {
  OFFER_BUILDER_SYSTEM_PROMPT,
  formatOfferBuilderUserPrompt,
} from "@/lib/prompts/offer-builder";

function getDemoOffer(language: "ru" | "en") {
  if (language === "ru") {
    return {
      name: "7-дневный Экспресс-отклик для салонов красоты",
      targetCustomer: "Владельцы салонов красоты и косметологических клиник в Астане",
      painfulProblem: "Администраторы теряют до 40% обращений из-за задержки ответов в Instagram DM более чем на 30 минут.",
      promisedOutcome: "Новые клиенты получают автоматический ответ за 5 минут с переводом диалога на запись в WhatsApp Business.",
      timeframe: "7 дней",
      mechanism: "Связка триггера формы Instagram с чатом WhatsApp через no-code платформу Make.com.",
      deliverables: [
        "Настройка интеграции Instagram Webhook к WhatsApp Business",
        "Создание 5 готовых шаблонов ответов для администратора",
        "Инструкция по работе с возражениями клиентов",
        "1 месяц поддержки и устранения сбоев"
      ],
      exclusions: [
        "Разработка сложных ИИ-диалогов",
        "Оплата подписок на Make.com и официальный Meta API"
      ],
      priceRange: "99,000 KZT (предоплата 50%)",
      proofNeeded: [
        "Результаты тайного покупателя (замер времени ответа до/после)"
      ],
      trustBuilders: [
        "Бесплатная проверка скорости ответа (Mystery Shopping)",
        "Скриншот-схема автоматизации перед внедрением"
      ],
      objections: [
        "Будет ли бан в WhatsApp? - Нет, мы используем официальный Meta Cloud API.",
        "Это сложно для администраторов? - Нет, они будут работать в привычном приложении WhatsApp Web."
      ],
      callToAction: "Давайте я проверю скорость ответа вашего администратора бесплатно. Если она больше 15 минут, я покажу схему автоматизации."
    };
  } else {
    return {
      name: "7-Day Lead Response Fix for Salons",
      targetCustomer: "Beauty salon and spa owners in Astana",
      painfulProblem: "Losing customers because the salon admin replies to Instagram DMs hours later.",
      promisedOutcome: "Automated WhatsApp Business reply triggers within 5 minutes, routing prospects directly to booking.",
      timeframe: "7 days",
      mechanism: "Connecting Instagram DM webhooks to WhatsApp using Make.com integrations.",
      deliverables: [
        "Instagram to WhatsApp routing integration",
        "5 pre-written quick reply templates for the admin",
        "1 month of technical support"
      ],
      exclusions: [
        "Building complex AI natural-language chat assistants",
        "Meta API usage and license fees"
      ],
      priceRange: "99,000 KZT (50% upfront)",
      proofNeeded: [
        "Before/after response speed measurements"
      ],
      trustBuilders: [
        "Free response-speed mystery shop test",
        "Visual roadmap of the routing workflow"
      ],
      objections: [
        "Will our number get banned? - No, we only configure official Meta APIs.",
        "Is it hard to use? - No, the admin manages everything from WhatsApp Web."
      ],
      callToAction: "Let me test your current response time. If it's over 10 minutes, I will show you how to fix it in 24 hours."
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, selectedPath } = body;

    const validatedProfile = profileSchema.safeParse(profile);
    const validatedPath = generatedPathSchema.safeParse(selectedPath);

    if (!validatedProfile.success || !validatedPath.success) {
      return NextResponse.json(
        { error: "Invalid profile or path data" },
        { status: 400 }
      );
    }

    // Check if API key is not defined, or is dummy, to return demo data
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
      console.log("Using demo fallback for offer generation (no API key configured).");
      return NextResponse.json(getDemoOffer(validatedProfile.data.language));
    }

    const systemPrompt = OFFER_BUILDER_SYSTEM_PROMPT;
    const userPrompt = formatOfferBuilderUserPrompt(
      validatedProfile.data,
      validatedPath.data
    );

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
    const validatedOffer = offerSchema.safeParse(parsedJson);

    if (!validatedOffer.success) {
      console.error("AI offer response failed Zod validation:", validatedOffer.error);
      return NextResponse.json(parsedJson);
    }

    return NextResponse.json(validatedOffer.data);
  } catch (error: any) {
    console.error("Error in generate-offer API:", error);
    return NextResponse.json(
      { error: "Failed to generate offer draft", message: error.message },
      { status: 500 }
    );
  }
}
