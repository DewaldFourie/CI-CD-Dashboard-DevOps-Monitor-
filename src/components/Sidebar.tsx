
import { NavLink } from 'react-router-dom';
import { Home, CloudUpload, Cog } from 'lucide-react';

export default function Sidebar() {
    const linkClass = ({ isActive }: { isActive: boolean; }) =>
        `flex items-center gap-2 px-3 py-2 rounded ${isActive ? 'bg-emerald-400 text-gray-900' : 'hover:text-emerald-400'
        }`;

    const currentYear = new Date().getFullYear();

    return (
        <aside className="w-64 h-full bg-gray-900 text-white p-4 flex flex-col justify-between">
            <div>
                <div className='flex justify-between'>
                    <h2 className="text-xl font-bold mb-6">CI/CD DevOps</h2>
                    <img className='w-8 h-8' src="/ci-cd.svg" alt="" />
                </div>
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
            </div>

            {/* Footer */}
            <div className="mt-6 text-sm text-gray-400 text-center">
                <p>Version 1.0.0</p>
                <p>Created by: ©<a href="https://github.com/DewaldFourie" className="hover:text-emerald-400 underline" target="_blank" rel="noopener noreferrer">DewaldFourie</a> {currentYear}</p>
            </div>
        </aside>
    );
}
