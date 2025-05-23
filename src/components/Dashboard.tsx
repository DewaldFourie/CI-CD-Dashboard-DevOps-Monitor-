import { useEffect, useState, useCallback } from "react";
import { fetchWorkflowRuns } from "../services/GitHubService";
import TestSummaryWidget from "../components/TestSummaryWidget";

interface Workflowrun {
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


export default function Dashboard() {
    const [workflowRuns, setWorkflowRuns] = useState<Workflowrun[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");
    const [ownerInput, setOwnerInput] = useState<string>(() =>
        localStorage.getItem("ciDashboardOwner") ?? "DewaldFourie"
    );
    const [repoInput, setRepoInput] = useState<string>(() =>
        localStorage.getItem("ciDashboardRepo") ?? "StickerSmash"
    );
    const [owner, setOwner] = useState<string>(() =>
        localStorage.getItem("ciDashboardOwner") ?? "DewaldFourie"
    );
    const [repo, setRepo] = useState<string>(() =>
        localStorage.getItem("ciDashboardRepo") ?? "StickerSmash"
    );


    const loadRuns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWorkflowRuns(owner, repo);
            setWorkflowRuns(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, [owner, repo]);

    const handleTrack = () => {
        if (!ownerInput || !repoInput) return alert("Both fields are required.");
        setWorkflowRuns([]);
        setError(null);
        setOwner(ownerInput.trim());
        setRepo(repoInput.trim());
    };

    // Initial fetch
    useEffect(() => {
        loadRuns();
    }, [loadRuns]);

    // Poll every interval seconds
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("🔄 Polling GitHub for new workflow runs...");
            loadRuns();
        }, 180000);

        return () => clearInterval(interval); // cleanup
    }, [loadRuns]);

    // add localStorage for current owner and repo
    useEffect(() => {
        localStorage.setItem("ciDashboardOwner", owner);
        localStorage.setItem("ciDashboardRepo", repo);
    }, [owner, repo]);


    const filteredRuns = workflowRuns.filter(run =>
        filter === "all" ? true : run.conclusion === filter
    );

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex flex-col">
                <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 text-center flex items-center justify-center">Latest Workflow Runs</h2>
                        <button
                            onClick={() => {
                                setLoading(true);
                                loadRuns();
                            }}
                            className="px-3 py-1 bg-gray-900 text-white text-sm rounded hover:text-emerald-400 transition"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded shadow text-center">
                            <p className="text-gray-500 text-sm">Total Runs</p>
                            <p className="text-xl font-bold">{workflowRuns.length}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded shadow text-center">
                            <p className="text-gray-500 text-sm">Successes</p>
                            <p className="text-xl font-bold">
                                {workflowRuns.filter(run => run.conclusion === "success").length}
                            </p>
                        </div>
                        <div className="bg-red-100 p-4 rounded shadow text-center">
                            <p className="text-gray-500 text-sm">Failures</p>
                            <p className="text-xl font-bold">
                                {workflowRuns.filter(run => run.conclusion === "failure").length}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded shadow text-center">
                            <p className="text-gray-500 text-sm">In Progress</p>
                            <p className="text-xl font-bold">
                                {workflowRuns.filter(run => run.status === "in_progress").length}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded shadow text-center">
                            <p className="text-gray-500 text-sm">Success Rate</p>
                            <p className="text-xl font-bold">
                                {workflowRuns.length > 0
                                    ? `${(
                                        (workflowRuns.filter(run => run.conclusion === "success").length /
                                            workflowRuns.length) *
                                        100
                                    ).toFixed(1)}%`
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="min-h-[125px] mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Summary</h2>
                        {workflowRuns.length > 0 ? (
                            <TestSummaryWidget
                                owner={owner}
                                repo={repo}
                                runId={workflowRuns[0].id}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center min-h-[50px] text-sm text-gray-400">
                                No data to display.
                            </div>
                        )}
                    </div>
                    <hr className="border-t border-gray-300 my-4" />
                    <div className="mb-4">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mr-2">Filter by status:</label>
                        <select
                            id="status-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-2 py-1 border rounded"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                            <option value="in_progress">In Progress</option>
                        </select>
                    </div>
                    {(loading || error) && (
                        <div className="my-4 flex items-center justify-center min-h-[250px]">
                            {loading && (
                                <p className="animate-pulse text-gray-500">Loading...</p>
                            )}
                            {error && (
                                <p className="text-red-600 font-medium whitespace-pre-line text-center">{error}</p>
                            )}
                        </div>
                    )}
                    {!loading && !error && (
                        <div className="overflow-y-auto max-h-[820px]">
                            {filteredRuns.length > 0 ? (
                                <ul className="space-y-4 pb-14">
                                    {filteredRuns.map(run => (
                                        <li key={run.id} className="p-4 bg-white rounded shadow space-y-1">
                                            <a
                                                href={run.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-black font-semibold hover:underline"
                                            >
                                                {run.name}
                                            </a>
                                            <p className="text-sm text-gray-500">
                                                Status: {run.status} | Result:{" "}
                                                <span
                                                    className={
                                                        run.conclusion === "success"
                                                            ? "text-green-600 font-medium"
                                                            : run.conclusion === "failure"
                                                                ? "text-red-600 font-medium"
                                                                : run.status === "in_progress"
                                                                    ? "text-orange-500 font-medium"
                                                                    : "text-gray-600"
                                                    }
                                                >
                                                    {run.conclusion ?? run.status}
                                                </span>
                                            </p>
                                            <div className="text-sm text-gray-500">
                                                <span>Triggered by: </span>
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={run.actor.html_url}
                                                        className="text-blue-500 hover:underline mt-1"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {run.actor.login}
                                                    </a>
                                                    <img
                                                        src={run.actor.avatar_url}
                                                        alt={run.actor.login}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Branch: <span className="font-medium text-gray-700">{run.head_branch}</span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Duration:{" "}
                                                {Math.floor(
                                                    (new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000
                                                )}{" "}
                                                seconds
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Created: {new Date(run.created_at).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col min-h-[250px] items-center justify-center text-sm text-gray-400">
                                    <p>No runs to Display</p>
                                    {workflowRuns.length === 0 && <p>Make sure the Repository has at least one GitHub Actions workflow</p>}
                                    <button
                                        onClick={() => {
                                            setLoading(true);
                                            loadRuns();
                                        }}
                                        className="px-3 py-1 my-4 bg-gray-900 text-white text-sm rounded hover:text-emerald-400 transition"
                                    >
                                        ↻ Refresh
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
