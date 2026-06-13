# Studer

> A minimalist, gamified study-cockpit designed to eliminate procrastination and boost focus during exam periods.

**Self-hosted · Real-time sync · Zero vendor lock-in · GPLv3**

---

## Features

- **Focus Cockpit** — One giant red button. No friction. Start studying in one tap.
- **Real-time WebSocket sync** — Timer syncs instantly between your phone and laptop.
- **XP & Level system** — Earn XP for every session. Beat your target time for exponential bonuses.
- **AI Chapter Importer** — Paste your syllabus, get a prompt for any LLM, paste the JSON back — chapters imported in seconds.
- **Analytics dashboard** — Hours per subject, productive-hour heatmap, GitHub-style streak calendar, and achievements cabinet.
- **Single-command deploy** — `docker compose up -d` and you're live.

---

## Quick Start

### Local Development

```bash
git clone https://github.com/your-username/studer
cd studer

cp .env.example .env
npm install

# Set up the database
npm run db:push

# Start the dev server (custom server + Socket.io)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (Recommended for self-hosting)

```bash
docker compose up -d
```

That's it. The SQLite database persists in a Docker volume named `studer-data`.

---

## Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Framework   | Next.js 14 (App Router) |
| Language    | TypeScript              |
| Styling     | Tailwind CSS            |
| Database    | SQLite via Prisma ORM   |
| Real-time   | Socket.io               |
| Charts      | Recharts                |
| Deployment  | Docker / Docker Compose |

---

## Environment Variables

| Variable       | Default                     | Description              |
|---------------|-----------------------------|--------------------------|
| `DATABASE_URL` | `file:./data/studer.db`    | SQLite file path          |
| `PORT`         | `3000`                      | HTTP port                 |
| `NODE_ENV`     | `development`               | Environment mode          |

---

## Project Structure

```
studer/
├── server.ts              # Custom HTTP + Socket.io server entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages & API routes
│   ├── components/        # React components (cockpit, academics, data-center)
│   ├── hooks/             # useSession WebSocket hook
│   ├── lib/               # Prisma client, XP math, achievements
│   └── types/             # Shared TypeScript types
├── Dockerfile
└── docker-compose.yml
```

---

## XP System

| Scenario | Multiplier |
|---------|-----------|
| Studied (no target) | 1× base (10 XP/min) |
| Reached target | 1.5× |
| Overtime past target | 1.5× × 1.05^(overtime minutes) |

---

## Achievements

| Achievement | Requirement |
|------------|-------------|
| 🎯 First Steps | Complete first session |
| 🦉 Night Owl | Study after 22:00 |
| 🌅 Early Bird | Study before 07:00 |
| 🔥 Unstoppable | 5-day streak |
| ⚙️ Iron Will | 10-day streak |
| 💥 Target Crusher | Beat target 5 times |
| 🏃 Marathon Runner | 2+ hour single session |
| 📚 Chapter Master | Complete 10 chapters |
| 🎓 Scholar | Reach Level 5 |
| 💯 Centurion | Accumulate 1,000 XP |
| 🧠 Deep Focus | Complete 50 sessions |

---

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).

