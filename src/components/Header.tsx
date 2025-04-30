

import { useLocation } from 'react-router-dom';

export default function Header() {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'Dashboard';
            case '/deployments':
                return 'Deployments';
            case '/settings':
                return 'Settings';
            default:
                return 'CI/CD DevOps Monitor';
        }
    };

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow">
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
            <div className="text-gray-600 text-sm">
                Logged in as <span className="font-bold">dewald.dev</span>
            </div>
        </header>
    );
}

