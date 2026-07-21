'use client';

interface User {
    name: string;
    avatarUrl?: string;
}

interface DashboardHeaderProps {
    user: User | null;
    greeting?: string;
    onProfileClick?: () => void;
}

export default function DashboardHeader({
                                            user,
                                            greeting = 'Good Morning!',
                                            onProfileClick,
                                        }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-20 bg-black border-b border-gray-800">
            {/* ADJUSTED: Increased padding from py-4 to py-5 for a slightly taller header */}
            <div className="px-6 py-5 flex items-center justify-between">

                {/* LEFT SECTION: Avatar + Greeting/Name Column */}
                <div className="flex items-center gap-4"> {/* ADJUSTED: Gap increased from gap-3 to gap-4 */}

                    {/* Avatar */}
                    {/* ADJUSTED: Increased size from w-10 h-10 to w-12 h-12 */}
                    <button
                        onClick={onProfileClick}
                        className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
                    >
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user?.name || 'User avatar'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            /* ADJUSTED: Increased fallback text size from text-sm to text-base */
                            <span className="text-base font-semibold text-gray-200">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        )}
                    </button>

                    {/* Text Column */}
                    <div className="flex flex-col">
                        {/* ADJUSTED: Increased greeting font size from text-xs to text-sm */}
                        <span className="text-sm text-gray-400 font-medium">
                            {greeting}
                        </span>
                        {/* ADJUSTED: Increased name font size from text-base to text-lg or text-xl */}
                        <h2 className="text-lg font-bold text-white leading-tight">
                            {user?.name || 'Guest'}
                        </h2>
                    </div>
                </div>

                {/* RIGHT SECTION: Brand Logos */}
                <div className="flex items-center gap-4"> {/* ADJUSTED: Gap increased from gap-3 to gap-4 */}
                    <button className="transition-opacity hover:opacity-100 opacity-100">
                        <img
                            src="/bee-trendy.png"
                            alt="Bee Trendy Collection"
                            className="h-10 w-auto"
                        />
                    </button>

                    {/* ADJUSTED: Increased text size of separator from default to text-xl */}
                    <span className="text-gray-600 font-light text-xl">|</span>

                    <button className="transition-opacity hover:opacity-100 opacity-60">
                        <img
                            src="/baddyOnABudget.png"
                            alt="Baddie on a Budget Closet"
                            className="h-10 w-auto"
                        />
                    </button>
                </div>

            </div>
        </header>
    );
}