
import { NavLink } from 'react-router-dom';
import { Home, CloudUpload, Cog } from 'lucide-react'; // icons from lucide-react

export default function Sidebar() {
    const linkClass = ({ isActive }: { isActive: boolean; }) =>
        `flex items-center gap-2 px-3 py-2 rounded ${isActive ? 'bg-emerald-400 text-gray-900' : 'hover:text-emerald-400'
        }`;

    return (
        <aside className="w-64 h-full bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold mb-6">CI/CD DevOps</h2>
            <nav className="space-y-2">
                <NavLink to="/dashboard" className={linkClass}>
                    <Home size={16} /> Dashboard
                </NavLink>
                <NavLink to="/deployments" className={linkClass}>
                    <CloudUpload size={16} /> Deployments
                </NavLink>
                <NavLink to="/settings" className={linkClass}>
                    <Cog size={16} /> Settings
                </NavLink>
            </nav>
        </aside>
    );
}


