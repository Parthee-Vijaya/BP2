import { formatHours, calculateGrantPercentage, getGrantStatusColor } from '../utils/helpers';

// Warning icon SVG
const WarningIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export default function GrantStatusBadge({ used, total, showBar = true }) {
    const percentage = calculateGrantPercentage(used, total);
    const color = getGrantStatusColor(percentage);

    // Muted color scheme
    const colorClasses = {
        green: 'bg-[#5a7a6a]/10 text-[#5a7a6a] border-[#5a7a6a]/20',
        yellow: 'bg-[#8a7a55]/10 text-[#8a7a55] border-[#8a7a55]/20',
        red: 'bg-[#8a5a5a]/10 text-[#8a5a5a] border-[#8a5a5a]/20'
    };

    const barColorClasses = {
        green: 'bg-[#5a7a6a]',
        yellow: 'bg-[#8a7a55]',
        red: 'bg-[#8a5a5a]'
    };

    return (
        <div className="space-y-2">
            <div className={`
                inline-flex items-center gap-2 px-3 py-1.5
                rounded-full border text-xs font-medium
                backdrop-blur-sm shadow-sm
                transition-all duration-300 hover:shadow-md
                ${colorClasses[color]}
            `}>
                <span className="font-bold">{formatHours(used)}</span>
                <span className="text-gray-400">/</span>
                <span>{formatHours(total)} timer</span>
                {percentage >= 100 && (
                    <span className="ml-1 text-[#8a5a5a] animate-pulse">
                        <WarningIcon />
                    </span>
                )}
            </div>

            {showBar && (
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                    <div
                        className={`
                            h-2 rounded-full transition-all duration-500 ease-out
                            ${barColorClasses[color]}
                        `}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
