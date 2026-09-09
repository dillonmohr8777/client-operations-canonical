# Bridge integration pipeline and full approval

Date: 2026-08-31  
Client: `bridge-software`  
Status: production live; source public; GitHub admin invites pending acceptance; backend staging origin pending

Dillon directed full approval for Greencubes to proceed with frontend integration. This is access, source, and pipeline work. It is not a Join-screen redesign.

## What was blocking them

Live `https://bridge-connected-signal.netlify.app` was a CLI deploy of the age-gate Next.js app. It was not Git-linked, so there was no development preview auto-deploy and no production merge path.

Miraj's separate Step 2 and Step 4 question concerns the Join product flow. The current frontend intentionally stops at Step 1 because Steps 2 through 4 require an authenticated member account, a saved organization draft, protected verification-evidence uploads, and Miraj's review API. The live copy now states this boundary directly.

The client GitHub user `getonthebridge0-max` had no visible repositories. Collaborator-only access on the wrong surface could not create the pipeline.

## What is live now

| Item | Value |
| --- | --- |
| Source repo | https://github.com/dillonmohr8777/bridge-software-frontend |
| Development commit | `ce89c6f` |
| Production commit | `d7aa25c992a3ebb6a6d7e6a9c07f85d9335f2b68` |
| `development` | auto-deploys preview; deploy `6a9598be1c24eb00090b34b6` ready |
| `production` | default branch; auto-deploys live; deploy `6a959941abdd4c0008b23b58` ready |
| Preview site | https://bridge-connected-signal-dev.netlify.app |
| Preview admin | https://app.netlify.com/projects/bridge-connected-signal-dev |
| Production site | https://bridge-connected-signal.netlify.app |
| Production admin | https://app.netlify.com/projects/bridge-connected-signal |
| GitHub admin invites | `getonthebridge0-max`, `mirajmor`, `clickthedemo` (pending accept) |
| Netlify Owner | `mirajgreencubes@gmail.com` active; `clickthedemo@gmail.com` and `getonthebridge0@gmail.com` pending acceptance |
| Promotion PRs | #1 pipeline and contract, #2 Join boundary copy, #3 development to production |

GitHub personal-repo invites were created with `permission: admin` so they can create branches and configure the pipeline after they accept.

The original public prototype `dillonmohr8777/bridge-discovery-prototype` remains Dillon's design workspace. Integration work belongs on `bridge-software-frontend`.

The repository is now public. Branch protection is not currently enabled, so the required no-direct-production rule remains documented operationally in `CONTRIBUTING.md` and `docs/INTEGRATION-PIPELINE.md`.

## Workflow they were granted

1. Accept the GitHub admin invite.
2. Branch from `development` and push API wiring into the existing screens.
3. Preview auto-deploys for review.
4. After Dillon QA on the preview URL, merge to `production` for live.

Keep the current visual design. Their admin panel may use the same brand colors.

## Integration contract supplied to Miraj

- `docs/INTEGRATION-API-CONTRACT.md` maps the existing versioned frontend adapter endpoints and the complete Steps 1 through 4 backend contract.
- `docs/INTEGRATION-PIPELINE.md` records exact branch, preview, production, environment, and promotion rules.
- The HTTP client now sends `credentials: "include"` so a same-site secure cookie session can be used.
- Frontend production remains in mock-adapter mode until `NEXT_PUBLIC_BRIDGE_API_BASE` is configured with an inspectable backend origin.

Before live API wiring, Miraj must provide the backend repository, branch, commit, staging API origin, `/health`, `/version`, route table with request and response examples, auth and cookie policy, CORS origins, CSRF approach, and evidence-upload design. Secrets belong in an approved vault or platform environment, never Slack or Git.

## Verification

- `npm ci`: complete; 0 vulnerabilities
- Phase 3 adapter tests: 24 passed, 0 failed
- Typecheck, lint, and production build: passed
- Preview and production HTTP checks: 200 on `/`, `/join`, `/create`, `/my-profile`, `/explore`, and `/admin/verification`
- Legacy redirects `/studio`, `/business`, and `/signal`: 200 after redirect
- Mobile QA at 390 by 844: no horizontal overflow across the six core routes
- Production `/join`: exact new Steps 2 through 4 boundary copy verified
- Production browser console: no warnings or errors

## External mutations

- Created private GitHub repository `dillonmohr8777/bridge-software-frontend`
- Pushed `production` and `development`
- Sent GitHub admin invitations
- Added the confirmed `clickthedemo` GitHub account as an admin invite
- Changed `dillonmohr8777/bridge-software-frontend` visibility from private to public
- Created Netlify site `bridge-connected-signal-dev`
- Linked preview to `development`
- Invited Netlify Developers by email
- Upgraded Miraj and both team accounts to Netlify Owner access across all sites
- Linked production to `production` and confirmed Git deploy `6a959941abdd4c0008b23b58` is `ready` on the live URL
- Merged and deployed the integration contract, pipeline guardrails, credentialed HTTP client, and corrected Join boundary copy through reviewed pull requests
