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
    // Muted color scheme
    const statusClasses = {
        pending: 'bg-[#8a7a55]/10 text-[#8a7a55] border-[#8a7a55]/20',
        approved: 'bg-[#5a7a6a]/10 text-[#5a7a6a] border-[#5a7a6a]/20',
        rejected: 'bg-[#8a5a5a]/10 text-[#8a5a5a] border-[#8a5a5a]/20'
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full border text-xs font-medium
            backdrop-blur-sm shadow-sm
            transition-all duration-300 hover:shadow-md
            ${statusClasses[status] || ''}
        `}>
            <StatusIcon status={status} />
            <span>{translateStatus(status)}</span>
        </span>
    );
}
