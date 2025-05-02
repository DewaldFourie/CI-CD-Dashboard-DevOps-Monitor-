
# DevOps Monitor: A GitHub Actions CI/CD Dashboard

DevOps Monitor is a web-based dashboard that tracks and visualizes GitHub Actions workflow runs for any repository.
It provides real-time monitoring of build statuses, success rates, and workflow activity, helping development teams quickly identify failures, assess deployment health, and maintain continuous integration standards.
Built with React, TypeScript, and TailwindCSS, DevOps Monitor integrates directly with the GitHub API and refreshes automatically to ensure up-to-date visibility into CI/CD pipelines.

## Preview
<img width="1440" alt="Image Tagging APP" src="https://github.com/user-attachments/assets/6fb88119-5021-45bb-b344-3e2562031588" />


## Features

- Real-time GitHub Actions workflow monitoring
- Build success/failure tracking
- Success rate calculation
- Auto-refreshing every 3 minutes
- Artifact fetching for workflow runs
- Custom repository selection
- Lightweight, responsive UI (React + TailwindCSS)


## Optimized github/workflows/main.yml Template

For best results, we recommend structuring your '.yml' file like this:

```bash
name: 'Name' (any name you prefer)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-22.04

    steps:
      - name: 🔄 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🛠️ Build project
        run: npm run build

      - name: 🗂️ Create reports directory
        run: mkdir -p reports

      - name: ✅ Run tests
        run: npm test
        continue-on-error: true

      - name: 📄 Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: reports/test-summary.json

```


## Documentation

When you enter a GitHub username and repo name and hit "Track", it:

    1. Fetches Recent Workflow Runs
Grabs recent GitHub Actions runs — especially ones related to deployments (can be modified as needed).

    2. Displays Deployment History
Shows a feed of the last deployment runs, including:

• Commit message

• Branch name

• Trigger type (manual, push, etc.)

• Status (success/failure)

• Time of execution

    3. Fetches and Analyzes Build Artifacts
If a workflow run includes a test summary artifact (e.g., a .json file zipped up and uploaded), it:

• Downloads the ZIP artifact

• Extracts it in-memory in the browser

• Parses the JSON

• Calculates stats: total tests, passed, failed, skipped

• Computes and displays a Success Rate

    4. Live Polling
The dashboard auto-refreshes workflow runs every 3 minutes (can be adjusted as needed), so you can keep it open like a live CI monitor.

    5. Basic Filtering
Only shows deploy-related runs (ignores lint, test-only, or unrelated builds).




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`VITE_GITHUB_TOKEN`




## Authors

- [@dewaldfourie](https://github.com/DewaldFourie)


## Tech Stack

**Client:** TypeScript, React, Redux, TailwindCSS

**Server:** Node, GithubAPI


## License

[MIT](https://choosealicense.com/licenses/mit/)

