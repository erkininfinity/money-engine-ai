import { RevenueSprint } from "@/lib/schemas/sprint";

export function generateICS(sprint: RevenueSprint): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Money Engine AI//Sprint Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  sprint.dailyActions.forEach((dayAction) => {
    // Schedule at 9:00 AM local time of each day
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + (dayAction.day - 1));
    
    // Set DTSTART to 09:00:00
    eventDate.setHours(9, 0, 0, 0);
    const dtstartStr = eventDate.getFullYear() + 
      String(eventDate.getMonth() + 1).padStart(2, '0') + 
      String(eventDate.getDate()).padStart(2, '0') + "T090000";

    // Set DTEND (add timeEstimateMinutes)
    const durationMin = dayAction.timeEstimateMinutes || 90;
    const endDate = new Date(eventDate.getTime() + durationMin * 60 * 1000);
    const dtendStr = endDate.getFullYear() + 
      String(endDate.getMonth() + 1).padStart(2, '0') + 
      String(endDate.getDate()).padStart(2, '0') + "T" + 
      String(endDate.getHours()).padStart(2, '0') + 
      String(endDate.getMinutes()).padStart(2, '0') + "00";

    const uid = `${sprint.id || "sprint"}-day-${dayAction.day}-${eventDate.getTime()}@moneyengineai.local`;
    
    const summary = `Day ${dayAction.day}: ${dayAction.objective}`;
    const description = `Objective: ${dayAction.objective}\\n\\n` +
      `Expected Output: ${dayAction.expectedOutput || "None"}\\n\\n` +
      `Actions:\\n` +
      dayAction.actions.map((act, i) => `${i + 1}. ${act}`).join("\\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${dtstartStr}`);
    lines.push(`DTEND:${dtendStr}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  // RFC 5545 lines must be separated by CRLF (\r\n)
  return lines.join("\r\n");
}
