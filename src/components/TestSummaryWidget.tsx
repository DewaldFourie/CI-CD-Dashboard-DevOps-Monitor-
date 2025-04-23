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

    useEffect(() => {
        async function loadSummary() {
            try {
                const artifacts = await fetchArtifacts(owner, repo, runId);
                const testArtifact = artifacts.find((a: { name: string }) =>
                    a.name.toLowerCase().includes("test") || a.name.toLowerCase().includes("results")
                );
                
                if (!testArtifact) {
                    setError("No test summary found.");
                    return;
                }

                const res = await fetch(testArtifact.archive_download_url, {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                });

                const blob = await res.blob();
                const zip = await JSZip.loadAsync(blob); // You'll need `jszip` library
                const file = zip.file(/.*\.json/)[0];
                const content = await file.async("string");
                const json = JSON.parse(content);
                console.log("json test summary:", json);
        
                setSummary(json);
            } catch (err) {
                console.error(err);
                setError("Failed to load test summary.");
            }
        }

        loadSummary();
    }, [owner, repo, runId]);

    if (error) return <div className="text-red-500 text-sm">{error}</div>;
    if (!summary) return <div>Loading test summary...</div>;

    return (
        <div className="bg-blue-100 p-4 rounded shadow text-center">
            <p className="text-gray-500 text-sm">Test Results</p>
            <p className="text-xl font-bold">✅ {summary.numPassedTestSuites} | ❌ {summary.numFailedTestSuites} | ⚠️ {summary.numPendingTestSuites}</p>
        </div>
    );
}