# Contributing to Pollin

Guidelines for contributing to the Pollin project.

## How to Contribute

- Propose changes via pull request
- Keep code and documentation clear and intentional
- Include reasoning for design decisions
- Reference existing patterns before introducing new ones

## Contribution Principles

- Clarity over verbosity
- Systems thinking over one-off solutions
- Accessibility and usability by default
- Security by default
- Performance awareness

## Before You Start

1. Read `AGENTS.md`, `SECURITY.md`, and `ACCESSIBILITY.md`
2. Check existing patterns in `src/design/tokens.ts` and component structure
3. Ensure changes align with design system tokens
4. Write tests for logic-bearing code

## Pull Request Checklist

- ✅ Code passes ESLint and Prettier
- ✅ TypeScript strict mode passes
- ✅ Accessibility standards met (WCAG AA)
- ✅ No hardcoded values; uses design tokens
- ✅ No console logs or debug code
- ✅ Components are fully typed (no `any`)
- ✅ Tests included for logic
- ✅ No new security risks introduced

## Design Decisions

When proposing new patterns or architecture:

- Document the rationale in commit messages
- Explain tradeoffs (performance, maintenance, accessibility)
- Consider long-term maintainability
- Propose changes in discussion before large refactors

## Future Additions

- Automated review checklists
- CI/CD enforcement
- Contribution templates
