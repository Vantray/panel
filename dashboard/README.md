# Vantray Dashboard

## Requirements

Node.js >= v24.22.0 and pnpm >=12.21.0.

### Configure app

```bash
cp .env.example .env
```

#### Environment variables

| Name          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| VITE_BASE_API | The api url of the deployed backend ([Vantray](https://github.com/vantray/panel)) |

## Start development server

```bash
pnpm dev
```

Run the backend next to it (`DEBUG=true python main.py` from the repo root) and open
http://localhost:3000.

## Simple build for production

```bash
pnpm build
```

Output lands in `dist/` with the same layout the backend expects (`index.html`,
SPA fallback, hashed assets under `statics/`).

## Checks

```bash
pnpm lint        # oxlint
pnpm fmt:check   # oxfmt
```

## Contribution

Feel free to contribute. Go on and fork the project. After commiting the changes, make a PR. It means a lot to us.
