import { FounderProfileLite } from "../schemas/profile";
import { GeneratedPath } from "../schemas/path-generation";
import { OfferDraft } from "../schemas/offer";

export const SPRINT_GENERATOR_SYSTEM_PROMPT = `You are the Sprint Generator intelligence in Money Engine AI. Your task is to generate a complete 7-day revenue sprint plan and outreach scripts.

CRITICAL RULES:
1. SPECIFICITY: Daily tasks must not be generic like "find clients". Instead, define a precise amount of actions (e.g. "Find 15 local dental clinics in Astana using Instagram and Google Maps").
2. TIME-BOUND: Daily tasks must fit into the founder's available hours. Do not schedule tasks that take more time than they have.
3. NO SPAM IN OUTREACH: Messages must be personal, short (1-2 paragraphs), respectful, asking permission before sharing details, and suggesting honest trust builders (like a free audit or diagnostic mystery test).
4. LOCALIZATION & CHANNELS: Schedule outreach and list-building actions specifically using tools and sources that are valid for the user's region. If the location is in the CIS (Kazakhstan/Russia), direct outreach should rely on WhatsApp or Instagram DM (as email is rarely used for B2B there), and directories like 2GIS should be recommended. For Western users, use LinkedIn/Email. All pricing information must match the Default Currency specified. Fully respect and integrate 'Local Market Research Notes' if provided.
5. GROWTH MODE INTEGRATION: If the generated sprint is under "growth" mode, ensure the daily action steps include Customer Success checklists (confirming setup success, reviewing client satisfaction, scheduling a quick check-in call) and the generated outreach scripts include Referral Loops (asking paid/happy clients for warm introductions or recommendations to similar businesses).
6. STRICT OUTPUT LANGUAGE: If the profile language is "ru", translate the entire JSON output values to Russian. If "en", generate in English.
7. Return a valid JSON object matching the requested schema. Do not include markdown wraps.`;

export function formatSprintGeneratorUserPrompt(
  profile: FounderProfileLite,
  selectedPath: GeneratedPath,
  offer: OfferDraft,
  mode: "mvp" | "growth" = "mvp"
): string {
  const currencyStr = profile.currency || "KZT";
  const researchStr = profile.marketResearchNotes 
    ? `\n- Local Market Research Notes: ${profile.marketResearchNotes}` 
    : "";

  return `Founder Profile:
- Skills: ${profile.skills.join(", ")}
- Available Hours Per Week: ${profile.availableHoursPerWeek}
- Startup Budget Level: ${profile.startupBudgetLevel}
- Sales Comfort Level: ${profile.salesComfortLevel}
- Audience Access: ${profile.audienceAccess.join(", ")}
- Constraints: ${profile.constraints.join("\n  ")}
- Default Currency: ${currencyStr}${researchStr}
- Sprint Mode: ${mode}

Selected Path:
- Name: ${selectedPath.name}
- First Channels: ${selectedPath.firstChannels.join(", ")}

Offer:
- Name: ${offer.name}
- Target Customer: ${offer.targetCustomer}
- Pain: ${offer.painfulProblem}
- Outcome: ${offer.promisedOutcome}
- Timeframe: ${offer.timeframe}
- Deliverables: ${offer.deliverables.join(", ")}
- Price: ${offer.priceRange}
- CTA: ${offer.callToAction}

Based on this, generate a complete 7-day Sprint Plan. Match the following JSON schema:
{
  "title": "Short title of the sprint (e.g., WhatsApp Lead Auto-Response Sprint in Astana)",
  "goal": "Clear objective of the sprint (e.g. Secure 1 paid setup client)",
  "hypothesis": "Clear validation hypothesis (e.g. Local clinics respond too slowly to Instagram DMs and will buy a 5-minute auto-reply setup if shown the lag)",
  "offer": {
    "name": "${offer.name}",
    "targetCustomer": "${offer.targetCustomer}",
    "painfulProblem": "${offer.painfulProblem}",
    "promisedOutcome": "${offer.promisedOutcome}",
    "timeframe": "${offer.timeframe}",
    "mechanism": "${offer.mechanism}",
    "deliverables": ${JSON.stringify(offer.deliverables)},
    "exclusions": ${JSON.stringify(offer.exclusions)},
    "priceRange": "${offer.priceRange}",
    "proofNeeded": ${JSON.stringify(offer.proofNeeded)},
    "trustBuilders": ${JSON.stringify(offer.trustBuilders)},
    "objections": ${JSON.stringify(offer.objections)},
    "callToAction": "${offer.callToAction}"
  },
  "targetAudience": "Specific target buyers",
  "channelPlan": {
    "primaryChannel": "Primary outreach channel",
    "secondaryChannel": "Secondary channel or optional",
    "whyThisChannel": "Reason for selection matching founder constraints",
    "firstProspectListInstructions": ["Instructions on how to compile the list of prospects on Day 1"],
    "dailyOutreachLimit": 5, // A low, manual limit (e.g., 5-15) based on sales comfort and available hours
    "personalizationRules": ["How to customize each message"],
    "complianceNotes": ["Compliance rules (e.g., no double messages, respect opt-outs)"]
  },
  "dailyActions": [
    {
      "day": 1,
      "objective": "Objective name",
      "actions": ["Action 1", "Action 2"],
      "expectedOutput": "Expected output of Day 1",
      "timeEstimateMinutes": 90 // Should be realistic and sum up to weekly limit
    },
    { "day": 2, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 60 },
    { "day": 3, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 60 },
    { "day": 4, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 60 },
    { "day": 5, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 90 },
    { "day": 6, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 60 },
    { "day": 7, "objective": "...", "actions": [], "expectedOutput": "...", "timeEstimateMinutes": 60 }
  ],
  "outreachMessages": [
    {
      "type": "warm_contact | referral_request | cold_personal | follow_up | customer_success_check_in | referral_ask",
      "label": "Short description of the script usage",
      "content": "Template text with placeholders like [Name]",
      "instructions": "How to personalize and when to send"
    }
  ],
  "reviewQuestions": [
    "Question 1 to ask during review (e.g. Did prospects reply?)",
    "Question 2 (e.g. Did they object to the price?)"
  ],
  "nextExperimentOptions": [
    "Action to take if this fails (e.g. Narrow down the target industry)",
    "Action if it succeeds (e.g. Pitch a monthly recurring retainer)"
  ]
}`;
}
