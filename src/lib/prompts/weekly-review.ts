import { RevenueSprint, SprintMetrics } from "../schemas/sprint";

export const WEEKLY_REVIEW_SYSTEM_PROMPT = `You are the Lead RevOps & Bottleneck Analytics Engine in Money Engine AI. Your task is to perform an objective, numbers-driven weekly review of a founder's sprint.

BOTTLENECK DETECTION CRITERIA (Follow strictly based on metrics):
1. PROSPECTING: If "prospectsListed" or "messagesSent" is less than 50% of the sprint plan (e.g. they only listed 5 out of 30 prospects).
2. MESSAGE: If they sent plenty of messages, but the reply rate ("replies" / "messagesSent") is below 10%, OR if they got replies but failed to book any calls ("callsBooked" / "replies" is 0).
3. TRUST: If they booked calls, but no-shows or cancellations were high, OR if on calls, customers were extremely skeptical about their skills/claims.
4. OFFER: If they completed multiple calls ("callsCompleted" > 2) but didn't even send any paid offers ("offersSent" / "callsCompleted" is 0) because customers didn't see value.
5. PRICING: If they sent offers, but customers rejected specifically due to price, or they got 0 sales despite high interest.
6. SALES_CALL: If calls completed was high, but the conversion into paid offers was low because the founder felt uncomfortable pitching.
7. DELIVERY: If they got payments, but failed to deliver the promised timeframe or deliverables.
8. UNKNOWN: If there is not enough data to identify.

CRITICAL RULES:
1. Ground everything in numbers. Use specific stats in the "evidence" field (e.g. "Sent 15 messages but got 0 replies, which is a 0% response rate").
2. No generic motivation advice. Focus on what to keep, change, and test.
3. STRICT OUTPUT LANGUAGE: If the sprint/offer language is in Russian or has Russian text, translate the entire JSON output values to Russian. If English, generate in English.
4. Return a valid JSON object matching the requested schema. Do not include markdown wraps.`;

export function formatWeeklyReviewUserPrompt(
  sprint: RevenueSprint,
  metrics: SprintMetrics,
  userNotes: string
): string {
  return `Sprint Plan:
- Title: ${sprint.title}
- Goal: ${sprint.goal}
- Hypothesis: ${sprint.hypothesis}
- Offer Price: ${sprint.offer.priceRange}
- Primary Channel: ${sprint.channelPlan.primaryChannel}

Target Metrics (From Plan):
- Daily Outreach Limit: ${sprint.channelPlan.dailyOutreachLimit} (Target ~${sprint.channelPlan.dailyOutreachLimit * 5} for the sprint)

Actual Metrics Achieved:
- Prospects Listed: ${metrics.prospectsListed}
- Messages Sent: ${metrics.messagesSent}
- Replies: ${metrics.replies}
- Calls Booked: ${metrics.callsBooked}
- Calls Completed: ${metrics.callsCompleted}
- Offers Sent: ${metrics.offersSent}
- Payments Received: ${metrics.paymentsReceived}
- Revenue Amount: ${metrics.revenueAmount}

User Reflections and Customer Objections:
${userNotes || "No reflections provided."}

Based on this, perform the Weekly Review. Match the following JSON schema:
{
  "summary": "Short analytical summary of the week's execution",
  "whatWorked": ["Key positive outcomes (based on facts)"],
  "whatDidNotWork": ["Key shortcomings or blockers"],
  "bottleneck": "prospecting | message | offer | trust | pricing | sales_call | delivery | unknown",
  "evidence": ["Specific data points that support this bottleneck identification"],
  "recommendation": "One clear, actionable primary advice for the next sprint",
  "nextSprint": {
    "keep": ["What tasks or settings to keep"],
    "change": ["What to change (e.g. rewrite hook, narrow target)"],
    "test": ["New validation experiment to run"]
  }
}`;
}
