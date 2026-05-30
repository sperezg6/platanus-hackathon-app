// Hand-written row types mirroring supabase/migrations/0001_init.sql.
// Regenerate with the Supabase CLI/MCP once available if the schema grows.

export type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  contact: string | null;
  created_at: string;
};

export type AppRow = {
  id: string;
  client_id: string;
  name: string;
  base_url: string;
  login_required: boolean;
  browser_profile_id: string | null;
  image_url: string | null;
  created_at: string;
};

export type FeatureRow = {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type TestStep = { description: string; expected?: string };

export type TestSpecRow = {
  id: string;
  feature_id: string;
  title: string;
  steps_json: TestStep[];
  expected_json: string[];
  source: "user" | "generated";
  created_at: string;
};

export type AgentRow = {
  id: string;
  client_id: string | null;
  name: string;
  model_id: string;
  default_feature_id: string | null;
  instructions: string | null;
  status: "idle" | "running" | "disabled";
  memory_actor_id: string | null;
  image_url: string | null;
  runtime_arn: string | null;
  runtime_id: string | null;
  runtime_status: "none" | "provisioning" | "ready" | "failed";
  created_at: string;
};

export type RunStatus = "queued" | "running" | "passed" | "failed" | "error" | "cancelled";
export type RunTrigger = "manual" | "batch" | "rerun" | "scheduled";

/** A job/batch: one agent executes 1..N specs. */
export type RunRow = {
  id: string;
  agent_id: string;
  label: string | null;
  trigger: RunTrigger;
  rerun_of: string | null;
  status: RunStatus;
  started_at: string | null;
  ended_at: string | null;
  summary: string | null;
  created_at: string;
};

/** Per-test execution within a run — owns the browser session + live view. */
export type RunSpecRow = {
  id: string;
  run_id: string;
  test_spec_id: string | null;
  title: string;
  status: RunStatus;
  browser_session_id: string | null;
  live_view_url: string | null;
  replay_s3_key: string | null;
  summary: string | null;
  report: string | null;
  started_at: string | null;
  ended_at: string | null;
};

/** Granular steps within one run_spec. */
export type RunStepRow = {
  id: string;
  run_spec_id: string;
  idx: number;
  description: string;
  status: "pending" | "running" | "passed" | "failed";
  screenshot_url: string | null;
  log: string | null;
  started_at: string | null;
  ended_at: string | null;
};

export type ScheduleRow = {
  id: string;
  agent_id: string;
  spec_ids: string[];
  cron: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
};
