# Frontend Agent Instructions

- Never use `lucide-react` icons. Use `@phosphor-icons/react` (chosen icon set for Proofwork). Other allowed alternatives in the root repo are iconsax, solar icon, reicons, or huge icons.
- The only package manager to use is `bun` and `bunx`.
- No unnecessary comments explaining the code. Comments should only explain why, never what.
- Always make changes on a feature branch and open a PR to `main` using `.github/pull_request_template.md`.
- Always use appropriate available skills before starting a task.
- All colours, radii, spacing, and motion must come from `src/design/proofwork-tokens.css` (never raw hex values in components).
- All user-facing strings must live in `src/messages/en.ts`.
