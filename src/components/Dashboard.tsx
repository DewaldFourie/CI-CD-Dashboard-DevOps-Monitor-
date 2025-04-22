import { useEffect, useState } from "react";
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchWorkflowRuns } from "../services/GitHubService";

interface Workflowrun {
    id: number;
    name: string;
    status: string;
    conclusion: string;
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

    useEffect(() => {
        async function loadRuns() {
            try {
                const data = await fetchWorkflowRuns("DewaldFourie", "StickerSmash");
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
        }

        loadRuns();
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
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Latest Workflow Runs</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
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
                                    Status: {run.status} | Result: {run.conclusion}
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
                </main>
            </div>
        </div>
    );
}
