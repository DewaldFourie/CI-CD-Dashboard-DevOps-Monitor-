

export default function Header() {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="text-gray-600 text-sm">Logged in as <span className="font-bold">dewald.dev</span></div>
        </header>
    );
}
