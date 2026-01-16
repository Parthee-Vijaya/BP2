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

    const colorClasses = {
        green: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
        yellow: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        red: 'bg-rose-500/10 text-rose-700 border-rose-500/20'
    };

    const barColorClasses = {
        green: 'from-emerald-400 to-emerald-600',
        yellow: 'from-amber-400 to-amber-600',
        red: 'from-rose-400 to-rose-600'
    };

    const glowClasses = {
        green: 'shadow-emerald-500/20',
        yellow: 'shadow-amber-500/20',
        red: 'shadow-rose-500/20'
    };

    return (
        <div className="space-y-2">
            <div className={`
                inline-flex items-center gap-2 px-3 py-1.5
                rounded-full border text-xs font-medium
                backdrop-blur-sm shadow-lg
                transition-all duration-300
                ${colorClasses[color]}
                ${glowClasses[color]}
            `}>
                <span className="font-bold">{formatHours(used)}</span>
                <span className="text-gray-400">/</span>
                <span>{formatHours(total)} timer</span>
                {percentage >= 100 && (
                    <span className="ml-1 text-rose-600 animate-pulse">
                        <WarningIcon />
                    </span>
                )}
            </div>

            {showBar && (
                <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden shadow-inner border border-white/20">
                    <div
                        className={`
                            h-2 rounded-full transition-all duration-500 ease-out
                            bg-gradient-to-r ${barColorClasses[color]}
                            shadow-lg
                        `}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
