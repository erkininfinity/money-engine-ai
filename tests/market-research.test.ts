import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/market-research/route";

describe("Market Research API Endpoint", () => {
  it("should return 400 if niche or location is missing", async () => {
    const req = new Request("http://localhost:3000/api/market-research", {
      method: "POST",
      body: JSON.stringify({ niche: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("required");
  });

  it("should generate a structured market research report for CIS location (Russian)", async () => {
    const req = new Request("http://localhost:3000/api/market-research", {
      method: "POST",
      body: JSON.stringify({
        niche: "CRM integration",
        location: "Astana, Kazakhstan",
        language: "ru",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.niche).toBe("CRM integration");
    expect(data.location).toBe("Astana, Kazakhstan");
    expect(data.averagePriceRange).toContain("KZT");
    expect(data.outreachNorms).toContain("WhatsApp");
    expect(data.directories.some((d: string) => d.includes("2ГИС"))).toBe(true);
  });

  it("should generate a structured market research report for Western location (English)", async () => {
    const req = new Request("http://localhost:3000/api/market-research", {
      method: "POST",
      body: JSON.stringify({
        niche: "Sales Audit",
        location: "London, UK",
        language: "en",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.niche).toBe("Sales Audit");
    expect(data.location).toBe("London, UK");
    expect(data.averagePriceRange).toContain("USD");
    expect(data.outreachNorms).toContain("LinkedIn");
    expect(data.directories.some((d: string) => d.includes("Google Maps"))).toBe(true);
  });
});
