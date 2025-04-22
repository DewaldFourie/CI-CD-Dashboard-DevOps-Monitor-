

export default function Sidebar() {
    return (
        <aside className="w-64 h-full bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold mb-6">CI/CD DevOps</h2>
            <nav className="space-y-4">
                <a href="#" className="block hover:text-emerald-400">GitHub Projects</a>
                <a href="#" className="block hover:text-emerald-400">Deployments</a>
                <a href="#" className="block hover:text-emerald-400">Settings</a>
            </nav>
        </aside>
    );
}
