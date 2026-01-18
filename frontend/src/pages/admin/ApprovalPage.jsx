import { useState, useEffect } from 'react';
import { timeEntriesApi, childrenApi, caregiversApi, exportApi } from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import { formatHours } from '../../utils/helpers';

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

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CheckMarkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Kort datoformat (dd/mm)
function formatShortDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit' });
}

// Fuldt datoformat (dd/mm/åå)
function formatMediumDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function ApprovalPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [entries, setEntries] = useState([]);
    const [children, setChildren] = useState([]);
    const [caregivers, setCaregivers] = useState([]);
    const [grantSummaries, setGrantSummaries] = useState({});
    const [selectedChild, setSelectedChild] = useState('all');
    const [selectedCaregiver, setSelectedCaregiver] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [rejectModal, setRejectModal] = useState({ open: false, entryId: null });
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab, selectedChild, selectedCaregiver]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { status: activeTab };
            if (selectedChild !== 'all') {
                params.child_id = selectedChild;
            }
            if (selectedCaregiver !== 'all') {
                params.caregiver_id = selectedCaregiver;
            }

            const [entriesData, childrenData, caregiversData] = await Promise.all([
                timeEntriesApi.getAll(params),
                childrenApi.getAll(),
                caregiversApi.getAll()
            ]);

            setEntries(entriesData);
            setChildren(childrenData);
            setCaregivers(caregiversData);

            // Hent bevillingsstatus for alle børn i entries
            const uniqueChildIds = [...new Set(entriesData.map(e => e.child_id))];
            const summaries = {};
            await Promise.all(
                uniqueChildIds.map(async (childId) => {
                    try {
                        const childData = await childrenApi.getById(childId);
                        if (childData.grantSummary) {
                            summaries[childId] = childData.grantSummary;
                        }
                    } catch (err) {
                        console.error(`Kunne ikke hente bevilling for barn ${childId}:`, err);
                    }
                })
            );
            setGrantSummaries(summaries);
        } catch (error) {
            console.error('Fejl ved indlæsning:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredEntries = entries.filter(entry => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const caregiverName = `${entry.caregiver_first_name} ${entry.caregiver_last_name}`.toLowerCase();
        const maNumber = (entry.ma_number || '').toLowerCase();
        return caregiverName.includes(query) || maNumber.includes(query);
    });

    async function handleApprove(id) {
        try {
            await timeEntriesApi.approve(id, 'Admin');
            loadData();
        } catch (error) {
            alert('Fejl ved godkendelse: ' + error.message);
        }
    }

    async function handleReject() {
        if (!rejectReason.trim()) {
            alert('Angiv venligst en årsag');
            return;
        }

        try {
            await timeEntriesApi.reject(rejectModal.entryId, 'Admin', rejectReason);
            setRejectModal({ open: false, entryId: null });
            setRejectReason('');
            loadData();
        } catch (error) {
            alert('Fejl ved afvisning: ' + error.message);
        }
    }

    async function handleBatchApprove() {
        if (selectedIds.length === 0) {
            alert('Vælg mindst én registrering');
            return;
        }

        try {
            await timeEntriesApi.batchApprove(selectedIds, 'Admin');
            setSelectedIds([]);
            loadData();
        } catch (error) {
            alert('Fejl ved batch-godkendelse: ' + error.message);
        }
    }

    async function handleMarkPayroll(id) {
        try {
            await timeEntriesApi.markPayroll(id);
            loadData();
        } catch (error) {
            alert('Fejl: ' + error.message);
        }
    }

    function toggleSelect(id) {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    }

    function toggleSelectAll() {
        if (selectedIds.length === filteredEntries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEntries.map(e => e.id));
        }
    }

    const tabs = [
        { id: 'pending', label: 'Afventer', icon: <ClockIcon /> },
        { id: 'approved', label: 'Godkendte', icon: <CheckIcon /> },
        { id: 'rejected', label: 'Afviste', icon: <XIcon /> }
    ];

    // Beregn bevillingsstatus for et barn
    function getGrantStatus(childId) {
        const summary = grantSummaries[childId];
        if (!summary) return null;

        const percentage = summary.grantHours > 0
            ? (summary.usedHours / summary.grantHours) * 100
            : 0;

        return {
            usedHours: summary.usedHours,
            grantHours: summary.grantHours,
            percentage,
            isExceeded: percentage >= 100,
            isWarning: percentage >= 90 && percentage < 100
        };
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Godkendelse</h2>
                    <p className="text-gray-500 text-sm">Gennemgå og godkend timeregistreringer</p>
                </div>

                <a
                    href={exportApi.timeEntries({ status: activeTab })}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium shadow-lg shadow-emerald-500/25"
                >
                    <DownloadIcon />
                    CSV
                </a>
            </div>

            {/* Main Content Card */}
            <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
                {/* Tabs */}
                <div className="border-b border-white/20 flex bg-white/30">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#B54A32] to-[#9a3f2b] text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-white' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="p-3 bg-white/20 border-b border-white/20 flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Søg..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 glass-input rounded-lg text-sm w-40"
                        />
                    </div>

                    <select
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        className="glass-input rounded-lg px-2 py-1.5 text-sm"
                    >
                        <option value="all">Alle børn</option>
                        {children.map((child) => (
                            <option key={child.id} value={child.id}>
                                {child.first_name} {child.last_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedCaregiver}
                        onChange={(e) => setSelectedCaregiver(e.target.value)}
                        className="glass-input rounded-lg px-2 py-1.5 text-sm"
                    >
                        <option value="all">Alle barnepiger</option>
                        {caregivers.map((cg) => (
                            <option key={cg.id} value={cg.id}>
                                {cg.first_name} {cg.last_name}
                            </option>
                        ))}
                    </select>

                    {activeTab === 'pending' && filteredEntries.length > 0 && (
                        <button
                            onClick={handleBatchApprove}
                            disabled={selectedIds.length === 0}
                            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                        >
                            <CheckMarkIcon />
                            Godkend ({selectedIds.length})
                        </button>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-[#B54A32] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Indlæser...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 text-white">
                            <CheckIcon />
                        </div>
                        <p className="text-gray-600 font-medium">
                            {searchQuery ? 'Ingen resultater' : 'Ingen registreringer'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/30 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <tr>
                                    {activeTab === 'pending' && (
                                        <th className="px-2 py-3 w-8">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32]"
                                            />
                                        </th>
                                    )}
                                    <th className="px-2 py-3">Barnepige</th>
                                    <th className="px-2 py-3">Barn</th>
                                    <th className="px-2 py-3 text-center">Bevilling</th>
                                    <th className="px-2 py-3">Dato</th>
                                    <th className="px-2 py-3">Tid</th>
                                    <th className="px-2 py-3 text-center">Timer</th>
                                    {activeTab === 'approved' && (
                                        <>
                                            <th className="px-2 py-3">Godkendt</th>
                                            <th className="px-2 py-3">Data sendt</th>
                                        </>
                                    )}
                                    {activeTab === 'rejected' && (
                                        <>
                                            <th className="px-2 py-3">Afvist</th>
                                            <th className="px-2 py-3">Årsag</th>
                                        </>
                                    )}
                                    {activeTab === 'pending' && <th className="px-2 py-3 text-right">Handling</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredEntries.map((entry) => {
                                    const grantStatus = getGrantStatus(entry.child_id);
                                    return (
                                        <tr key={entry.id} className="hover:bg-white/20 transition-colors">
                                            {activeTab === 'pending' && (
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(entry.id)}
                                                        onChange={() => toggleSelect(entry.id)}
                                                        className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32]"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-2 py-2">
                                                <div className="font-medium text-gray-900">{entry.caregiver_first_name} {entry.caregiver_last_name}</div>
                                                <div className="text-xs text-gray-400">{entry.ma_number}</div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="font-medium">{entry.child_first_name} {entry.child_last_name}</div>
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {grantStatus ? (
                                                    <div className={`leading-tight ${
                                                        grantStatus.isExceeded
                                                            ? 'text-rose-600'
                                                            : grantStatus.isWarning
                                                            ? 'text-gray-900'
                                                            : 'text-gray-600'
                                                    }`}>
                                                        <div className={grantStatus.isExceeded || grantStatus.isWarning ? 'font-bold' : ''}>
                                                            {formatHours(grantStatus.usedHours)}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            / {formatHours(grantStatus.grantHours)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="font-medium">{formatShortDate(entry.date)}</div>
                                            </td>
                                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">
                                                {entry.start_time?.slice(0,5)}-{entry.end_time?.slice(0,5)}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <span className="font-bold text-[#B54A32]">{formatHours(entry.total_hours)}</span>
                                            </td>
                                            {activeTab === 'approved' && (
                                                <>
                                                    <td className="px-2 py-2 text-gray-600">{entry.reviewed_by}</td>
                                                    <td className="px-2 py-2">
                                                        {entry.payroll_date ? (
                                                            <span className="text-emerald-600 text-xs">
                                                                {formatMediumDate(entry.payroll_date)}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleMarkPayroll(entry.id)}
                                                                className="text-[#B54A32] hover:text-[#9a3f2b] text-xs font-medium hover:underline"
                                                            >
                                                                Send
                                                            </button>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'rejected' && (
                                                <>
                                                    <td className="px-2 py-2">
                                                        <div className="text-gray-600">{entry.reviewed_by}</div>
                                                        <div className="text-xs text-gray-400">{formatShortDate(entry.reviewed_at)}</div>
                                                    </td>
                                                    <td className="px-2 py-2 text-rose-600 text-xs max-w-32 truncate" title={entry.rejection_reason}>
                                                        {entry.rejection_reason}
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'pending' && (
                                                <td className="px-2 py-2 text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            onClick={() => handleApprove(entry.id)}
                                                            className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all"
                                                        >
                                                            Godkend
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ open: true, entryId: entry.id })}
                                                            className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 transition-all"
                                                        >
                                                            Afvis
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card-strong rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                                <XIcon />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Afvis registrering</h3>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Angiv årsag til afvisning..."
                            className="w-full glass-input rounded-xl p-4 h-32 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleReject}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 font-medium transition-all shadow-lg shadow-rose-500/25"
                            >
                                Afvis
                            </button>
                            <button
                                onClick={() => {
                                    setRejectModal({ open: false, entryId: null });
                                    setRejectReason('');
                                }}
                                className="flex-1 px-5 py-3 bg-white/50 text-gray-700 rounded-xl hover:bg-white/70 font-medium transition-all border border-white/30"
                            >
                                Annuller
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
