import { describe, it, expect, beforeAll } from "vitest";
import { POST } from "../src/app/api/webhook/route";
import { db, projects, prospects } from "../src/lib/db";
import { eq, and } from "drizzle-orm";

describe("Webhook API Route (CRM Sync & Webhooks)", () => {
  const testProjectId = crypto.randomUUID();

  beforeAll(async () => {
    // Clean up any old test records for this project ID to ensure isolation
    await db.delete(prospects).where(eq(prospects.projectId, testProjectId));
    await db.delete(projects).where(eq(projects.id, testProjectId));

    // Insert a test project to satisfy foreign key constraints
    await db.insert(projects).values({
      id: testProjectId,
      name: "Test Project for Webhooks",
      description: "Testing CRM automation sync features",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  it("should fail incoming webhook if no valid data is provided", async () => {
    const req = new Request("http://localhost:3000/api/webhook", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should sync a single prospect via incoming webhook", async () => {
    const contactInfo = "test-contact-unique-1@example.com";
    const req = new Request("http://localhost:3000/api/webhook", {
      method: "POST",
      body: JSON.stringify({
        projectId: testProjectId,
        name: "Test Lead 1",
        contactInfo: contactInfo,
        status: "contacted",
        notes: "First touch completed via webhook",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.processedCount).toBe(1);
    expect(data.prospects[0].action).toBe("insert");

    // Verify it exists in DB
    const dbRecord = await db.select().from(prospects).where(
      and(
        eq(prospects.projectId, testProjectId),
        eq(prospects.contactInfo, contactInfo)
      )
    );
    expect(dbRecord.length).toBe(1);
    expect(dbRecord[0].name).toBe("Test Lead 1");
    expect(dbRecord[0].status).toBe("contacted");
  });

  it("should update a prospect on contactInfo conflict", async () => {
    const contactInfo = "test-contact-unique-1@example.com";
    const req = new Request("http://localhost:3000/api/webhook", {
      method: "POST",
      body: JSON.stringify({
        projectId: testProjectId,
        name: "Test Lead 1 Updated",
        contactInfo: contactInfo,
        status: "replied",
        notes: "Lead replied to our message",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.prospects[0].action).toBe("update");

    // Verify update in DB
    const dbRecord = await db.select().from(prospects).where(
      and(
        eq(prospects.projectId, testProjectId),
        eq(prospects.contactInfo, contactInfo)
      )
    );
    expect(dbRecord.length).toBe(1);
    expect(dbRecord[0].name).toBe("Test Lead 1 Updated");
    expect(dbRecord[0].status).toBe("replied");
  });

  it("should bulk upsert prospects via array payload", async () => {
    const contactA = "bulk-unique-a@example.com";
    const contactB = "bulk-unique-b@example.com";

    const req = new Request("http://localhost:3000/api/webhook", {
      method: "POST",
      body: JSON.stringify({
        projectId: testProjectId,
        prospects: [
          {
            name: "Bulk Lead A",
            contactInfo: contactA,
            status: "identified",
          },
          {
            name: "Bulk Lead B",
            contactInfo: contactB,
            status: "paid",
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.processedCount).toBe(2);

    const dbRecordA = await db.select().from(prospects).where(
      and(
        eq(prospects.projectId, testProjectId),
        eq(prospects.contactInfo, contactA)
      )
    );
    const dbRecordB = await db.select().from(prospects).where(
      and(
        eq(prospects.projectId, testProjectId),
        eq(prospects.contactInfo, contactB)
      )
    );

    expect(dbRecordA.length).toBe(1);
    expect(dbRecordB.length).toBe(1);
    expect(dbRecordB[0].status).toBe("paid");
  });
});
