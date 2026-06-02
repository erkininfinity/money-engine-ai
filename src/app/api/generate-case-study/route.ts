import { NextResponse } from "next/server";
import { openai, openaiModel } from "@/lib/ai/openai";
import { profileSchema } from "@/lib/schemas/profile";
import {
  CASE_STUDY_SYSTEM_PROMPT,
  formatCaseStudyUserPrompt,
} from "@/lib/prompts/case-study-builder";

function getMockCaseStudy(language: "ru" | "en", clientName: string, projectName: string) {
  if (language === "ru") {
    return `# Кейс: Как ${clientName} автоматизировал работу с клиентами с помощью Money Engine AI

## Краткий обзор (Executive Summary)
Компания **${clientName}** внедрила автоматическую маршрутизацию и моментальные автоответы в WhatsApp/Instagram. Это позволило сократить время первого отклика с 40 минут до 2 минут, повысив конверсию в запись на 35%.

## Проблема (Challenge)
До внедрения проекта менеджеры ${clientName} отвечали на входящие сообщения вручную. В периоды высокой нагрузки или в нерабочее время клиенты ждали ответа часами. Согласно замерам, около 40% лидов уходили к конкурентам, не дождавшись обратной связи.

## Решение (Solution)
Мы настроили интеграцию через Meta API для автоматической пересылки сообщений из Instagram Direct в WhatsApp и подключили шаблоны мгновенного ответа. Теперь клиент получает приветственный аудит/опросник в течение первых 120 секунд.

## Сравнение До / После (Before vs After)
* **Время отклика:** Было 40 минут ➔ Стало 2 минуты
* **Конверсия из заявки в звонок:** Была 12% ➔ Стала 28%
* **Пропущенные обращения в нерабочее время:** Было 30% ➔ Стало 0%

## Расчет окупаемости (ROI Proof)
При стоимости настройки в **99,000 KZT** проект окупился в первую же неделю. ${clientName} получил дополнительно 6 подтвержденных записей, принесших более 350,000 KZT выручки. Каждые 1,000 KZT, инвестированные в автоматизацию, принесли 3,500 KZT чистой прибыли (ROI: 250%).

## Проект отзыва (Testimonial Draft)
> "Автоматизация решила нашу главную головную боль — пропущенные заявки по вечерам. Теперь система сама отвечает клиентам и собирает контакты, пока мы отдыхаем. Очень рекомендуем!"
`;
  } else {
    return `# Case Study: How ${clientName} Automated Client Response Speed

## Executive Summary
**${clientName}** implemented instant WhatsApp/Instagram routing, reducing customer response times from 40 minutes to under 2 minutes. This change boosted lead-to-booking conversions by 35%.

## The Challenge
Before implementing ${projectName}, the client's team answered all social media inquiries manually. Average response delay was 40 minutes, causing a 40% loss of high-intent leads to faster competitors.

## The Solution
We integrated Meta APIs to route Instagram Direct messages to WhatsApp with instant pre-configured response templates. The user now receives a diagnostics form within 2 minutes.

## Before vs After
* **First Response Delay:** Was 40 mins ➔ Now 2 mins
* **Lead-to-Booking Conversion:** Was 12% ➔ Now 28%
* **Unanswered Off-Hours Leads:** Was 30% ➔ Now 0%

## ROI Calculation
For a one-time setup price of **$500**, the project generated 6 additional bookings in week one, valued at $1,800. ROI stands at 260% in the first 10 days of operation.

## Testimonial Draft
> "The automated routing saved our sales funnel. Leads get booked immediately, and we no longer lose clients during off-hours. A must-have service!"
`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, projectName, projectDescription, offerName, offerPrice, prospectName, prospectNotes } = body;

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
      console.log("Using demo fallback for case study (no API key configured).");
      const mockMarkdown = getMockCaseStudy(currentProfile.language, prospectName || "Client", projectName || "AI Automation");
      return NextResponse.json({ markdown: mockMarkdown });
    }

    const systemPrompt = CASE_STUDY_SYSTEM_PROMPT;
    const userPrompt = formatCaseStudyUserPrompt(
      currentProfile,
      projectName || "AI Automation Setup",
      projectDescription || "Automating lead flows for local service businesses.",
      offerName || "WhatsApp Automation",
      offerPrice || "99k KZT",
      prospectName || "Client",
      prospectNotes || ""
    );

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const markdown = response.choices[0].message.content || "";
    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error("Error in generate-case-study API:", error);
    return NextResponse.json(
      { error: "Failed to generate case study", message: error.message },
      { status: 500 }
    );
  }
}
