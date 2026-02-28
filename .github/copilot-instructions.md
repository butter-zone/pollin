# Copilot Instructions

This project follows the agent rules defined in the
[butter-zone/design-standards](https://github.com/butter-zone/design-standards) repository.

The canonical source of truth is `repos/design-standards/agents.md` (referenced
via workspace settings). Clone the design-standards repo if not present:

```sh
git clone https://github.com/butter-zone/design-standards.git repos/design-standards
```

All AI agents working in this codebase must comply with the full
[agents.md](https://github.com/butter-zone/design-standards/blob/main/agents.md)
specification, including:

- Production-grade code only — no placeholders, no pseudo-code
- Fully typed TypeScript (strict mode, no `any` unless justified)
- Accessible by default (WCAG AA, semantic HTML, keyboard navigation)
- Design-system-aware (use existing tokens, spacing, color roles)
- State coverage: loading, error, empty, success
- Mobile-first, responsive, reduced-motion aware
- Security: no insecure defaults, env vars for secrets, validate input
- Pre-code inspection: scan existing patterns before writing
- Deterministic output: consistency > novelty
