# Parking Distance Checker

AI-powered tool to calculate accurate walking distance and time from parking lots to event venues.

---

## Deploy to Vercel (recommended — free)

### 1. Get your code on GitHub
1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `parking-distance-checker`
3. Upload all these files to the repo (drag and drop in the GitHub UI)

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project** → select your `parking-distance-checker` repo
3. Click **Deploy** (Vercel auto-detects the config)

### 3. Add your Anthropic API key
1. In your Vercel project, go to **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
3. Click **Save** then go to **Deployments** and click **Redeploy**

Your tool will be live at `https://your-project.vercel.app` — share that URL with your team.

---

## Deploy to Netlify

1. Go to [netlify.com](https://netlify.com), connect your GitHub repo
2. Build command: (leave empty)
3. Publish directory: `public`
4. Add environment variable `ANTHROPIC_API_KEY` in Site Settings → Environment Variables
5. Note: Netlify requires converting `server.js` to a Netlify Function — contact your developer for this step.

---

## Run locally (for testing)

```bash
# 1. Install Node.js from nodejs.org if you don't have it

# 2. Install dependencies
npm install

# 3. Set up your API key
cp .env.example .env
# Open .env and replace sk-ant-your-key-here with your real key

# 4. Start the server
npm start

# 5. Open in browser
# Go to http://localhost:3000
```

---

## Files

```
parking-tool/
├── server.js          ← Backend proxy (keeps API key secure)
├── package.json       ← Node.js dependencies
├── vercel.json        ← Vercel deployment config
├── .env.example       ← Copy to .env and add your API key
├── .gitignore         ← Prevents .env from being committed
└── public/
    └── index.html     ← The full frontend UI
```

---

## How it works

1. Your team opens the URL and enters an event venue + parking addresses (paste or upload CSV/Excel)
2. The browser sends the addresses to **your server** at `/api/distances`
3. Your server (which holds the API key securely) calls the Anthropic API
4. Results come back with walking distance, time, status, and a Google Maps verification link
5. Export results to CSV for data entry

---

## Updating the API key

If you need to rotate your API key:
1. Go to Vercel → your project → Settings → Environment Variables
2. Edit `ANTHROPIC_API_KEY` with the new key
3. Redeploy

The key is never exposed to the browser or your team members.
