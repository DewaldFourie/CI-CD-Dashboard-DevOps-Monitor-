import { useEffect, useState, useCallback } from "react";
import { fetchWorkflowRuns } from "../services/GitHubService";

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

export default function DeploymentsPage() {
    const [deployments, setDeployments] = useState<WorkflowRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ownerInput, setOwnerInput] = useState<string>(localStorage.getItem("ciDashboardOwner") ?? "DewaldFourie");
    const [repoInput, setRepoInput] = useState<string>(localStorage.getItem("ciDashboardRepo") ?? "StickerSmash");
    const [owner, setOwner] = useState<string>(localStorage.getItem("ciDashboardOwner") ?? "DewaldFourie");
    const [repo, setRepo] = useState<string>(localStorage.getItem("ciDashboardRepo") ?? "StickerSmash");

    const loadDeployments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const all = await fetchWorkflowRuns(owner, repo);   
            const deployRuns = all.filter(run =>
                /(deploy|production|prod|release)/i.test(run.name)
            );            
            setDeployments(deployRuns);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [owner, repo]);

    const handleTrack = () => {
        if (!ownerInput || !repoInput) return alert("Both fields are required.");
        setDeployments([]);
        setError(null);
        setOwner(ownerInput.trim());
        setRepo(repoInput.trim());
    };

    useEffect(() => {
        loadDeployments();
    }, [loadDeployments]);

    useEffect(() => {
        localStorage.setItem("ciDashboardOwner", owner);
        localStorage.setItem("ciDashboardRepo", repo);
    }, [owner, repo]);


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Owner and Repo Input Section */}
            <div className="mb-2 flex items-center justify-center gap-4">
                {/* Owner Input */}
                <div className="relative w-[160px]">
                    <input
                        type="text"
                        id="owner_input"
                        value={ownerInput}
                        onChange={(e) => setOwnerInput(e.target.value)}
                        placeholder=" "
                        className="peer block w-full appearance-none border border-gray-300 bg-white px-2.5 pb-2.5 pt-4 text-md text-black rounded-lg focus:border-emerald-400 focus:outline-none focus:ring-0"
                    />
                    <label
                        htmlFor="owner_input"
                        className="absolute left-2.5 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white rounded-lg px-1 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75"
                    >
                        Owner
                    </label>
                </div>
                {/* Repo Input */}
                <div className="relative w-[240px]">
                    <input
                        type="text"
                        id="repo_input"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        placeholder=" "
                        className="peer block w-full appearance-none border border-gray-300 bg-white px-2.5 pb-2.5 pt-4 text-md text-gray-900 rounded-lg focus:border-emerald-400  focus:outline-none focus:ring-0"
                    />
                    <label
                        htmlFor="repo_input"
                        className="absolute left-2.5 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white rounded-lg px-1 text-sm text-black transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75"
                    >
                        Repository
                    </label>
                </div>
                {/* Track Button */}
                <button
                    onKeyDown={(e) => { if (e.key === "Enter") handleTrack(); }}
                    onClick={handleTrack}
                    className="px-5 py-2 bg-gray-900 text-white rounded hover:text-emerald-400 transition"
                >
                    Track
                </button>
            </div>
            <p id="floating_helper_text" className="mb-4 text-xs flex justify-center text-gray-500">Ensure you're using valid and publicly available Github owner and repository names</p>
            <h2 className="text-xl mb-4 font-semibold text-gray-700">Recent Deployments</h2>
            {/* Conditional Rendering */}
            {(loading || error) ? (
                <div className="my-4 flex items-center justify-center min-h-[250px]">
                    {loading && (
                        <p className="animate-pulse text-gray-500">Loading...</p>
                    )}
                    {error && (
                        <p className="text-red-600 font-medium whitespace-pre-line text-center">{error}</p>
                    )}
                </div>
            ) : (
                deployments.length === 0 ? (
                    <div className="p-6 flex flex-col text-center items-center justify-center min-h-[300px] text-gray-600">
                        <p className="mb-2">No production/deployment runs found.</p>
                        <p className="text-sm">
                            Make sure you have at least one GitHub Actions workflow named with “deploy” or “production”
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[750px]">
                        <ul className="space-y-4 mt-6">
                            {deployments.map(run => (
                                <li
                                    key={run.id}
                                    className="p-4 bg-white shadow rounded flex flex-col gap-2 border-l-4"
                                    style={{
                                        borderColor:
                                            run.conclusion === "success" ? "#10B981" :
                                            run.conclusion === "failure" ? "#EF4444" : "#FBBF24",
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <a
                                            href={run.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-medium text-blue-600 hover:underline"
                                        >
                                            {run.name}
                                        </a>
                                        <span className="text-sm text-gray-500">
                                            {new Date(run.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Branch: {run.head_branch}</p>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={run.actor.avatar_url}
                                            alt={run.actor.login}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <a
                                            href={run.actor.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-700 hover:underline"
                                        >
                                            {run.actor.login}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            )}
        </div>
    );
    
}
