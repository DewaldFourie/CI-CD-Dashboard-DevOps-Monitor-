
import { useState, useEffect } from 'react';

export default function Settings() {
    const [owner, setOwner] = useState(localStorage.getItem('ciDashboardOwner') || '');
    const [repo, setRepo] = useState(localStorage.getItem('ciDashboardRepo') || '');
    const [token, setToken] = useState('************************************');
    const [pollInterval, setPollInterval] = useState(
        Number(localStorage.getItem('ciDashboardPoll') || '180000')
    );

    useEffect(() => {
        localStorage.setItem('ciDashboardOwner', owner);
        localStorage.setItem('ciDashboardRepo', repo);
        localStorage.setItem('ciDashboardPoll', pollInterval.toString());
    }, [owner, repo, pollInterval]);

    return (
        <div className="max-w-lg  text-gray-700 m-5 p-3 justify-start">
            <h1 className="text-2xl font-semibold mb-6">Configure Default Settings</h1>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm">Default Owner</label>
                    <input
                        className="mt-1 w-full px-3 py-2 border rounded"
                        value={owner}
                        onChange={e => setOwner(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm">Default Repo</label>
                    <input
                        className="mt-1 w-full px-3 py-2 border rounded"
                        value={repo}
                        onChange={e => setRepo(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm">Poll Interval (ms)</label>
                    <input
                        type="number"
                        className="mt-1 w-full px-3 py-2 border rounded"
                        value={pollInterval}
                        onChange={e => setPollInterval(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-sm">GitHub Token</label>
                    <input
                        type="password"
                        className="mt-1 w-full px-3 py-2 border rounded bg-gray-100"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Token must be set in <code>.env</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
