import { useEffect, useRef } from 'react';

// Icons
const WarningIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const DangerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const variantStyles = {
    danger: {
        icon: <DangerIcon />,
        iconBg: 'bg-[#8a5a5a]',
        confirmBtn: 'bg-[#8a5a5a] hover:bg-[#7a4a4a] text-white',
    },
    warning: {
        icon: <WarningIcon />,
        iconBg: 'bg-[#8a7a55]',
        confirmBtn: 'bg-[#8a7a55] hover:bg-[#7a6a45] text-white',
    },
    info: {
        icon: <InfoIcon />,
        iconBg: 'bg-[#5a7a8a]',
        confirmBtn: 'bg-[#5a7a8a] hover:bg-[#4a6a7a] text-white',
    },
};

export default function ConfirmDialog({
    isOpen,
    title = 'Bekræft handling',
    message = 'Er du sikker på at du vil fortsætte?',
    confirmText = 'Bekræft',
    cancelText = 'Annuller',
    variant = 'danger',
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    const dialogRef = useRef(null);
    const confirmBtnRef = useRef(null);
    const styles = variantStyles[variant] || variantStyles.danger;

    // Focus trap and escape key
    useEffect(() => {
        if (isOpen) {
            // Focus the confirm button when dialog opens
            confirmBtnRef.current?.focus();

            const handleEscape = (e) => {
                if (e.key === 'Escape' && !isLoading) {
                    onCancel();
                }
            };

            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onCancel();
                }
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-message"
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`w-14 h-14 ${styles.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {styles.icon}
                    </div>
                </div>

                {/* Title */}
                <h2
                    id="dialog-title"
                    className="text-xl font-bold text-gray-900 text-center mb-2"
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    id="dialog-message"
                    className="text-gray-600 text-center mb-6"
                >
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-3 ${styles.confirmBtn} rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Vent...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
