# AgentDock CLI

Terminal access to AgentDock project context, memories, skills, secret references, agents, sessions, generated files, and handoffs.

## Install Dependencies

From the CLI package:

```bash
cd packages/cli
npm install
```

## Local Development

```bash
npm run cli:dev -- --help
```

Or from inside `packages/cli`:

```bash
npm run dev -- --help
```

## Build

```bash
npm run cli:build
```

## Link Locally

After installing dependencies and building:

```bash
cd packages/cli
npm link
agentdock --help
```

## Core Flow

```bash
agentdock login
agentdock init
agentdock status
agentdock memory add "Backend runs with uvicorn main:app --port 8000" --tags backend,commands --importance High
agentdock generate agents
agentdock prompt
agentdock handoff --file
```

## Command Tests

Use these after `agentdock login` and `agentdock init`:

```bash
agentdock whoami
agentdock projects list
agentdock projects create
agentdock memory list
agentdock memory search backend
agentdock skills list
agentdock agents list
agentdock secrets list
agentdock generate agents
agentdock generate claude
agentdock generate cursor
agentdock generate openclaw
agentdock prompt --copy
agentdock handoff --save --file
agentdock sync
agentdock doctor
```

Secret commands and generated files only use `agentdock://secrets/...` references. Raw secret values are never printed.
