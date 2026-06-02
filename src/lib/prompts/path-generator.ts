import { FounderProfileLite } from "../schemas/profile";
import { RevenuePlaybook } from "../schemas/playbook";

export const PATH_GENERATOR_SYSTEM_PROMPT = `You are the core intelligence engine of Money Engine AI. Your task is to recommend 3-5 potential B2B revenue paths for a founder based on their profile and a set of seed playbooks.

CRITICAL RULES:
1. Position as a PRE-CRM system: recommend service-first revenue experiments that can be started manually in 7 days, not large scale business ideas.
2. NO SPAM: Recommend only ethical, personalized warm/referral/expert-community outreach channels. Never recommend bulk automation, scrapers, or mass email/DMing.
3. NO FAKE PROOF: Do not suggest generating fake reviews, credentials, or case studies. Suggest low-price or free diagnostic audits if the user lacks experience.
4. LOCAL PRICING & LOCALIZATION: Never promise income. All recommended price ranges, target monthly income goals, and currencies MUST match the user's Default Currency. Convert seed playbook price values realistically to match the region (e.g. if currency is KZT, suggest pricing like 100,000 KZT; if USD, suggest $300-$1000). Adapt outreach channels to the regional location: if location is in the CIS (e.g. Kazakhstan, Russia), recommend WhatsApp/Telegram as business communication norms, whereas for USA/Europe, suggest LinkedIn or personalized email. Fully respect and integrate any 'Local Market Research Notes' provided.
5. STRICT OUTPUT LANGUAGE: If the founder's profile language is "ru", generate all visible texts (names, pains, examples, descriptions, explanations) in Russian. If "en", generate in English.
6. Return a valid JSON object matching the requested schema. Do not include markdown wraps like \`\`\`json.`;

export function formatPathGeneratorUserPrompt(
  profile: FounderProfileLite,
  seedPlaybooks: RevenuePlaybook[]
): string {
  const serializedPlaybooks = seedPlaybooks
    .map(
      (pb) => `- Playbook: "${pb.name}" (${pb.category})
  Pain solved: ${pb.painfulProblem}
  First Offer: ${pb.firstOffer.name} - ${pb.firstOffer.promise}
  Price range: ${pb.priceRange.min}-${pb.priceRange.max} ${pb.priceRange.currency}`
    )
    .join("\n\n");

  const currencyStr = profile.currency || "KZT";
  const researchStr = profile.marketResearchNotes 
    ? `\n- Local Market Research Notes: ${profile.marketResearchNotes}` 
    : "";

  return `Founder Profile:
- Location: ${profile.location || "Not specified"}
- Language: ${profile.language}
- Default Currency: ${currencyStr}
- Target Monthly Income: ${profile.targetMonthlyIncome || "Not specified"} ${currencyStr}${researchStr}
- Skills: ${profile.skills.join(", ")}
- Past Experience: ${profile.pastExperience.join("\n  ")}
- Available Hours Per Week: ${profile.availableHoursPerWeek}
- Startup Budget Level: ${profile.startupBudgetLevel}
- Audience Access: ${profile.audienceAccess.join(", ")}
- Sales Comfort Level: ${profile.salesComfortLevel}
- Preferred Work Type: ${profile.preferredWorkType}
- Constraints: ${profile.constraints.join("\n  ")}

Seed Playbooks (Use these as reference templates or adapt them to match the founder's skills and local market):
${serializedPlaybooks}

Based on this, generate 3 to 5 B2B Revenue Paths. Match the following JSON schema:
{
  "paths": [
    {
      "id": "unique-slug-id",
      "name": "Specific Name of the B2B Service (e.g. AI Workflow Audit for Real Estate)",
      "category": "diagnostic_offer | productized_service | implementation_service | consulting | local_business",
      "targetCustomers": ["Specific ICP 1", "Specific ICP 2"],
      "pain": "Description of the specific client pain solved",
      "firstOfferExample": "I help [ICP] solve [pain] in [timeframe] through [mechanism] without [obstacle]",
      "score": {
        "total": 0, // Set to 0, it will be calculated by our scoring engine
        "speedToFirstRevenue": 1-10 value,
        "abilityToReachBuyers": 1-10 value,
        "founderFit": 1-10 value,
        "painUrgency": 1-10 value,
        "lowStartupCost": 1-10 value,
        "executionSimplicity": 1-10 value,
        "whyThisScore": ["Explanations for the scores"],
        "biggestRisk": "The main risk or bottleneck for the founder in this path",
        "fastestValidationStep": "The single fastest action to check if anyone wants this"
      },
      "risks": ["Risk 1", "Risk 2"],
      "firstChannels": ["Ethical channel 1", "Ethical channel 2"],
      "nextSteps": ["First step", "Second step"]
    }
  ]
}`;
}
