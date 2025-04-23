import { useEffect, useState } from "react";
import { fetchArtifacts } from "../services/GitHubService";
import JSZip from "jszip";

interface TestSummary {
    numPassedTestSuites: number;
    numFailedTestSuites: number;
    numPendingTestSuites: number;
}

interface Props {
    owner: string;
    repo: string;
    runId: number;
}

type Artifact = {
    id: number;
    name: string;
    archive_download_url: string;
};

export default function TestSummaryWidget({ owner, repo, runId }: Props) {
    const [summary, setSummary] = useState<TestSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadSummary() {
            try {
                setLoading(true);
                const artifacts = await fetchArtifacts(owner, repo, runId);
                console.log("Artifacts available:", artifacts.map((a: Artifact) => a.name));
                const testArtifact = artifacts.find((a: Artifact) =>
                    /test|results|dummy/i.test(a.name)
                );
    

                if (!testArtifact) {
                    throw new Error("No test summary found.");
                }

                const res = await fetch(testArtifact.archive_download_url, {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                });

                const blob = await res.blob();
                const zip = await JSZip.loadAsync(blob);
                const files = Object.keys(zip.files);
                console.log("Files in zip:", files);
                const jsonFile = zip.file(/.*\.json/)?.[0];

                if (!jsonFile) {
                    throw new Error("No JSON file found in test artifact.");
                }

                const content = await jsonFile.async("string");
                const json = JSON.parse(content);
                console.log("json test summary:", json);

                setSummary(json);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error("Error loading test summary:", err);
                    setError(err.message || "Failed to load test summary.");
                } else {
                    console.error("An unknown error occurred:", err);
                    setError("Failed to load test summary.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadSummary();
    }, [owner, repo, runId]);

    if (loading) {
        return <div className="text-gray-500 text-center text-sm animate-pulse">Loading test summary...</div>;
    }

    if (error) {
        return <div className="text-red-500 font-medium text-center text-sm">{error}</div>;
    }

    const totalTests =
        (summary?.numPassedTestSuites ?? 0) +
        (summary?.numFailedTestSuites ?? 0) +
        (summary?.numPendingTestSuites ?? 0);

return (
    <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow text-center">
                <p className="text-gray-500 text-sm">Total Tests</p>
                <p className="text-xl font-bold">{totalTests}</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow text-center">
                <p className="text-gray-500 text-sm">Successes</p>
                <p className="text-xl font-bold">{summary?.numPassedTestSuites ?? 0}</p>
            </div>
            <div className="bg-red-100 p-4 rounded shadow text-center">
                <p className="text-gray-500 text-sm">Failures</p>
                <p className="text-xl font-bold">{summary?.numFailedTestSuites ?? 0}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded shadow text-center">
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-xl font-bold">{summary?.numPendingTestSuites ?? 0}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded shadow text-center">
                <p className="text-gray-500 text-sm">Success Rate</p>
                <p className="text-xl font-bold">
                    {totalTests > 0
                        ? `${((summary?.numPassedTestSuites ?? 0) / totalTests * 100).toFixed(1)}%`
                        : "N/A"}
                </p>
            </div>
        </div>
    </div>
);


    
}
