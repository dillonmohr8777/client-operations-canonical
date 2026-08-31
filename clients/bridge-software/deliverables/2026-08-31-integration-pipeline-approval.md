# Bridge integration pipeline and full approval

Date: 2026-08-31  
Client: `bridge-software`  
Status: executed locally; GitHub invites pending acceptance

Dillon directed full approval for Greencubes to proceed with frontend integration. This is access, source, and pipeline work. It is not a Join-screen redesign.

## What was blocking them

Live `https://bridge-connected-signal.netlify.app` was a CLI deploy of the age-gate Next.js app. It was not Git-linked, so there was no development preview auto-deploy and no production merge path. That is what Miraj meant by Step 2 and Step 4.

The client GitHub user `getonthebridge0-max` had no visible repositories. Collaborator-only access on the wrong surface could not create the pipeline.

## What is live now

| Item | Value |
| --- | --- |
| Source repo | https://github.com/dillonmohr8777/bridge-software-frontend |
| Live frontend SHA | `7a3e611` from `codex/restore-age-gate-2026-08-21` |
| `development` | auto-deploys preview |
| `production` | default branch; auto-deploys live |
| Preview site | https://bridge-connected-signal-dev.netlify.app |
| Preview admin | https://app.netlify.com/projects/bridge-connected-signal-dev |
| Production site | https://bridge-connected-signal.netlify.app |
| Production admin | https://app.netlify.com/projects/bridge-connected-signal |
| GitHub admin invites | `getonthebridge0-max`, `mirajmor` (pending accept) |
| Netlify Developer | `clickthedemo@gmail.com`, `mirajgreencubes@gmail.com`, `getonthebridge0@gmail.com` |

GitHub personal-repo invites were created with `permission: admin` so they can create branches and configure the pipeline after they accept.

The original public prototype `dillonmohr8777/bridge-discovery-prototype` remains Dillon's design workspace. Integration work belongs on `bridge-software-frontend`.

## Workflow they were granted

1. Accept the GitHub admin invite.
2. Branch from `development` and push API wiring into the existing screens.
3. Preview auto-deploys for review.
4. After Dillon QA on the preview URL, merge to `production` for live.

Keep the current visual design. Their admin panel may use the same brand colors.

## External mutations

- Created private GitHub repository `dillonmohr8777/bridge-software-frontend`
- Pushed `production` and `development`
- Sent GitHub admin invitations
- Created Netlify site `bridge-connected-signal-dev`
- Linked preview to `development`
- Invited Netlify Developers by email
- Linked production to `production` and confirmed Git deploy `6a95918152d3c59ea2f63ee0` is `ready` on the live URL
