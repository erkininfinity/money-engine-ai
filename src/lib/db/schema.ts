import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  location: text("location"),
  language: text("language").notNull(), // "en" | "ru"
  targetMonthlyIncome: integer("target_monthly_income"),
  skills: text("skills").notNull(), // JSON string
  pastExperience: text("past_experience").notNull(), // JSON string
  availableHoursPerWeek: integer("available_hours_per_week").notNull(),
  startupBudgetLevel: text("startup_budget_level").notNull(), // "none" | "low" | "medium"
  audienceAccess: text("audience_access").notNull(), // JSON string
  salesComfortLevel: text("sales_comfort_level").notNull(), // "low" | "medium" | "high"
  preferredWorkType: text("preferred_work_type").notNull(),
  constraints: text("constraints").notNull(), // JSON string
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sprints = sqliteTable("sprints", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  hypothesis: text("hypothesis").notNull(),
  status: text("status").notNull(), // "planned" | "active" | "completed"
  offer: text("offer").notNull(), // JSON string (OfferDraft)
  channelPlan: text("channel_plan").notNull(), // JSON string (ChannelPlan)
  dailyActions: text("daily_actions").notNull(), // JSON string (SprintDay[])
  outreachMessages: text("outreach_messages").notNull(), // JSON string (OutreachMessage[])
  metrics: text("metrics"), // JSON string (SprintMetrics) - null until completed
  reviewQuestions: text("review_questions").notNull(), // JSON string (string[])
  nextExperimentOptions: text("next_experiment_options").notNull(), // JSON string (string[])
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  sprintId: text("sprint_id")
    .notNull()
    .references(() => sprints.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  whatWorked: text("what_worked").notNull(), // JSON string
  whatDidNotWork: text("what_did_not_work").notNull(), // JSON string
  bottleneck: text("bottleneck").notNull(), // "prospecting" | "message" | "offer" | "trust" | "pricing" | "sales_call" | "delivery" | "unknown"
  evidence: text("evidence").notNull(), // JSON string (string[])
  recommendation: text("recommendation").notNull(),
  nextSprint: text("next_sprint").notNull(), // JSON string (keep/change/test)
  createdAt: integer("created_at").notNull(),
});
