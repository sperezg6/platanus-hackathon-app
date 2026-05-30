<p align="center">
  <img src="./project-logo.png" alt="Timeless" width="120" />
</p>

<h1 align="center">Timeless</h1>

<p align="center"><strong>AI browser agents that QA-test your web app in the cloud — watch them live.</strong></p>

Companies register their app, describe a feature in natural language, and spin up
AI **QA agents** that actually drive a real browser to test it — reporting
step-by-step pass/fail, screenshots, and a full session replay.

## How it works

- **Per-agent cloud runtime.** Each agent gets its own **AWS Bedrock AgentCore
  Runtime** (a [Strands](https://strandsagents.com) agent with a selectable model
  — Claude / Nova / DeepSeek), provisioned on creation with its instructions and
  model baked in.
- **Real browsers.** The agent drives a managed **AgentCore Browser** over CDP
  with Playwright — navigate, type, click, assert — testing the live app.
- **Watch + replay.** Live screenshot stream per run, step-by-step results, and a
  true **rrweb session replay** of the recorded browser session (stored in S3).
- **Memory that compounds.** **AgentCore Memory** gives each agent (and the
  company) durable knowledge of the app — login flows, flaky areas, past bugs —
  that improves future runs.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind v4 — UI, dashboard, orchestration
- **Supabase** (Postgres + Realtime + Storage) — clients, apps, agents, runs, screenshots
- **AWS Bedrock AgentCore** — Runtime, Browser, Memory (+ S3 session recordings)
- **Python agent** (`agent-service/`) — Strands + Playwright, deployed to AgentCore Runtime
- Deployed on **Vercel**

## Local development

```bash
npm install
cp .env.local.example .env          # fill in Supabase + AWS values
npm run dev                          # http://localhost:3000
```

Set `APP_MODE=mock` for a fully simulated demo (no AWS), or `APP_MODE=real` to
drive real AgentCore runtimes. Database schema lives in `supabase/migrations/`.

The agent code zip is built/uploaded with `agent-service/build_artifact.py`;
the Browser + Memory resources are provisioned with `scripts/provision_agentcore.py`.
