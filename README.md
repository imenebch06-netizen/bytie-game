# Test Your Knowledge

**Test Your Knowledge** is an interactive quiz game designed for Bytecraf's open day scheduled for october 11th. The player is accompanied by **Bytie**, an animated robot repersentative for the club. They complete three mini-games in sequence (**Zoom Reveal**, **Connections**, **Timeline**), obtain a score out of 300 along with a rank, and then Bytie reads them an AI-generated (Gemini) summary of their game in a speech bubble. This text is flagged as AI-generated inside the speech bubble.

The project consists of two applications that communicate over HTTP:

- a **React frontend** (`jeu-mascotte` folder) that displays the games, calculates scores, and animates Bytie;
- a **Python FastAPI backend** (`backend` folder) that randomly selects rounds from MongoDB, serves logo images, and calls Gemini.

## Table of Contents

1. [Player Journey](#1-player-journey)
2. [Rules and Scoring](#2-rules-and-scoring)
3. [Architecture](#3-architecture)
4. [Prerequisites](#4-prerequisites)
5. [Installation and Setup](#5-installation-and-setup)
6. [Configuration](#6-configuration)
7. [API](#7-api)
8. [Database](#8-database)
9. [AI Summary with Gemini](#9-ai-summary-with-gemini)
10. [Diagnostics](#10-diagnostics)
11. [Troubleshooting](#11-troubleshooting)
12. [Customizing the Game](#12-customizing-the-game)
13. [Security](#13-security)
14. [Deployment](#14-deployment)

---

## 1. Player Journey

1. **Home screen** with the *Start Playing* button. Upon clicking, the frontend requests a new game from the backend.
2. **Zoom Reveal**: identify a logo while it zooms out (3 rounds).
3. **Connections**: find four groups of four words (1 grid).
4. **Timeline**: place events in chronological order (3 rounds).
5. **Results**: total score, rank, statistics for each game, and next to them Bytie with its Gemini-generated summary. The *Play Again* button starts a new game with fresh rounds.

Every game is different: the backend randomly selects **3 Zoom rounds out of 20**, **1 Connections grid out of 7**, and **3 Timeline rounds out of 12**.

---

## 2. Rules and Scoring

Each game gives a score out of 100, making the total score out of 300. The values below can be adjusted in `jeu-mascotte/src/config/scoring.config.ts`, and the formulas are in `jeu-mascotte/src/logic/scoring.ts`.

### Zoom Reveal

A logo appears heavily zoomed in and then zooms out in 5 stages of 6 seconds each. The player selects the correct answer from 4 options. The earlier they find it, the more points they earn:

| Stage | 1 | 2 | 3 | 4 | 5 |
|-------|-----|----|----|----|----|
| Points | 100 | 80 | 60 | 40 | 20 |

- Each wrong guess deducts **10 points** for that round (never dropping below 0).
- If time runs out without a correct answer, the round is worth 0 points and Bytie provides the answer.
- A hint button allows Bytie to give a hint in its speech bubble. Hints cost no points.
- The game score is the sum of points across rounds divided by the maximum possible, scaled to 100.

### Connections

Sixteen words are displayed. The player selects four words they believe share a common theme, then submits. They can shuffle the words or deselect them.

- Each group found awards points based on its difficulty: **10, 20, 30, and 40** points.
- Each mistake deducts **5 points** and costs 1 of **4 lives**.
- If all four groups are found, a **time bonus of up to 20 points** is added, proportional to the remaining time out of 180 seconds.
- The game ends when all 4 groups are found, all 4 lives are lost, or when the 180 seconds elapse.
- The total score is divided by 120 and then scaled to 100.

When the player is one word away from completing a group, Bytie points it out.

### Timeline

Four events are presented out of order, and the player drags them into order, from oldest to newest. Each round lasts 45 seconds. A round's score depends on the proportion of correctly ordered event pairs (6 pairs for 4 events):

- 80 points multiplied by accuracy;
- plus a time bonus of up to 20 points, also multiplied by accuracy, so that rushing with an incorrect answer yields almost nothing;
- after validation, the actual date and a fun fact appear under each event.

The game score is the average of the three rounds.

### Final Rank

The rank depends on the total score out of 300:

| Total score | Rank |
|-------------|------|
| 240 points or higher | **PRO MASTER** |
| 150 to 239 points | **INTERMEDIATE** |
| Under 150 points | **BEGINNER** |

The overall accuracy displayed on the results page is the total score divided by 300.

---

## 3. Architecture

The browser (React, port 5173) calls the FastAPI API (port 8000). FastAPI reads the rounds from MongoDB (port 27017), serves logo images, and calls Google's Gemini API for the end-of-game summary. If Gemini is unavailable, FastAPI returns a locally written non-AI summary.

```
Browser (React :5173) ──HTTP──▶ FastAPI (:8000) ──▶ MongoDB (:27017)
                                      │
                                      └──▶ Google Gemini API
```

Scores are calculated in the browser. The backend also exposes a Zoom score calculation endpoint, but it is not currently used by the game.

### Repository Structure

```
test-your-knowledge/
├── README.md
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── logos/                    # 20 PNG logos served at /logos
│   └── app/
│       ├── main.py               # FastAPI application, CORS, logo serving
│       ├── config.py             # reading the .env file
│       ├── database.py           # MongoDB connection and collections
│       ├── schemas.py            # Pydantic models for requests and responses
│       ├── seed_db.py            # populates MongoDB with all game rounds
│       ├── diagnostic.py         # installation check tool
│       ├── routers/
│       │   └── game.py           # API endpoints
│       └── services/
│           ├── ai_feedback.py    # Gemini call and fallback summary
│           └── scoring.py
└── jeu-mascotte/
    ├── package.json
    ├── .env.example
    └── src/
        ├── App.tsx               # application routes
        ├── pages/
        │   ├── Mainframe.tsx     # home screen
        │   ├── GameShell.tsx     # game sequencing and introductions
        │   ├── Gameframe.tsx     # shared frame: background, waves, Bytie, speech bubble
        │   └── Results.tsx       # results page
        ├── games/
        │   ├── ZoomGame.tsx
        │   ├── ConnectionsGame.tsx
        │   └── TimelineGame.tsx
        ├── components/
        │   ├── Bytie.tsx         # the animated mascot
        │   ├── Speechbubble.tsx  # speech bubble
        │   └── WaveBorder.tsx
        ├── store/
        │   ├── gameStore.ts      # game session, scores, sequence
        │   └── shellStore.ts     # Bytie speech bubble, banner text
        ├── services/
        │   └── api.ts            # HTTP calls to the backend
        ├── logic/
        │   └── scoring.ts        # scoring formulas
        ├── config/
        │   └── scoring.config.ts # customizable scoring rules
        └── data/
            └── gamesData.tsx     # types, constants (zoom, lives), and sample data
```

### Technologies

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router 7, Zustand 5.
- **Backend:** FastAPI, Uvicorn, Motor (asynchronous MongoDB driver), Pydantic, Pydantic Settings, httpx.
- **Database:** Local MongoDB.
- **Artificial Intelligence:** Google Gemini API, invoked via REST.

---

## 4. Prerequisites

- **Python** 3.10 or newer.
- A recent version of **Node.js** (version 20.19 or higher is recommended) and npm.
- **MongoDB Community Server** installed and running on port 27017.
- A **Gemini API key** created at <https://aistudio.google.com/apikey>. It is optional: without it, everything still works and Bytie displays the local summary instead of the AI summary.

---

## 5. Installation and Setup

Order to follow: **MongoDB, database seeding, backend, then frontend.** The commands below are for Windows PowerShell.

### 5.1 Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Next, open `backend/.env` and set at least `GEMINI_API_KEY` (see the [Configuration](#6-configuration) section). If PowerShell refuses to activate the virtual environment, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first in the same window.

On macOS or Linux, use `source venv/bin/activate` and `cp .env.example .env`.

Populate the database for the first time:

```bash
python -m app.seed_db
```

Then start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Verify that <http://localhost:8000/health> returns `{"status":"ok"}`. The interactive API documentation is available at <http://localhost:8000/docs>, where you can test each endpoint.

### 5.2 Frontend

In a second terminal:

```bash
cd jeu-mascotte
npm install
npm run dev
```

Open <http://localhost:5173>, then click **Start Playing**.

### 5.3 Useful Frontend Commands

```bash
npm run build      # TypeScript check then production build in dist
npm run lint       # code analysis with oxlint
npm run preview    # preview the production build
```

---

## 6. Configuration

### Backend: `backend/.env` file

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB address. | `mongodb://localhost:27017` |
| `GEMINI_API_KEY` | Gemini API key. Empty activates the local summary. | *(empty)* |
| `GEMINI_MODEL` | Model used. `gemini-3.5-flash-lite` is faster and cheaper, useful if many players finish at the same time. | `gemini-3.7-flash` |
| `GEMINI_TIMEOUT_SEC` | Maximum wait time for Gemini before falling back to the local summary. | `10` |
| `MONGODB_DB_NAME` | Read only by the seed script. The API always uses the `tech_quiz_db` database defined in `database.py`. **Do not change this variable**; otherwise, the script and the API will no longer point to the same database. | `tech_quiz_db` |

> `PORT` appears in the sample file, but the actual port is the one passed to the `uvicorn` command.

> **Note:** After modifying the `.env` file, restart uvicorn: it does not reload this file on the fly, even with the `--reload` option.

### Frontend: `jeu-mascotte/.env` file

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_ORIGIN` | Backend address. Must be set before running `npm run dev` or `npm run build` if the backend is hosted elsewhere. | `http://localhost:8000` |

### AI Summary Language

The summary is generated in English, like the rest of the interface. To get French, change the `AI_LANGUAGE` constant at the top of `jeu-mascotte/src/pages/Results.tsx` to `"fr"`.

---

## 7. API

All game routes start with `/api/game`.

### `GET /health`

Returns `{"status": "ok"}`. Used to check if the backend is running.

### `GET /api/game/session`

Randomly selects a new game. Response:

```json
{
  "zoom": [ "3 Zoom rounds" ],
  "connectionsWords": [ "16 shuffled words" ],
  "connectionsGroups": [ "4 groups with their category, difficulty, points, and words" ],
  "timeline": [ "3 Timeline rounds of 4 events each" ]
}
```

If a collection is empty, the API responds with a `503` status code and a message instructing to run the database seed script, rather than returning empty arrays.

### `POST /api/game/ai-analysis`

Generates the end-of-game summary. Request body:

```json
{
  "zoom_score": 85,
  "connections_score": 40,
  "timeline_score": 70,
  "rank_title": "INTERMEDIATE",
  "language": "en"
}
```

All three scores are integers from 0 to 100. `rank_title` is `PRO MASTER`, `INTERMEDIATE`, or `BEGINNER`. `language` is `en` or `fr`. Any other value is rejected with a `422` error. Response:

```json
{
  "comment": "Summary text",
  "source": "gemini",
  "model": "gemini-3.7-flash"
}
```

The `source` field is `gemini` if the text comes from AI, or `fallback` if it is the local summary (in which case `model` is `null`). The interface displays the **AI · Gemini** badge only when `source` is `gemini`.

### `POST /api/game/score/zoom`

Calculates the Zoom round score server-side from `answered_stage` (0 to 4, or `null`) and `wrong_guesses`. Available, but not used in the current version of the game.

### `GET /logos/name.png`

Serves logo images from the `backend/logos` directory.

---

## 8. Database

The database is named `tech_quiz_db` and contains three collections populated by `python -m app.seed_db`.

| Collection | Documents |
|------------|-----------|
| `zoom_rounds` | 20 |
| `connections_rounds` | 7 |
| `timeline_rounds` | 12 |

> **Note:** The seed script empties all three collections before re-inserting data. Any manual changes made to the database will be lost when re-running it.

### Zoom Round Format

```json
{
  "id": "zoom-apple",
  "image": "/logos/apple.png",
  "answer": "Apple",
  "acceptedAnswers": ["apple", "apple inc", "apple inc."],
  "category": "tech",
  "options": ["Apple", "Samsung", "Sony", "Huawei"],
  "hints": ["First hint", "Second hint", "Third hint"],
  "focus": {"x": 62, "y": 28}
}
```

`focus` indicates, as percentages of the image size, the focal point around which zooming occurs. `answer` must be included in `options`.

### Connections Grid Format

```json
{
  "id": "connections-1",
  "groups": [
    {
      "id": "conn-web-languages",
      "category": "Web languages",
      "difficulty": 1,
      "points": 10,
      "words": ["HTML", "CSS", "JavaScript", "PHP"]
    }
  ]
}
```

Each grid contains 4 groups with difficulties from 1 to 4, with 4 words each.

### Timeline Round Format

```json
{
  "id": "timeline-1",
  "difficulty": "easy",
  "events": [
    {
      "id": "tl1-moon",
      "title": "First humans walk on the Moon",
      "year": 1969,
      "fact": "Fun fact displayed after validation."
    }
  ]
}
```

Each round contains 4 events, all with distinct years.

---

## 9. AI Summary with Gemini

When the results page opens, Bytie first displays a short waiting message while the frontend sends the three scores to the backend. The backend then constructs a prompt for Gemini:

- a **system instruction** presenting Bytie, the three games, and the expected style: 2 or 3 sentences, maximum 50 words, encouraging tone, one strength, one area for improvement, and a tip, without markdown;
- the **player's data**: the three scores, total score, and rank.

The backend calls the Gemini REST API (`generateContent`) passing the key in the request header rather than the URL, so it does not appear in logs. The model's thinking level is set to `low` for fast responses. If the model rejects this setting (400 error), the request is retried once without it. The received text is cleaned up (removing residual markdown) and truncated to approximately 320 characters, ending on a full sentence.

The backend **never returns an error to the player** due to Gemini. In all failure cases (missing or invalid key, quota exceeded, unknown model, network down, timeout, empty response), it returns a locally written non-AI summary and sets `source` to `fallback`. The interface then omits the **AI · Gemini** badge, so that non-AI text is never advertised as AI-generated.

The server logs the cause of each fallback in the uvicorn terminal output, starting with `Gemini unavailable`.

**Input security:** the endpoint only accepts bounded numbers and strict enum values for rank and language. It is therefore impossible to inject arbitrary text into the prompt sent to Gemini.

---

## 10. Diagnostics

From the `backend` folder with the virtual environment activated:

```bash
python -m app.diagnostic
```

This command checks three things and prints `[OK]` or `[PROBLEM]` for each:

1. **MongoDB:** database used by the API, document count for each collection, and list of available Connections grids;
2. **Gemini:** presence of the API key, followed by a real test call with the exact error message in case of failure;
3. **Project files** that may have remained on an outdated version.

This is the first tool to use if unexpected behavior occurs.

---

## 11. Troubleshooting

**The "Start Playing" button shows an error or the game does not start.**
The backend is likely not running, or the database is empty. Test <http://localhost:8000/health>. A message indicating an empty database means you need to run `python -m app.seed_db`.

**Logos do not display.**
Verify that the `backend/logos` directory contains the images and that `VITE_API_ORIGIN` points to the correct backend address. An image should open directly at <http://localhost:8000/logos/apple.png>.

**The same Connections grid appears every game.**
Run diagnostics to check that all 7 grids are in the database, then open <http://localhost:8000/api/game/session> multiple times in your browser. If categories change on every refresh, the API works properly and an old frontend file is likely still cached or in place.

**The summary displayed is the local text without the AI badge.**
Check the `Gemini unavailable` line in the uvicorn terminal. The most common causes:

- the key is missing from the `.env` file, or uvicorn was not restarted after adding it;
- `400` error with a message about the key: the key is invalid or miscopied;
- `403` error: Google denies access to the project associated with the key. Create the key in a new project in Google AI Studio, or try with another Google account;
- `404` error: the model name does not exist. Correct `GEMINI_MODEL`;
- `429` error: quota exceeded. Wait or switch to a Flash Lite model;
- connection error or timeout: check your internet connection, VPN, or proxy settings.

**Changes to the `.env` file have no effect.**
Restart uvicorn.

**A CORS error appears in the browser console.**
The frontend cannot reach the backend. Verify that uvicorn is running on port 8000 and that `VITE_API_ORIGIN` is configured properly.

**A port is already in use.**
Terminate the old process, or launch uvicorn on a different port and adjust `VITE_API_ORIGIN`.

**A console message mentions the `d` attribute of a `path` element.**
This originates from the mascot's SVG animation and does not affect gameplay.

---

## 12. Customizing the Game

### Adding or Modifying Rounds

1. For a new Zoom logo, place the PNG image into `backend/logos`.
2. Add the round entry to the corresponding list in `backend/app/seed_db.py`, following the format outlined in the [Database](#8-database) section.
3. Re-run `python -m app.seed_db` and start a new game: the new rounds will be included in the random draw.

### Adjusting Scoring and Timers

The `jeu-mascotte/src/config/scoring.config.ts` file consolidates points per Zoom stage, stage durations, Connections group values, error penalties, time bonuses, and time limits for Connections and Timeline. If you change maximum achievable points, update the rank threshold cutoffs in `Results.tsx` accordingly (240 and 150 out of 300).

### Modifying Bytie's Text

Introductory dialogues for each game are located in `pages/GameShell.tsx`. In-game reactions are inside each game's file under the `games` directory.

### Customizing the Results Page Layout

The layout (Bytie and speech bubble on the left, statistics on the right) is in `pages/Gameframe.tsx`. The stats card content is in `pages/Results.tsx`. The speech bubble and AI badge are in `components/Speechbubble.tsx`.

---

## 13. Security

- **Never store the Gemini key in the frontend:** it must remain in `backend/.env`, accessible only by the server.
- **Never share the `.env` file** in an archive, Git repository, or screenshot. The root `.gitignore` file excludes it from Git tracking. If `.env` was previously committed, untrack it using `git rm --cached backend/.env`, revoke the key in Google AI Studio, and generate a new one, as the old key will remain in Git history.
- If a key is ever exposed, **revoke it immediately**.
- For public deployment, replace `allow_origins=["*"]` in `backend/app/main.py` with your frontend's actual domains, and do not expose MongoDB publicly to the internet.

---

## 14. Deployment

1. **Frontend:** build using `npm run build` with `VITE_API_ORIGIN` set to the backend's public URL. Output files will be generated in `jeu-mascotte/dist` and can be served by any static web host.
2. **Backend:** run using `uvicorn app.main:app --host 0.0.0.0 --port 8000` (without `--reload`), behind a reverse proxy or web server with HTTPS enabled.
3. **Database:** provide the backend with a MongoDB instance populated via `python -m app.seed_db`, along with environment variables matching the `.env` structure.
4. **CORS:** restrict origins as described in the [Security](#13-security) section.
