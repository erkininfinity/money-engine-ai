import { NextResponse } from "next/server";
import { openai, openaiModel } from "@/lib/ai/openai";
import { sprintSchema } from "@/lib/schemas/sprint";
import { reviewSchema } from "@/lib/schemas/review";
import {
  WEEKLY_REVIEW_SYSTEM_PROMPT,
  formatWeeklyReviewUserPrompt,
} from "@/lib/prompts/weekly-review";

function getDemoReview(language: "ru" | "en", metrics: any) {
  const isZeroSales = metrics.paymentsReceived === 0;
  const isLowReplies = metrics.messagesSent > 0 && metrics.replies / metrics.messagesSent < 0.15;

  if (language === "ru") {
    if (isLowReplies) {
      return {
        summary: "Низкий уровень откликов на ваши исходящие обращения. Проблема в формулировке первого сообщения или соответствии целевой аудитории.",
        whatWorked: [
          "Вы успешно составили список контактов и начали отправку",
          "Выдерживался лимит отправки сообщений без попадания в спам-фильтры"
        ],
        whatDidNotWork: [
          "Конверсия в ответ составила менее 10%",
          "Сообщения выглядят слишком формальными или не предлагают мгновенную ценность"
        ],
        bottleneck: "message",
        evidence: [
          `Отправлено сообщений: ${metrics.messagesSent}, получено ответов: ${metrics.replies}`,
          `Конверсия в ответ составляет всего ${metrics.messagesSent > 0 ? Math.round((metrics.replies / metrics.messagesSent) * 100) : 0}% (целевая > 20%)`
        ],
        recommendation: "Перепишите приветственное сообщение: сделайте акцент на бесплатную проверку скорости ответа (Mystery Shopping) и уменьшите объем текста до 2 предложений.",
        nextSprint: {
          keep: ["Использование Instagram Direct как канала коммуникации", "Лимит 10 контактов в день"],
          change: ["Шаблон первого сообщения: убрать упоминание цены и услуг, сразу предлагать бесплатную пользу", "Добавить скриншот с фиксацией времени ответа для наглядности"],
          test: ["Тестирование ниши фитнес-центров вместо салонов красоты для сравнения спроса"]
        }
      };
    } else if (isZeroSales) {
      return {
        summary: "Вы успешно установили контакт и провели созвоны, но не смогли закрыть сделку. Бутылочное горлышко смещено в сторону Оффера или Доверия.",
        whatWorked: [
          "Высокий процент ответов на сообщения (контакт налажен)",
          "Успешное проведение диагностических звонков с владельцами бизнеса"
        ],
        whatDidNotWork: [
          "Клиенты проявляют интерес к автоотвечикам, но отказываются платить 99,000 KZT на этапе предложения",
          "Возражения о безопасности Meta API и банах номеров не были закрыты убедительно"
        ],
        bottleneck: "offer",
        evidence: [
          `Проведено созвонов: ${metrics.callsCompleted}, отправлено предложений: ${metrics.offersSent}, оплат: 0`,
          "Клиенты берут паузу на подумать и не возвращаются"
        ],
        recommendation: "Снизьте барьер входа: предложите более простой и дешевый продукт (например, 'Базовый аудит и настройку шаблонов в WhatsApp за 49,000 KZT') или дайте гарантию возврата средств.",
        nextSprint: {
          keep: [" Mystery Shopping аудит как метод захода к клиенту", "Сбор 15 контактов на старте"],
          change: ["Снизить цену первой связки до 49,000 KZT для снижения страха перед оплатой", "Подготовить 1-страничный PDF-документ с ответами на частые страхи о банах в WhatsApp"],
          test: ["Предложение бесплатного 3-дневного тест-драйва автоответов"]
        }
      };
    } else {
      return {
        summary: "Поздравляем с успешным закрытием сделки! Базовый цикл воронки работает.",
        whatWorked: [
          "Вы прошли всю воронку от поиска до получения оплаты",
          "Ваш аудит через Mystery Shopping показал высокую конверсию"
        ],
        whatDidNotWork: [
          "Часть клиентов ответила позже, что сдвинуло график созвонов"
        ],
        bottleneck: "delivery",
        evidence: [
          `Получено оплат: ${metrics.paymentsReceived}, выручка: ${metrics.revenueAmount} KZT`,
          "Клиент ожидает интеграцию в кратчайшие сроки"
        ],
        recommendation: "Сфокусируйтесь на безупречном выполнении обязательств по внедрению автоответов и получите подробный видео-отзыв от первого клиента.",
        nextSprint: {
          keep: ["Скрипт Mystery Shop аудита", "Instagram Direct как основной канал"],
          change: ["Ускорить процесс согласования шаблонов с клиентом", "Задокументировать шаги интеграции для ускорения работы в будущем"],
          test: ["Запуск реферальной программы: скидка 20% текущему клиенту за рекомендацию другу"]
        }
      };
    }
  } else {
    // English default
    return {
      summary: "You completed outreach, but failed to secure payments. The main bottleneck lies in the Offer value or Trust.",
      whatWorked: ["Outreach messages sent successfully", "Secured initial diagnostic calls"],
      whatDidNotWork: ["Zero sales completed", "Prospects raised pricing objections"],
      bottleneck: "offer",
      evidence: [`Completed calls: ${metrics.callsCompleted}, payments: 0`],
      recommendation: "Lower the initial friction by offering a cheaper audit or a 3-day free trial of the automation.",
      nextSprint: {
        keep: ["Instagram DM prospecting"],
        change: ["Price point down to 49,000 KZT"],
        test: ["Offering a 3-day trial option"]
      }
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sprint, metrics, userNotes } = body;

    const validatedSprint = sprintSchema.safeParse(sprint);
    if (!validatedSprint.success) {
      return NextResponse.json(
        { error: "Invalid sprint schema data", details: validatedSprint.error.format() },
        { status: 400 }
      );
    }

    // Verify metrics structure
    if (!metrics) {
      return NextResponse.json({ error: "Metrics are required" }, { status: 400 });
    }

    const lang = validatedSprint.data.offer.promisedOutcome.match(/[а-яА-Я]/) ? "ru" : "en";

    // Check if API key is not defined, or is dummy, to return demo data
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
      console.log("Using demo fallback for weekly review (no API key configured).");
      return NextResponse.json(getDemoReview(lang, metrics));
    }

    const systemPrompt = WEEKLY_REVIEW_SYSTEM_PROMPT;
    const userPrompt = formatWeeklyReviewUserPrompt(
      validatedSprint.data,
      metrics,
      userNotes
    );

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedJson = JSON.parse(content);
    const validatedReview = reviewSchema.safeParse(parsedJson);

    if (!validatedReview.success) {
      console.error("AI review response failed Zod validation:", validatedReview.error);
      return NextResponse.json(parsedJson);
    }

    return NextResponse.json(validatedReview.data);
  } catch (error: any) {
    console.error("Error in weekly-review API:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly review", message: error.message },
      { status: 500 }
    );
  }
}
