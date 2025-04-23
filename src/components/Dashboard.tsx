import { useEffect, useState } from "react";
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchWorkflowRuns } from "../services/GitHubService";
import TestSummaryWidget  from "../components/TestSummaryWidget";

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

    const loadRuns = async () => {
        try {
            const data = await fetchWorkflowRuns("DewaldFourie", "CI-CD-Dashboard-DevOps-Monitor-");
            console.log("WorkflowRuns fetched:", data);
            setWorkflowRuns(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        loadRuns();
    }, []);

    // Poll every 180s
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("🔄 Polling GitHub for new workflow runs...");
            loadRuns();
        }, 180000);

        return () => clearInterval(interval); // cleanup
    }, []);


    const filteredRuns = workflowRuns.filter(run =>
        filter === "all" ? true : run.conclusion === filter
    );

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Latest Workflow Runs</h2>
                        <button
                            onClick={() => {
                                setLoading(true);
                                loadRuns();
                            }}
                            className="px-3 py-1 bg-white text-blue-600 text-sm rounded hover:bg-blue-600 hover:text-white transition"
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
                    <div className="min-h-[95px] mb-6">
                        {workflowRuns.length > 0 ? (
                            <TestSummaryWidget
                                owner="DewaldFourie"
                                repo="CI-CD-Dashboard-DevOps-Monitor-"
                                runId={workflowRuns[0].id}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">
                                No data to display.
                            </div>
                        )}
                    </div>
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

                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="overflow-y-auto max-h-[500px]">
                        <ul className="space-y-4">
                            {filteredRuns.map(run => (
                                <li key={run.id} className="p-4 bg-white rounded shadow space-y-1">
                                    <a
                                        href={run.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 font-semibold hover:underline"
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
                                    <p className="text-sm text-gray-500">
                                        Triggered by:{" "}
                                        <a
                                            href={run.actor.html_url}
                                            className="text-blue-500 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {run.actor.login}
                                        </a>
                                    </p>
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
                    </div>

                </main>
            </div>
        </div>
    );
}
