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

export default function TestSummaryWidget({ owner, repo, runId }: Props) {
    const [summary, setSummary] = useState<TestSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadSummary() {
            try {
                setLoading(true);
                const artifacts = await fetchArtifacts(owner, repo, runId);
                const testArtifact = artifacts.find((a: {name: string}) =>
                    /test|results/i.test(a.name)
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
                    setError(err.message);
                } else {
                    console.error("Unexpected error:", err);
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

    return (
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-4 text-center max-w-sm mx-auto">
            <h3 className="text-ml text-gray-600 mb-2 font-semibold">Test Summary</h3>
            <div className="text-lg font-semibold space-x-5">
                <span className="text-green-600">✅ {summary?.numPassedTestSuites ?? 0}</span>
                <span className="text-red-500">❌ {summary?.numFailedTestSuites ?? 0}</span>
                <span className="text-yellow-500">⚠️ {summary?.numPendingTestSuites ?? 0}</span>
            </div>
        </div>
    );
}
