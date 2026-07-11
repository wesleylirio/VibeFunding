# Contributing

Thanks for interest in VibeFunding.

## Setup

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Optional live Gemma: set `FIREWORKS_API_KEY` + deployment id, or `OPENROUTER_API_KEY` for free model.

## Checks before a PR

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app` | Next.js App Router pages & API |
| `src/components` | UI |
| `src/lib` | Domain logic (gemma, portfolio, seed, proof) |
| `tests` | Vitest |
| `scripts` | Seed, demo record, Fireworks helpers |
| `infra/amd` | Optional AMD VM / OpenAI-compatible server scripts |
| `docs` | Hackathon & ops notes |

## Rules of thumb

- Never commit `.env` or API keys  
- Prefer honest product attribution for live Gemma backends  
- Keep investor UI free of founder-only tools noise  
- SQLite files stay gitignored under `/data`  

## License

MIT — see `LICENSE`.
