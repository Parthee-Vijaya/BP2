import { translateStatus } from '../utils/helpers';

const StatusIcon = ({ status }) => {
    if (status === 'pending') {
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    if (status === 'approved') {
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};

export default function StatusBadge({ status }) {
    const statusClasses = {
        pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20 shadow-amber-500/10',
        approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-emerald-500/10',
        rejected: 'bg-rose-500/10 text-rose-700 border-rose-500/20 shadow-rose-500/10'
    };

    const glowClasses = {
        pending: 'hover:shadow-amber-500/20',
        approved: 'hover:shadow-emerald-500/20',
        rejected: 'hover:shadow-rose-500/20'
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full border text-xs font-medium
            backdrop-blur-sm shadow-lg
            transition-all duration-300
            ${statusClasses[status] || ''}
            ${glowClasses[status] || ''}
        `}>
            <StatusIcon status={status} />
            <span>{translateStatus(status)}</span>
        </span>
    );
}
