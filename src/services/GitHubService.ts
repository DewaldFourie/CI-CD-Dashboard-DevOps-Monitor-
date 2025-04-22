const BASE_URL = "https://api.github.com";

export async function fetchWorkflowRuns(owner: string, repo: string) {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
    };

    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/actions/runs`, {headers,})

    if (!res.ok) {
        throw new Error(`Github API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("GitHub workflow data:", data);
    return data.workflow_runs;
}