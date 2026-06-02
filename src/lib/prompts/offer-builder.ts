import { FounderProfileLite } from "../schemas/profile";
import { GeneratedPath } from "../schemas/path-generation";

export const OFFER_BUILDER_SYSTEM_PROMPT = `You are the Offer Builder intelligence in Money Engine AI. Your task is to turn a selected B2B revenue path and a founder profile into a high-converting, ethical B2B offer.

CRITICAL RULES:
1. No false claims or fake reviews/case studies.
2. The offer must be specific, testable, and bounded.
3. Exclude complex, unmanageable work (e.g. custom coding if the founder is a no-code developer, or 24/7 support if they only have 10 hours/week).
4. LOCALIZATION: All pricing models and currencies MUST match the user's Default Currency. Suggest price values that align realistically with the user's region and currency (e.g. KZT, USD, EUR, etc.). Fully respect and integrate any 'Local Market Research Notes' provided.
5. STRICT OUTPUT LANGUAGE: If the profile language is "ru", translate the entire JSON output values to Russian. If "en", generate in English.
6. Return a valid JSON object matching the requested schema. Do not include markdown wraps.`;

export function formatOfferBuilderUserPrompt(
  profile: FounderProfileLite,
  selectedPath: GeneratedPath
): string {
  const currencyStr = profile.currency || "KZT";
  const researchStr = profile.marketResearchNotes 
    ? `\n- Local Market Research Notes: ${profile.marketResearchNotes}` 
    : "";

  return `Founder Profile:
- Skills: ${profile.skills.join(", ")}
- Available Hours Per Week: ${profile.availableHoursPerWeek}
- Startup Budget Level: ${profile.startupBudgetLevel}
- Constraints: ${profile.constraints.join("\n  ")}
- Default Currency: ${currencyStr}${researchStr}

Selected Revenue Path:
- Name: ${selectedPath.name}
- Category: ${selectedPath.category}
- Target Customers: ${selectedPath.targetCustomers.join(", ")}
- Pain: ${selectedPath.pain}
- Initial Offer Idea: ${selectedPath.firstOfferExample}

Based on this, construct a detailed Offer Draft. Match the following JSON schema:
{
  "name": "Offer Name (e.g., 48-Hour AI Workflow Diagnostics)",
  "targetCustomer": "Specific B2B Target Customer",
  "painfulProblem": "The specific painful problem being solved",
  "promisedOutcome": "The clear outcome of the offer",
  "timeframe": "Delivery timeframe (e.g., 48 Hours, 7 Days)",
  "mechanism": "The method or tools used (e.g., Make.com integration)",
  "deliverables": ["Deliverable 1", "Deliverable 2"],
  "exclusions": ["Exclude item 1", "Exclude item 2"],
  "priceRange": "Realistic price range in local currency (e.g., 49,000 - 99,000 ${currencyStr})",
  "proofNeeded": ["Specific proof or case study style needed to sell this"],
  "trustBuilders": ["Ethical trust building steps (e.g. recording a 3-minute video analysis of one process)"],
  "objections": ["Objection 1 and how the founder should answer it"],
  "callToAction": "Clear, low-friction call to action (e.g. Let's do a free 15-minute process audit)"
}`;
}
