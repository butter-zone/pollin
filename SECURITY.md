# Security Standards

Baseline security expectations for all contributors—human and automated—working within this repository.

This document establishes **lightweight, preventative guardrails** to ensure that documentation, examples, and agent behavior do not unintentionally introduce risk.

Security here is treated across three complementary lenses:
- **Cybersecurity** — protecting systems
- **OPSEC (Operational Security)** — protecting information and behaviors
- **PERSEC (Personal Security)** — protecting people

---

## Scope

These standards apply to:

- Documentation and examples
- Design and system guidance
- AI agent behavior
- Contribution and review workflows

This repository does **not** store secrets, credentials, or production configurations.

---

### Relationship to AGENTS.md

This document defines security expectations that are enforced through agent behavior. AI agents operating in this repository are governed by `AGENTS.md` and are required to apply these security principles when generating, modifying, or reviewing documentation, examples, or guidance.

---

## Core Principles

- Security is a shared responsibility
- Documentation shapes real-world behavior
- Defaults matter more than disclaimers
- AI agents must favor conservative, safe output
- Personal safety should never be compromised for clarity or convenience

---

## Cybersecurity: Protecting Systems

Cybersecurity focuses on preventing harm to software, services, and infrastructure that may be influenced by this documentation.

### Expectations (Humans & Agents)

- Examples must be safe by default
- Insecure configurations must not be presented as normal or recommended
- Security-sensitive code should prefer pseudocode or abstraction
- Risks and tradeoffs should be explicitly called out when relevant

### Avoid

- Hardcoded secrets, keys, tokens, or credentials
- Disabled authentication or authorization in examples
- Overly permissive defaults (e.g. open access, wildcard permissions)
- Guidance that assumes "this is just for local use" without context

---

## OPSEC: Protecting Information & Behaviors

OPSEC focuses on how information and behavior patterns can unintentionally expose sensitive details or enable misuse.

### Expectations (Humans)

- Assume documentation may be read outside its intended audience
- Treat examples as copy-pasteable into real environments
- Avoid revealing internal workflows, assumptions, or system details that could be exploited
- Use placeholders and generic naming consistently

### Expectations (Agents)

AI agents must:

- Never infer, fabricate, or reuse real credentials or identifiers
- Avoid leaking contextual assumptions about internal systems
- Use neutral, generalized examples unless explicitly instructed otherwise
- Decline requests that would meaningfully lower security posture

---

## PERSEC: Protecting People

PERSEC focuses on avoiding harm to individuals through exposure, attribution, or behavioral guidance.

### Expectations (Humans)

- Do not include personal data, identifiers, or private contact details
- Avoid naming individuals as examples in sensitive contexts
- Be mindful that guidance can influence real behavior, especially for less-experienced readers

### Expectations (Agents)

AI agents must:

- Avoid generating content that could enable harassment, targeting, or doxxing
- Prefer anonymized or fictional examples
- Avoid encouraging risky personal behaviors for the sake of completeness

---

## Documentation Safety Rules

- Prefer clarity over cleverness
- Prefer abstraction over specificity when risk exists
- Avoid normalizing unsafe shortcuts
- When unsure, err on the side of omission and explanation

---

## Reporting Security Concerns

If you discover a security issue:

- Do not open a public issue with sensitive details
- Notify maintainers through appropriate private channels
- Provide clear, minimal context necessary to understand the risk

---

## Future Additions

- Secure-by-default documentation patterns
- Agent-specific enforcement rules
- Review checklists for security-sensitive changes
