# SignalRoom

SignalRoom is a live decision workspace for small teams. A team frames one consequential choice, adds evidence for and against it, records individual confidence, sees who is present, and asks an AI analyst to synthesize the strongest case or unresolved risk.

## Why this scope

The app is intentionally narrower than a project manager or team chat. Those products already have places for conversation; SignalRoom makes the decision trail itself the shared object. That made it possible to finish and verify one strong multi-user loop instead of shipping several shallow features.

## DeepSpace integrations

- **Authentication and RBAC:** public visitors can inspect rooms; authenticated members can contribute. Write permissions are enforced in each collection schema.
- **Real-time records:** decisions, evidence, and confidence signals sync through a RecordRoom Durable Object.
- **Presence:** each decision has an ephemeral PresenceRoom so the interface shows who is viewing the same room.
- **AI chat and tools:** the official AI chat pipeline streams model output, keeps private per-user history, and uses permission-aware record tools to inspect the live decision data.

Confidence votes use `uniqueOn: ['roomId', 'userId']` plus a `userBound` identity field. The one-vote-per-person rule is therefore enforced by the server, not only by the interface.

## Main tradeoff

I chose one shared workspace rather than invitations, private teams, generic chat, file attachments, notifications, or payments. Invitations and private rooms would be the first production extension, but they add membership policy and excluded-user testing that would have displaced polish and verification of the core decision flow. Generic chat would also compete with the evidence model instead of improving it.

## Agent work and human verification

The coding agent scaffolded the DeepSpace app, read the current platform docs and installed feature catalog, implemented the schemas and UI, and prepared automated tests. The applicant should personally verify the deployed core path in two real sessions: create a decision, add evidence, update confidence, confirm the second session updates without refresh, and inspect the AI analyst's output against the underlying records. The applicant should also review the RBAC schema and the one-vote uniqueness constraint before submitting.

## Local development

```bash
pnpm install
pnpm exec deepspace auth login
pnpm exec deepspace app init
pnpm exec deepspace dev start
```

Run the checks with `pnpm exec deepspace test run all` and deploy with `pnpm exec deepspace deploy`.
