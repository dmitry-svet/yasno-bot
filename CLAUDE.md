# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**yasno-bot** — Telegram bot that monitors the Yasno electricity blackout schedule API every 30 minutes, detects changes for user-selected groups, and sends notifications.

## Repository

- Remote: https://github.com/dmitry-svet/yasno-bot.git
- Main branch: `main`

## Tech Stack

- **Runtime**: Node.js 18+ (no TypeScript)
- **Telegram**: `node-telegram-bot-api` (polling mode)
- **Scheduling**: `node-cron` (every 30 min)
- **Storage**: Local JSON files (Railway persistent volume)

## Project Structure

```
src/
  index.js      # entry: boots bot + cron
  bot.js        # Telegram commands & inline keyboard
  cron.js       # cron job: fetch → compare → notify
  api.js        # Yasno API fetch wrapper
  store.js      # read/write JSON files (data/ directory)
  compare.js    # diff old vs new schedule
  format.js     # format schedule for Telegram messages
data/            # auto-created at runtime, gitignored
  users.json    # chatId → { group, subscribedAt }
  schedule.json # { data: <API response>, fetchedAt }
```

## Commands

- `npm start` / `npm run dev` — run the bot
- Requires `TELEGRAM_BOT_TOKEN` env var (set in `.env` or Railway)

## API

Fetches from: `https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/3/dsos/301/planned-outages`

Returns groups `1.1`–`6.2`, each with `today`/`tomorrow` containing `slots` (minutes from midnight) and `status`.

## Deployment

Railway with persistent volume at `/data` (set `DATA_DIR=/data`).
