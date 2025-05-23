
const BASE_URL = "https://api.github.com";

interface WorkflowRun {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    head_branch: string; 
    html_url: string; 
    created_at: string; 
    path: string; 
    actor: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
    run_started_at: string;
    updated_at: string;
}


interface WorkflowRunsResponse {
    workflow_runs: WorkflowRun[];
}


export async function fetchWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
    };

    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let allRuns: WorkflowRun[] = [];
    let page = 1;  // Starting page number
    let hasNextPage = true;  // Flag to determine if there are more pages

    while (hasNextPage) {
        const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/actions/runs?per_page=100&page=${page}`, { headers });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Repository not found.\nPlease check the owner and repo names.");
            } else if (res.status === 403) {
                throw new Error("Access denied or rate limit exceeded. Check token or permissions.");
            } else {
                throw new Error(`GitHub API error: ${res.statusText || res.status}`);
            }
        }
        

        const data: WorkflowRunsResponse = await res.json();
        console.log(`GitHub workflow data (page ${page}):`, data);

        // Concatenate the new batch of workflow runs to the allRuns array
        allRuns = allRuns.concat(data.workflow_runs);

        // Check if there is a "next" page in the Link header
        const linkHeader = res.headers.get('Link');
        if (linkHeader && linkHeader.includes('rel="next"')) {
            page++;  // Go to the next page
        } else {
            hasNextPage = false;  // No more pages
        }
    }

    return allRuns;
}


export async function fetchArtifacts(owner: string, repo: string, runId: number) {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
    };

    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`, { headers })

    if (!res.ok) {
        if (res.status === 404) {
            throw new Error("No artifacts found for this run.");
        } else if (res.status === 403) {
            throw new Error("Access denied when fetching artifacts.");
        } else {
            throw new Error(`GitHub artifact fetch error: ${res.statusText || res.status}`);
        }
    }
    

    const data = await res.json();
    return data.artifacts;
}

