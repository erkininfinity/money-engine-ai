import { describe, it, expect } from "vitest";

// Replication of calculations in page.tsx
function calculateFunnel(prospectsList: any[]) {
  const listedCount = prospectsList.length;
  const contactedCount = prospectsList.filter((p) => p.status !== "identified").length;
  const repliedCount = prospectsList.filter((p) => !["identified", "contacted"].includes(p.status)).length;
  const meetingCount = prospectsList.filter((p) => ["meeting_booked", "offer_sent", "paid"].includes(p.status)).length;
  const offerCount = prospectsList.filter((p) => ["offer_sent", "paid"].includes(p.status)).length;
  const paidCount = prospectsList.filter((p) => p.status === "paid").length;

  const replyRate = contactedCount > 0 ? Math.round((repliedCount / contactedCount) * 100) : 0;
  const meetingRate = repliedCount > 0 ? Math.round((meetingCount / repliedCount) * 100) : 0;
  const offerRate = meetingCount > 0 ? Math.round((offerCount / meetingCount) * 100) : 0;
  const closingRate = offerCount > 0 ? Math.round((paidCount / offerCount) * 100) : 0;

  return {
    listedCount,
    contactedCount,
    repliedCount,
    meetingCount,
    offerCount,
    paidCount,
    replyRate,
    meetingRate,
    offerRate,
    closingRate,
  };
}

describe("B2B Funnel Calculations", () => {
  it("should calculate correct rates for an empty funnel", () => {
    const results = calculateFunnel([]);
    expect(results.listedCount).toBe(0);
    expect(results.replyRate).toBe(0);
    expect(results.meetingRate).toBe(0);
    expect(results.offerRate).toBe(0);
    expect(results.closingRate).toBe(0);
  });

  it("should calculate correct counts and rates for a standard list", () => {
    const list = [
      { status: "identified" },
      { status: "contacted" },
      { status: "replied" },
      { status: "meeting_booked" },
      { status: "offer_sent" },
      { status: "paid" },
      { status: "paid" },
    ];

    const results = calculateFunnel(list);
    // Total listed = 7
    expect(results.listedCount).toBe(7);
    // Contacted: status !== "identified" -> 6 (contacted, replied, meeting, offer, paid, paid)
    expect(results.contactedCount).toBe(6);
    // Replied: status not in (identified, contacted) -> 5 (replied, meeting, offer, paid, paid)
    expect(results.repliedCount).toBe(5);
    // Meetings: meeting, offer, paid, paid -> 4
    expect(results.meetingCount).toBe(4);
    // Offers: offer, paid, paid -> 3
    expect(results.offerCount).toBe(3);
    // Paid: paid, paid -> 2
    expect(results.paidCount).toBe(2);

    // Rates:
    // Reply rate: 5 / 6 = 83%
    expect(results.replyRate).toBe(83);
    // Meeting rate: 4 / 5 = 80%
    expect(results.meetingRate).toBe(80);
    // Offer rate: 3 / 4 = 75%
    expect(results.offerRate).toBe(75);
    // Closing rate: 2 / 3 = 67%
    expect(results.closingRate).toBe(67);
  });
});
