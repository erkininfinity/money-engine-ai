import { NextResponse } from "next/server";
import { openai, openaiModel } from "@/lib/ai/openai";
import { profileSchema } from "@/lib/schemas/profile";
import { generatedPathSchema } from "@/lib/schemas/path-generation";
import { offerSchema } from "@/lib/schemas/offer";
import { sprintSchema } from "@/lib/schemas/sprint";
import {
  SPRINT_GENERATOR_SYSTEM_PROMPT,
  formatSprintGeneratorUserPrompt,
} from "@/lib/prompts/sprint-generator";

function getDemoSprint(language: "ru" | "en", offer: any) {
  if (language === "ru") {
    return {
      title: "Быстрый аудит лид-форм для салонов красоты в Астане",
      goal: "Получить 1 платного клиента на услугу настройки автоответа WhatsApp за 7 дней.",
      hypothesis: "Локальные салоны красоты теряют клиентов из-за ответа администратора дольше 30 минут. Демонстрация их собственной задержки в ответе (mystery shop) побудит их заказать настройку экспресс-отклика.",
      offer: offer,
      targetAudience: "Владельцы салонов красоты и спа в г. Астана",
      channelPlan: {
        primaryChannel: "Instagram Direct (ручной аутрич)",
        secondaryChannel: "Локальные Telegram-сообщества предпринимателей",
        whyThisChannel: "Высокая концентрация местных салонов в Instagram и возможность лично замерить скорость ответа без банов.",
        firstProspectListInstructions: [
          "Использовать Instagram поиск по хэштегам #салонкрасотыастана и #салонастана",
          "Выбрать 15 профилей с активной рекламой или постами за последнюю неделю",
          "Записать название, ссылку и контактный телефон в таблицу"
        ],
        dailyOutreachLimit: 10,
        personalizationRules: [
          "Начинать переписку как клиент, чтобы замерить реальное время ответа",
          "Отправлять результаты замера вежливо, без критики, предлагая бесплатную схему"
        ],
        complianceNotes: [
          "Не писать повторно при отсутствии ответа",
          "Не обещать 100% конверсию, говорить об уменьшении оттока клиентов"
        ]
      },
      dailyActions: [
        {
          day: 1,
          objective: "Сбор списка контактов",
          actions: [
            "Найти 15 салонов красоты в Instagram по г. Астана",
            "Записать ссылки на аккаунты в Google Таблицу"
          ],
          expectedOutput: "Таблица с 15 активными аккаунтами местных салонов красоты",
          timeEstimateMinutes: 90
        },
        {
          day: 2,
          objective: "Проведение теста Mystery Shopping",
          actions: [
            "Отправить в директ 15 салонов сообщение: 'Здравствуйте! Есть ли свободные окна на стрижку/уход на этой неделе?'",
            "Зафиксировать точное время отправки и время ответа администратора"
          ],
          expectedOutput: "Заполненные данные по скорости ответов в таблице",
          timeEstimateMinutes: 60
        },
        {
          day: 3,
          objective: "Отправка диагностических отчетов",
          actions: [
            "Написать персонализированные сообщения салонам с результатом (для тех, кто ответил дольше 15 минут)",
            "Спросить разрешения отправить 3 простых шага по автоматизации этой формы"
          ],
          expectedOutput: "Отправлено 10+ диагностических сообщений",
          timeEstimateMinutes: 120
        },
        {
          day: 4,
          objective: "Пост полезного контента и подписка",
          actions: [
            "Опубликовать в местной группе предпринимателей пост о результатах проверки 15 салонов в Астане",
            "Предложить владельцам поделиться бесплатной схемой в ЛС"
          ],
          expectedOutput: "Один опубликованный экспертный пост, сбор заявок в ЛС",
          timeEstimateMinutes: 90
        },
        {
          day: 5,
          objective: "Проведение демо-созвонов",
          actions: [
            "Созвониться с 2-3 владельцами в Zoom/WhatsApp",
            "Показать наглядно, как работает перенаправление из Instagram в WhatsApp, предложить внедрение за 99,000 KZT"
          ],
          expectedOutput: "Проведено 2 короткие консультации",
          timeEstimateMinutes: 120
        },
        {
          day: 6,
          objective: "Закрытие сделок и предоплата",
          actions: [
            "Ответить на возражения по стоимости и безопасности Meta API",
            "Получить 50% предоплату (49,500 KZT) от 1 клиента"
          ],
          expectedOutput: "Получена 1 предоплата, зафиксирован старт проекта",
          timeEstimateMinutes: 90
        },
        {
          day: 7,
          objective: "Ретроспектива и метрики",
          actions: [
            "Занести фактические метрики в систему",
            "Проанализировать воронку: сколько ответило, сколько согласилось на созвон, сколько оплатило"
          ],
          expectedOutput: "Завершенный спринт, выводы по улучшению оффера",
          timeEstimateMinutes: 60
        }
      ],
      outreachMessages: [
        {
          type: "cold_personal",
          label: "Сообщение с результатами замера скорости ответа (Instagram)",
          content: "Здравствуйте! Вчера я проводил небольшой тест времени ответа для салонов красоты в Астане. Я написал вам как клиент. Ответ занял [X] минут — обычно за это время горячий клиент уже уходит к конкурентам. Я занимаюсь настройкой экспресс-ответов для сферы услуг. Могу я отправить вам короткую схему, как переводить лидов из Instagram в WhatsApp автоматически за 5 минут? Это бесплатно.",
          instructions: "Замените [X] на реальное время ответа. Отправляйте только тем, у кого задержка была более 15 минут."
        },
        {
          type: "follow_up",
          label: "Сообщение после созвона с КП",
          content: "Приветствую, [Имя]! Был рад пообщаться. Отправляю резюме нашей встречи по настройке автоответов. За 7 дней мы: 1) Настроим пересылку из директа в WhatsApp; 2) Подготовим 5 шаблонов ответов; 3) Дадим инструкции для админа. Стоимость настройки: 99,000 KZT. Готовы начать на этой неделе?",
          instructions: "Замените [Имя] на имя владельца салона, отправляйте в WhatsApp в течение 2 часов после звонка."
        }
      ],
      metrics: {
        prospectsListed: 15,
        messagesSent: 15,
        replies: 0,
        callsBooked: 0,
        callsCompleted: 0,
        offersSent: 0,
        paymentsReceived: 0,
        revenueAmount: 0
      },
      reviewQuestions: [
        "Отвечали ли салоны на сообщение тайного покупателя?",
        "Какая была основная причина отказа от бесплатной схемы?",
        "Хватило ли вам 12 часов на выполнение всех задач?"
      ],
      nextExperimentOptions: [
        "Если не было ответов: изменить формулировку Mystery Shop теста на более нейтральную.",
        "Если согласились на схему, но не купили: предложить более дешевый аудит за 49,000 KZT вместо внедрения."
      ]
    };
  } else {
    return {
      title: "Local Business Response Speed Sprint",
      goal: "Secure 1 paid setup client by demonstrating response lag.",
      hypothesis: "Local clinics respond too slowly. Showing them their own lag will motivate them to buy an automated WhatsApp reply setup.",
      offer: offer,
      targetAudience: "Clinic and salon owners in Astana",
      channelPlan: {
        primaryChannel: "Instagram DM outreach",
        secondaryChannel: "Telegram entrepreneurial channels",
        whyThisChannel: "Direct access to owners through social profiles.",
        firstProspectListInstructions: [
          "Search Instagram for hashtags like #astanasalon",
          "Identify 15 local clinics or salons with active ads",
          "Log links in a sheet"
        ],
        dailyOutreachLimit: 10,
        personalizationRules: [
          "Test response times as a customer first",
          "Present findings objectively and politely"
        ],
        complianceNotes: [
          "Do not spam if they decline or don't reply",
          "Focus on showing leaks, not blaming the admin"
        ]
      },
      dailyActions: [
        {
          day: 1,
          objective: "Compile Prospect List",
          actions: [
            "Find 15 salons on Instagram",
            "Log contact links in Google Sheets"
          ],
          expectedOutput: "List of 15 active local leads",
          timeEstimateMinutes: 90
        },
        {
          day: 2,
          objective: "Mystery Shop Leads",
          actions: [
            "Send booking inquiries to the 15 leads",
            "Log exact response times"
          ],
          expectedOutput: "Response time logs in spreadsheet",
          timeEstimateMinutes: 60
        },
        {
          day: 3,
          objective: "Outreach Findings",
          actions: [
            "Message pages who took >15 minutes to reply",
            "Offer to share a 1-page WhatsApp auto-routing diagram"
          ],
          expectedOutput: "10+ diagnostic DMs sent",
          timeEstimateMinutes: 120
        },
        {
          day: 4,
          objective: "Publish Benchmarks",
          actions: [
            "Post anonymous results of your test in entrepreneur forums",
            "Offer the diagram to commenters"
          ],
          expectedOutput: "1 expert post published",
          timeEstimateMinutes: 90
        },
        {
          day: 5,
          objective: "Run Demos",
          actions: [
            "Conduct 2 Zoom walkthroughs showing Make.com setups",
            "Pitch the 99,000 KZT setup service"
          ],
          expectedOutput: "2 demo calls completed",
          timeEstimateMinutes: 120
        },
        {
          day: 6,
          objective: "Close Deals",
          actions: [
            "Resolve objections about WhatsApp number bans",
            "Send payment links and secure 50% deposit"
          ],
          expectedOutput: "1 deposit secured",
          timeEstimateMinutes: 90
        },
        {
          day: 7,
          objective: "Sprint Review",
          actions: [
            "Log sprint metrics and review conversions",
            "Log learnings to adjust next sprint"
          ],
          expectedOutput: "Completed sprint metrics in dashboard",
          timeEstimateMinutes: 60
        }
      ],
      outreachMessages: [
        {
          type: "cold_personal",
          label: "Speed Diagnostic Message (Instagram)",
          content: "Hi! I tested your response time yesterday as a client. It took [X] minutes to reply. Most clients leave for competitors if wait times exceed 15 mins. I build WhatsApp auto-responders that reply in 5 mins. Can I send a quick visual flow showing how it works? No obligations.",
          instructions: "Replace [X] with actual test delay. Send only to pages with >15m response delays."
        }
      ],
      metrics: {
        prospectsListed: 15,
        messagesSent: 15,
        replies: 0,
        callsBooked: 0,
        callsCompleted: 0,
        offersSent: 0,
        paymentsReceived: 0,
        revenueAmount: 0
      },
      reviewQuestions: [
        "Did leads reply to the mystery shop results?",
        "Was the price of 99k KZT acceptable?",
        "Did you execute all tasks within 12 hours?"
      ],
      nextExperimentOptions: [
        "If no replies: rewrite script to make it friendlier.",
        "If calls booked but no sales: offer a free diagnostic audit to build trust."
      ]
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, selectedPath, offer } = body;

    const validatedProfile = profileSchema.safeParse(profile);
    const validatedPath = generatedPathSchema.safeParse(selectedPath);
    const validatedOffer = offerSchema.safeParse(offer);

    if (!validatedProfile.success || !validatedPath.success || !validatedOffer.success) {
      return NextResponse.json(
        { error: "Invalid profile, path, or offer data" },
        { status: 400 }
      );
    }

    // Check if API key is not defined, or is dummy, to return demo data
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy-key") {
      console.log("Using demo fallback for sprint generation (no API key configured).");
      return NextResponse.json(getDemoSprint(validatedProfile.data.language, validatedOffer.data));
    }

    const systemPrompt = SPRINT_GENERATOR_SYSTEM_PROMPT;
    const userPrompt = formatSprintGeneratorUserPrompt(
      validatedProfile.data,
      validatedPath.data,
      validatedOffer.data
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

    // Apply default metrics values on backend if not supplied
    if (!parsedJson.metrics) {
      parsedJson.metrics = {
        prospectsListed: 0,
        messagesSent: 0,
        replies: 0,
        callsBooked: 0,
        callsCompleted: 0,
        offersSent: 0,
        paymentsReceived: 0,
        revenueAmount: 0,
      };
    }

    const validatedSprint = sprintSchema.safeParse(parsedJson);

    if (!validatedSprint.success) {
      console.error("AI sprint response failed Zod validation:", validatedSprint.error);
      return NextResponse.json(parsedJson);
    }

    return NextResponse.json(validatedSprint.data);
  } catch (error: any) {
    console.error("Error in generate-sprint API:", error);
    return NextResponse.json(
      { error: "Failed to generate sprint plan", message: error.message },
      { status: 500 }
    );
  }
}
