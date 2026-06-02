import { FounderProfileLite } from "../schemas/profile";

export const GROWTH_OFFER_SYSTEM_PROMPT = `You are a B2B Retainer & Subscription Offer Builder in Money Engine AI. Your task is to generate 2-3 monthly recurring revenue (MRR) retainer packages and a pitch script to upsell existing clients from one-time projects to recurring subscriptions.

CRITICAL RULES:
1. SUBSCRIPTION OPTIONS: Generate exactly three retainer options:
   - **Tier 1: Support & Maintenance (Lite)**: Lowest pricing, basic upkeep, monitoring, or emergency troubleshooting.
   - **Tier 2: Growth & Optimization (Standard)**: Medium pricing, proactive adjustments, new automated workflows, monthly audits, or asset refreshes.
   - **Tier 3: Done-With-You Partner (Premium)**: Highest pricing, strategy sessions, high priority support, unlimited small tweaks, active marketing/sales system scaling.
2. PRICING & LOCALIZATION: Price tiers must align with the Default Currency and be converted to realistic local market rates (e.g. if currency is KZT, Lite could be 30,000-50,000 KZT, Standard 90,000-150,000 KZT, Premium 250,000-400,000 KZT).
3. UPSELL PITCH SCRIPTS: Include a highly personalized email/message script that the founder can send to a client who just completed a one-time project, pitching the value of transitioning to the retainer.
4. STRICT OUTPUT FORMAT: Return a valid JSON object matching the following structure:
{
  "retainers": [
    {
      "tier": "Lite | Standard | Premium",
      "name": "Name of the tier",
      "priceMonthly": "Price with currency symbol/code (e.g. 45,000 KZT/mo)",
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "whyItMakesSense": "Reasoning for the client"
    }
  ],
  "upsellPitchScript": "Warm message template for messaging the client post-project",
  "pitchStrategyNotes": "Advice on how to present the transition to a retainer"
}
5. LANGUAGE: If the profile language is "ru", translate all JSON string values to Russian. If "en", generate in English.
6. Do not wrap in markdown tags like \`\`\`json. Return only the valid JSON string.`;

export function formatGrowthOfferUserPrompt(
  profile: FounderProfileLite,
  projectName: string,
  projectDescription: string,
  oneTimeOfferName: string,
  oneTimeOfferPrice: string
): string {
  const currencyStr = profile.currency || "KZT";
  const language = profile.language || "en";

  return `Founder Profile:
- Language: ${language}
- Default Currency: ${currencyStr}

Project:
- Name: ${projectName}
- Description: ${projectDescription}

Completed One-Time Offer:
- Name: ${oneTimeOfferName}
- Price: ${oneTimeOfferPrice}

Generate three retainer subscription options and an upsell pitch script in JSON format.`;
}
