import { describe, it, expect } from "vitest";
import { generateICS } from "../src/lib/exporters/calendar";
import { RevenueSprint } from "../src/lib/schemas/sprint";

const mockSprint: RevenueSprint = {
  id: "test-sprint-id-123",
  title: "B2B Outreach Sprint",
  goal: "Sign 1 client in 7 days",
  hypothesis: "Cold outreach to salon owners will yield 1 sign-up",
  targetAudience: "Salons",
  offer: {
    name: "Salon Automation Pack",
    targetCustomer: "Salon Owners",
    painfulProblem: "High reply latency",
    promisedOutcome: "Auto-replies in 5 minutes",
    timeframe: "7 days",
    mechanism: "Make.com hook",
    deliverables: ["Deliverable A"],
    exclusions: ["Exclusion B"],
    priceRange: "100,000 KZT",
    proofNeeded: ["Mystery Shopping"],
    trustBuilders: ["Demo"],
    objections: ["Ban risk"],
    callToAction: "Book a call"
  },
  channelPlan: {
    primaryChannel: "Instagram DM",
    secondaryChannel: "WhatsApp",
    whyThisChannel: "They are highly active on IG",
    dailyOutreachLimit: 15,
    firstProspectListInstructions: ["Find 15 salons on IG"],
    personalizationRules: ["Use owner name"]
  },
  dailyActions: [
    {
      day: 1,
      objective: "Build prospect list",
      timeEstimateMinutes: 60,
      expectedOutput: "15 qualified leads in CRM",
      actions: ["Search Instagram tags", "Log username and follower count"]
    },
    {
      day: 2,
      objective: "Send outreach wave 1",
      timeEstimateMinutes: 90,
      expectedOutput: "15 customized DMs sent",
      actions: ["Personalize greeting", "Send pitch script"]
    }
  ],
  outreachMessages: [
    {
      label: "Initial Pitch",
      type: "cold_dm",
      content: "Hello {{name}}, we can automate your salon replies.",
      instructions: "Keep it under 200 characters."
    }
  ],
  reviewQuestions: ["How many replied?", "What was the blocker?"],
  nextExperimentOptions: ["Try WhatsApp automation instead"]
};

describe("Calendar Exporter (ICS)", () => {
  it("should generate valid RFC 5545 VCALENDAR wrapper", () => {
    const ics = generateICS(mockSprint);
    
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Money Engine AI//Sprint Calendar//EN");
    expect(ics).toContain("CALSCALE:GREGORIAN");
    expect(ics).toContain("METHOD:PUBLISH");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("should generate VEVENT block for each daily action", () => {
    const ics = generateICS(mockSprint);
    
    // Count occurrences of BEGIN:VEVENT and END:VEVENT
    const beginEvents = ics.match(/BEGIN:VEVENT/g) || [];
    const endEvents = ics.match(/END:VEVENT/g) || [];
    
    expect(beginEvents.length).toBe(2);
    expect(endEvents.length).toBe(2);
  });

  it("should use local floating timezone dates (no trailing Z or TZID)", () => {
    const ics = generateICS(mockSprint);
    
    // DTSTART for Day 1 should be scheduled at 9:00 AM floating: DTSTART:YYYYMMDDT090000
    // DTSTART should match pattern: DTSTART:\d{8}T090000
    const dtstartPattern = /DTSTART:\d{8}T090000/;
    expect(ics).toMatch(dtstartPattern);

    // Let's assert there's no timezone suffix on DTSTART
    const dtstartLines = ics.split("\r\n").filter(l => l.startsWith("DTSTART:"));
    dtstartLines.forEach(line => {
      // Must not end with Z or contain TZID
      expect(line).not.toContain("Z");
      expect(line).not.toContain("TZID");
    });
  });

  it("should correctly populate description with objective and action items", () => {
    const ics = generateICS(mockSprint);
    
    expect(ics).toContain("SUMMARY:Day 1: Build prospect list");
    expect(ics).toContain("DESCRIPTION:Objective: Build prospect list");
    expect(ics).toContain("Expected Output: 15 qualified leads in CRM");
    expect(ics).toContain("1. Search Instagram tags");
    expect(ics).toContain("2. Log username and follower count");
  });

  it("should calculate correct end times based on estimated minutes", () => {
    const ics = generateICS(mockSprint);
    
    // Day 1 has 60 minutes.
    // DTSTART: 09:00:00 -> DTEND: 10:00:00 (i.e. T100000)
    // Day 2 has 90 minutes.
    // DTSTART: 09:00:00 -> DTEND: 10:30:00 (i.e. T103000)
    expect(ics).toMatch(/DTEND:\d{8}T100000/);
    expect(ics).toMatch(/DTEND:\d{8}T103000/);
  });
});
