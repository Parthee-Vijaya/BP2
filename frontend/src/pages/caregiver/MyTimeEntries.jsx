import { useState, useEffect } from 'react';
import { timeEntriesApi } from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, formatHours } from '../../utils/helpers';

// Icons
const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CommentIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Helper functions
function formatShortDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

function getDayName(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Søn.', 'Man.', 'Tirs.', 'Ons.', 'Tors.', 'Fre.', 'Lør.'];
    return days[date.getDay()];
}

function formatTimeBreakdown(entry) {
    const parts = [];
    if (entry.evening_hours > 0) {
        parts.push({ label: 'Aften', value: entry.evening_hours, color: 'bg-amber-100 text-amber-800 border border-amber-200' });
    }
    if (entry.night_hours > 0) {
        parts.push({ label: 'Nat', value: entry.night_hours, color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' });
    }
    if (entry.saturday_hours > 0) {
        parts.push({ label: 'Lørdag', value: entry.saturday_hours, color: 'bg-blue-100 text-blue-800 border border-blue-200' });
    }
    if (entry.sunday_holiday_hours > 0) {
        parts.push({ label: 'Søn/Hellig', value: entry.sunday_holiday_hours, color: 'bg-purple-100 text-purple-800 border border-purple-200' });
    }
    return parts;
}

export default function MyTimeEntries({ caregiverId = 1 }) {
    const [entries, setEntries] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, entry: null, isLoading: false });
    const [commentModal, setCommentModal] = useState({ isOpen: false, comment: '', entry: null });

    useEffect(() => {
        loadEntries();
    }, [activeTab, caregiverId]);

    async function loadEntries() {
        setLoading(true);
        try {
            const data = await timeEntriesApi.getAll({
                caregiver_id: caregiverId,
                status: activeTab
            });
            setEntries(data);
        } catch (error) {
            console.error('Fejl ved indlæsning:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleDelete(entry) {
        setDeleteConfirm({ isOpen: true, entry, isLoading: false });
    }

    async function confirmDelete() {
        if (!deleteConfirm.entry) return;

        setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
        try {
            await timeEntriesApi.delete(deleteConfirm.entry.id);
            setDeleteConfirm({ isOpen: false, entry: null, isLoading: false });
            loadEntries();
        } catch (error) {
            alert('Fejl ved sletning: ' + error.message);
            setDeleteConfirm(prev => ({ ...prev, isLoading: false }));
        }
    }

    function cancelDelete() {
        if (!deleteConfirm.isLoading) {
            setDeleteConfirm({ isOpen: false, entry: null, isLoading: false });
        }
    }

    function openCommentModal(entry) {
        setCommentModal({ isOpen: true, comment: entry.comment, entry });
    }

    function closeCommentModal() {
        setCommentModal({ isOpen: false, comment: '', entry: null });
    }

    const tabs = [
        { id: 'pending', label: 'Afventer', icon: <ClockIcon />, color: 'amber' },
        { id: 'approved', label: 'Godkendt', icon: <CheckIcon />, color: 'emerald' },
        { id: 'rejected', label: 'Afvist', icon: <XIcon />, color: 'rose' }
    ];

    // Calculate summary
    const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
    const normalHours = entries.reduce((sum, e) => sum + (e.normal_hours || 0), 0);
    const eveningHours = entries.reduce((sum, e) => sum + (e.evening_hours || 0), 0);
    const nightHours = entries.reduce((sum, e) => sum + (e.night_hours || 0), 0);
    const saturdayHours = entries.reduce((sum, e) => sum + (e.saturday_hours || 0), 0);
    const sundayHours = entries.reduce((sum, e) => sum + (e.sunday_holiday_hours || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#B54A32] to-[#9a3f2b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#B54A32]/30">
                        <ClockIcon />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mine Registreringer</h2>
                        <p className="text-gray-500 mt-0.5">Se status på dine indberettede timer</p>
                    </div>
                </div>
            </div>

            {/* Main content card */}
            <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Tabs */}
                <div className="border-b border-white/20 flex bg-white/30">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-[#B54A32] text-[#B54A32] bg-white/50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/30'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-[#B54A32]' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Summary bar */}
                {entries.length > 0 && (
                    <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 uppercase text-xs font-semibold tracking-wider">Opsummering:</span>
                            <span className="font-bold text-gray-900">{entries.length}</span>
                            <span className="text-gray-500">stk</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-[#B54A32]/10 text-[#B54A32] rounded text-xs font-bold">
                                {formatHours(totalHours)}
                            </span>
                            <span className="text-gray-500 text-xs">timer total</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-bold">
                                {formatHours(normalHours)}
                            </span>
                            <span className="text-gray-500 text-xs">normal</span>
                        </div>
                        {(eveningHours > 0 || nightHours > 0 || saturdayHours > 0 || sundayHours > 0) && (
                            <>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500 text-xs font-semibold">Tillæg:</span>
                                {eveningHours > 0 && (
                                    <span className="text-xs text-gray-600">Aften: <strong>{formatHours(eveningHours)}</strong></span>
                                )}
                                {nightHours > 0 && (
                                    <span className="text-xs text-gray-600">Nat: <strong>{formatHours(nightHours)}</strong></span>
                                )}
                                {saturdayHours > 0 && (
                                    <span className="text-xs text-gray-600">Lørdag: <strong>{formatHours(saturdayHours)}</strong></span>
                                )}
                                {sundayHours > 0 && (
                                    <span className="text-xs text-gray-600">Søn/Hellig: <strong>{formatHours(sundayHours)}</strong></span>
                                )}
                            </>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-[#B54A32] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Indlæser...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400 shadow-inner">
                            <DocumentIcon />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Ingen registreringer</h3>
                        <p className="text-gray-500 mt-1">Ingen registreringer i denne kategori</p>
                    </div>
                ) : (
                    /* TABLE VIEW */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barn</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dato</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tid</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Normaltimer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tillæg</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Handlinger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.map((entry) => {
                                    const timeBreakdown = formatTimeBreakdown(entry);

                                    return (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {entry.child_first_name} {entry.child_last_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">{formatShortDate(entry.date)}</div>
                                                <div className="text-xs text-gray-500 capitalize">{getDayName(entry.date)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {entry.start_time?.slice(0,5)} - {entry.end_time?.slice(0,5)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-gray-900">{formatHours(entry.normal_hours)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {timeBreakdown.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {timeBreakdown.map((item, idx) => (
                                                            <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.color}`}>
                                                                {item.label}: {formatHours(item.value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={entry.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Kommentar knap */}
                                                    {entry.comment && (
                                                        <button
                                                            onClick={() => openCommentModal(entry)}
                                                            className="p-2 text-gray-500 hover:text-[#B54A32] hover:bg-[#B54A32]/10 rounded-lg transition-colors"
                                                            title="Se kommentar"
                                                        >
                                                            <CommentIcon />
                                                        </button>
                                                    )}
                                                    {/* Slet-knap kun for pending */}
                                                    {entry.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleDelete(entry)}
                                                            className="p-2 text-[#c62828] hover:bg-[#c62828]/10 rounded-lg transition-colors"
                                                            title="Slet registrering"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    )}
                                                    {/* Se afvisningsårsag */}
                                                    {entry.status === 'rejected' && entry.rejection_reason && (
                                                        <button
                                                            onClick={() => openCommentModal({ ...entry, comment: entry.rejection_reason, isRejection: true })}
                                                            className="text-[#8a5a5a] hover:text-[#7a4a4a] text-xs font-medium underline"
                                                        >
                                                            Se årsag
                                                        </button>
                                                    )}
                                                    {/* Godkendt info */}
                                                    {entry.status === 'approved' && entry.payroll_date && (
                                                        <span className="text-xs text-[#5a7a6a] font-medium">
                                                            Sendt {formatShortDate(entry.payroll_date)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                variant="warning"
                title="Slet registrering"
                message={deleteConfirm.entry
                    ? `Er du sikker på at du vil slette registreringen for ${deleteConfirm.entry.child_first_name} ${deleteConfirm.entry.child_last_name} den ${formatDate(deleteConfirm.entry.date)}? Denne handling kan ikke fortrydes.`
                    : 'Er du sikker på at du vil slette denne registrering? Denne handling kan ikke fortrydes.'
                }
                confirmText="Slet"
                cancelText="Annuller"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isLoading={deleteConfirm.isLoading}
            />

            {/* Comment/Rejection Modal */}
            {commentModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-fade-in-up">
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${
                            commentModal.entry?.isRejection ? 'bg-[#8a5a5a]/10' : 'bg-gray-50'
                        }`}>
                            <h3 className={`font-bold ${commentModal.entry?.isRejection ? 'text-[#8a5a5a]' : 'text-gray-900'}`}>
                                {commentModal.entry?.isRejection ? 'Årsag til afvisning' : 'Kommentar'}
                            </h3>
                            <button
                                onClick={closeCommentModal}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6">
                            {commentModal.entry && (
                                <div className="mb-4 pb-4 border-b border-gray-100">
                                    <div className="text-sm text-gray-500">
                                        {commentModal.entry.child_first_name} {commentModal.entry.child_last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatShortDate(commentModal.entry.date)} • {commentModal.entry.start_time?.slice(0,5)} - {commentModal.entry.end_time?.slice(0,5)}
                                    </div>
                                </div>
                            )}
                            <p className={`text-sm ${commentModal.entry?.isRejection ? 'text-[#8a5a5a]' : 'text-gray-700'}`}>
                                {commentModal.comment}
                            </p>
                            {commentModal.entry?.isRejection && commentModal.entry?.reviewed_by && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Afvist af {commentModal.entry.reviewed_by} • {formatDate(commentModal.entry.reviewed_at)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Bemærk: Afviste registreringer kan ikke rettes. Opret en ny registrering i stedet.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end rounded-b-2xl">
                            <button
                                onClick={closeCommentModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Luk
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
