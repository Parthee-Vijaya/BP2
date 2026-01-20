import { useState, useEffect } from 'react';
import { timeEntriesApi, childrenApi, caregiversApi, exportApi } from '../../utils/api';
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

const WarningIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const TableIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CardIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

// Kort datoformat (dd/mm/åå)
function formatShortDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Dag navn
function getDayName(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { weekday: 'short' });
}

export default function ApprovalPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [entries, setEntries] = useState([]);
    const [children, setChildren] = useState([]);
    const [childrenMap, setChildrenMap] = useState({});
    const [caregivers, setCaregivers] = useState([]);
    const [grantSummaries, setGrantSummaries] = useState({});
    const [selectedChild, setSelectedChild] = useState('all');
    const [selectedCaregiver, setSelectedCaregiver] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [rejectModal, setRejectModal] = useState({ open: false, entryId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [viewReasonModal, setViewReasonModal] = useState({ open: false, reason: '', entry: null });
    const [isCompactView, setIsCompactView] = useState(false);

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

            const cMap = {};
            childrenData.forEach(c => { cMap[c.id] = c; });
            setChildrenMap(cMap);

            const uniqueChildIds = [...new Set(entriesData.map(e => e.child_id))];
            const summaries = {};
            await Promise.all(
                uniqueChildIds.map(async (childId) => {
                    try {
                        const childData = await childrenApi.getById(childId);
                        if (childData.grantSummary) {
                            summaries[childId] = childData.grantSummary;
                        }
                        cMap[childId] = childData;
                    } catch (err) {
                        console.error(`Kunne ikke hente bevilling for barn ${childId}:`, err);
                    }
                })
            );
            setGrantSummaries(summaries);
            setChildrenMap({...cMap});
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
        const childName = `${entry.child_first_name} ${entry.child_last_name}`.toLowerCase();
        const maNumber = (entry.ma_number || '').toLowerCase();
        return caregiverName.includes(query) || childName.includes(query) || maNumber.includes(query);
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
        { id: 'pending', label: 'Afventer', icon: <ClockIcon />, count: entries.length },
        { id: 'approved', label: 'Godkendte', icon: <CheckIcon /> },
        { id: 'rejected', label: 'Afviste', icon: <XIcon /> }
    ];

    function getGrantStatus(childId) {
        const summary = grantSummaries[childId];
        if (!summary) return null;

        if (summary.grantType === 'specific_weekdays' && summary.weekdays) {
            let totalGrant = 0;
            let totalUsed = 0;
            let anyExceeded = false;

            Object.values(summary.weekdays).forEach(day => {
                totalGrant += day.grantHours;
                totalUsed += day.usedHours;
                if (day.exceeded) anyExceeded = true;
            });

            const percentage = totalGrant > 0 ? (totalUsed / totalGrant) * 100 : 0;

            return {
                usedHours: totalUsed,
                grantHours: totalGrant,
                percentage,
                isExceeded: anyExceeded || percentage >= 100,
                isWarning: percentage >= 90 && percentage < 100
            };
        }

        const percentage = summary.grantHours > 0
            ? (summary.usedHours / summary.grantHours) * 100
            : 0;

        return {
            usedHours: summary.usedHours,
            grantHours: summary.grantHours,
            percentage,
            isExceeded: summary.exceeded || percentage >= 100,
            isWarning: percentage >= 90 && percentage < 100
        };
    }

    function formatTimeBreakdown(entry) {
        const parts = [];
        if (entry.normal_hours > 0) parts.push({ label: 'Normal', value: entry.normal_hours, color: 'bg-blue-100 text-blue-700' });
        if (entry.evening_hours > 0) parts.push({ label: 'Aften', value: entry.evening_hours, color: 'bg-purple-100 text-purple-700' });
        if (entry.night_hours > 0) parts.push({ label: 'Nat', value: entry.night_hours, color: 'bg-indigo-100 text-indigo-700' });
        if (entry.saturday_hours > 0) parts.push({ label: 'Lørdag', value: entry.saturday_hours, color: 'bg-orange-100 text-orange-700' });
        if (entry.sunday_holiday_hours > 0) parts.push({ label: 'Søn/Hellig', value: entry.sunday_holiday_hours, color: 'bg-red-100 text-red-700' });
        return parts;
    }

    // Beregn statistik - kun overskridelser
    const exceededCount = filteredEntries.filter(e => getGrantStatus(e.child_id)?.isExceeded).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Godkendelse af timer</h2>
                        <p className="text-gray-500 mt-1">Gennemgå og godkend timeregistreringer fra barnepiger</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                            <button
                                onClick={() => setIsCompactView(false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    !isCompactView
                                        ? 'bg-white text-[#B54A32] shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <CardIcon />
                                Detaljeret
                            </button>
                            <button
                                onClick={() => setIsCompactView(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isCompactView
                                        ? 'bg-white text-[#B54A32] shadow-md'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <TableIcon />
                                Kompakt
                            </button>
                        </div>

                        <a
                            href={exportApi.timeEntries({ status: activeTab })}
                            download
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-emerald-500/25"
                        >
                            <DownloadIcon />
                            Eksporter CSV
                        </a>
                    </div>
                </div>

                {/* Stats cards */}
                {activeTab === 'pending' && filteredEntries.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="text-3xl font-bold text-gray-900">{filteredEntries.length}</div>
                            <div className="text-sm text-gray-500">Afventer godkendelse</div>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                            <div className="flex items-center gap-2">
                                <div className="text-3xl font-bold text-rose-600">{exceededCount}</div>
                                {exceededCount > 0 && <WarningIcon className="text-rose-500" />}
                            </div>
                            <div className="text-sm text-rose-600">Overskrider bevilling</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 animate-fade-in-up">
                {/* Tabs */}
                <div className="border-b border-gray-200 flex bg-gray-50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                                activeTab === tab.id
                                    ? 'text-[#B54A32]'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-[#B54A32]' : 'text-gray-400'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#B54A32] to-[#9a3f2b]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Søg på navn eller MA-nummer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#B54A32]/20 focus:border-[#B54A32]/30 transition-all"
                            />
                        </div>

                        <select
                            value={selectedChild}
                            onChange={(e) => setSelectedChild(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#B54A32]/20"
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
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#B54A32]/20"
                        >
                            <option value="all">Alle barnepiger</option>
                            {caregivers.map((cg) => (
                                <option key={cg.id} value={cg.id}>
                                    {cg.first_name} {cg.last_name}
                                </option>
                            ))}
                        </select>

                        {activeTab === 'pending' && filteredEntries.length > 0 && (
                            <div className="flex items-center gap-3 ml-auto">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32] w-4 h-4"
                                    />
                                    Vælg alle
                                </label>
                                <button
                                    onClick={handleBatchApprove}
                                    disabled={selectedIds.length === 0}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    <CheckMarkIcon />
                                    Godkend valgte ({selectedIds.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-16 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-3 border-white/30 border-t-[#B54A32] mx-auto"></div>
                        <p className="text-gray-500 mt-4 font-medium">Indlæser registreringer...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 text-white">
                            <CheckIcon />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg">
                            {searchQuery ? 'Ingen resultater fundet' : 'Ingen registreringer'}
                        </p>
                        <p className="text-gray-500 mt-2">
                            {searchQuery ? 'Prøv at justere din søgning' : 'Der er ingen registreringer i denne kategori'}
                        </p>
                    </div>
                ) : isCompactView ? (
                    /* COMPACT TABLE VIEW */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    {activeTab === 'pending' && (
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32]"
                                            />
                                        </th>
                                    )}
                                    {activeTab === 'pending' && (
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barnepige</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barn</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dato</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tid</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Timer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bevilling</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Handlinger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEntries.map((entry) => {
                                    const grantStatus = getGrantStatus(entry.child_id);
                                    const isExceeded = grantStatus?.isExceeded;
                                    const isWarning = grantStatus?.isWarning && !isExceeded;

                                    return (
                                        <tr
                                            key={entry.id}
                                            className={`
                                                transition-colors
                                                ${activeTab === 'pending' && isExceeded
                                                    ? 'bg-rose-50 hover:bg-rose-100'
                                                    : 'hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {activeTab === 'pending' && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(entry.id)}
                                                        onChange={() => toggleSelect(entry.id)}
                                                        className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32]"
                                                    />
                                                </td>
                                            )}
                                            {activeTab === 'pending' && (
                                                <td className="px-4 py-3">
                                                    {isExceeded && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                            <WarningIcon className="w-3 h-3" />
                                                            OVER
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {entry.caregiver_first_name} {entry.caregiver_last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">{entry.ma_number}</div>
                                            </td>
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
                                                <span className="font-bold text-gray-900">{formatHours(entry.total_hours)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {grantStatus && (
                                                    <div className="min-w-[120px]">
                                                        <div className={`text-xs font-medium mb-1 ${
                                                            isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-gray-600'
                                                        }`}>
                                                            {formatHours(grantStatus.usedHours)}/{formatHours(grantStatus.grantHours)}
                                                        </div>
                                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                                                }`}
                                                                style={{ width: `${Math.min(grantStatus.percentage, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {activeTab === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(entry.id)}
                                                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                                                        >
                                                            Godkend
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ open: true, entryId: entry.id })}
                                                            className="px-3 py-1.5 bg-rose-500 text-white text-xs rounded-lg font-medium hover:bg-rose-600 transition-colors"
                                                        >
                                                            Afvis
                                                        </button>
                                                    </div>
                                                )}
                                                {activeTab === 'approved' && (
                                                    <div className="flex justify-end items-center gap-2">
                                                        {entry.payroll_date ? (
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                Sendt {formatShortDate(entry.payroll_date)}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleMarkPayroll(entry.id)}
                                                                className="px-3 py-1.5 bg-[#B54A32] text-white text-xs rounded-lg font-medium hover:bg-[#9a3f2b] transition-colors"
                                                            >
                                                                Send til løn
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {activeTab === 'rejected' && (
                                                    <button
                                                        onClick={() => setViewReasonModal({ open: true, reason: entry.rejection_reason, entry })}
                                                        className="text-rose-600 hover:text-rose-700 text-xs font-medium underline"
                                                    >
                                                        Se årsag
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* DETAILED CARD VIEW */
                    <div className="p-4">
                        <div className="grid gap-3">
                            {filteredEntries.map((entry) => {
                                const grantStatus = getGrantStatus(entry.child_id);
                                const childData = childrenMap[entry.child_id];
                                const isExceeded = grantStatus?.isExceeded;
                                const isWarning = grantStatus?.isWarning && !isExceeded;
                                const timeBreakdown = formatTimeBreakdown(entry);

                                return (
                                    <div
                                        key={entry.id}
                                        className={`
                                            relative rounded-xl border transition-all duration-200
                                            ${activeTab === 'pending' && isExceeded
                                                ? 'bg-rose-50 border-rose-300 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        {/* Status indicator stripe - kun ved pending og overskridelse */}
                                        {activeTab === 'pending' && isExceeded && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-rose-500" />
                                        )}

                                        <div className="p-4 pl-6">
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox */}
                                                {activeTab === 'pending' && (
                                                    <div className="pt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(entry.id)}
                                                            onChange={() => toggleSelect(entry.id)}
                                                            className="rounded border-gray-300 text-[#B54A32] focus:ring-[#B54A32] w-5 h-5"
                                                        />
                                                    </div>
                                                )}

                                                {/* Main content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        {/* Left side - People info */}
                                                        <div className="flex-1">
                                                            {activeTab === 'pending' && isExceeded && (
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                                                                        <WarningIcon className="w-3 h-3" />
                                                                        OVERSKREDET
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Barnepige */}
                                                                <div>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                                        <UserIcon />
                                                                        Barnepige
                                                                    </div>
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.caregiver_first_name} {entry.caregiver_last_name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 font-mono">{entry.ma_number}</div>
                                                                </div>

                                                                {/* Barn */}
                                                                <div>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                                        </svg>
                                                                        Barn
                                                                    </div>
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.child_first_name} {entry.child_last_name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 font-mono">{childData?.psp_element || '-'}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right side - Time and Grant */}
                                                        <div className="text-right flex-shrink-0">
                                                            {/* Date and time */}
                                                            <div className="flex items-center gap-2 justify-end text-gray-500 text-sm mb-2">
                                                                <CalendarIcon />
                                                                <span className="capitalize">{getDayName(entry.date)}</span>
                                                                <span className="font-medium text-gray-700">{formatShortDate(entry.date)}</span>
                                                            </div>
                                                            <div className="text-lg font-semibold text-gray-700 mb-2">
                                                                {entry.start_time?.slice(0,5)} - {entry.end_time?.slice(0,5)}
                                                            </div>

                                                            {/* Total hours */}
                                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B54A32] to-[#9a3f2b] text-white rounded-lg shadow-lg shadow-[#B54A32]/25">
                                                                <ClockIcon />
                                                                <span className="text-xl font-bold">{formatHours(entry.total_hours)}</span>
                                                                <span className="text-white/80 text-sm">timer</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom section - Breakdown and Grant status */}
                                                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-end justify-between gap-4">
                                                        {/* Time breakdown */}
                                                        <div className="flex-1">
                                                            <div className="text-xs text-gray-500 mb-2">Timefordeling</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {timeBreakdown.map((item, idx) => (
                                                                    <span key={idx} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${item.color}`}>
                                                                        {item.label}: {formatHours(item.value)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Grant status */}
                                                        {grantStatus && (
                                                            <div className="flex-shrink-0 w-48">
                                                                <div className="text-xs text-gray-500 mb-2 text-right">Bevillingsstatus</div>
                                                                <div className={`text-right font-semibold mb-1 ${
                                                                    isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-gray-700'
                                                                }`}>
                                                                    {formatHours(grantStatus.usedHours)} / {formatHours(grantStatus.grantHours)} timer
                                                                </div>
                                                                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${
                                                                            isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                                                        }`}
                                                                        style={{ width: `${Math.min(grantStatus.percentage, 100)}%` }}
                                                                    />
                                                                </div>
                                                                {isExceeded && (
                                                                    <div className="text-xs text-rose-600 font-bold mt-1 text-right">
                                                                        +{formatHours(grantStatus.usedHours - grantStatus.grantHours)} over grænsen
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        {activeTab === 'pending' && (
                                                            <div className="flex gap-2 flex-shrink-0">
                                                                <button
                                                                    onClick={() => handleApprove(entry.id)}
                                                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                                                                >
                                                                    <CheckMarkIcon />
                                                                    Godkend
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectModal({ open: true, entryId: entry.id })}
                                                                    className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2"
                                                                >
                                                                    <XIcon />
                                                                    Afvis
                                                                </button>
                                                            </div>
                                                        )}

                                                        {activeTab === 'approved' && (
                                                            <div className="flex items-center gap-4 flex-shrink-0">
                                                                <div className="text-right">
                                                                    <div className="text-xs text-gray-500">Godkendt af</div>
                                                                    <div className="font-medium text-gray-700">{entry.reviewed_by}</div>
                                                                </div>
                                                                {entry.payroll_date ? (
                                                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                                                                        Sendt {formatShortDate(entry.payroll_date)}
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleMarkPayroll(entry.id)}
                                                                        className="px-4 py-2 bg-[#B54A32] text-white rounded-lg font-medium hover:bg-[#9a3f2b] transition-all"
                                                                    >
                                                                        Send til løn
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {activeTab === 'rejected' && (
                                                            <div className="flex-shrink-0 text-right">
                                                                <div className="text-xs text-gray-500 mb-1">Afvist af {entry.reviewed_by}</div>
                                                                <button
                                                                    onClick={() => setViewReasonModal({ open: true, reason: entry.rejection_reason, entry })}
                                                                    className="text-rose-600 hover:text-rose-700 text-sm font-medium underline"
                                                                >
                                                                    Se årsag
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Comment if exists */}
                                                    {entry.comment && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Kommentar</div>
                                                            <div className="text-sm text-gray-700">{entry.comment}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
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
                            className="w-full border border-gray-200 rounded-xl p-4 h-32 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        />
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleReject}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 font-medium transition-all shadow-lg shadow-rose-500/25"
                            >
                                Afvis registrering
                            </button>
                            <button
                                onClick={() => {
                                    setRejectModal({ open: false, entryId: null });
                                    setRejectReason('');
                                }}
                                className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                            >
                                Annuller
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Rejection Reason Modal */}
            {viewReasonModal.open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setViewReasonModal({ open: false, reason: '', entry: null })}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                                <XIcon />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Afvisningsårsag</h3>
                                {viewReasonModal.entry && (
                                    <p className="text-sm text-gray-500">
                                        {viewReasonModal.entry.caregiver_first_name} {viewReasonModal.entry.caregiver_last_name} - {viewReasonModal.entry.child_first_name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
                            <p className="text-gray-800 whitespace-pre-wrap">{viewReasonModal.reason}</p>
                        </div>
                        {viewReasonModal.entry && (
                            <div className="text-sm text-gray-500 mb-4">
                                Afvist af <span className="font-medium">{viewReasonModal.entry.reviewed_by}</span> den {formatShortDate(viewReasonModal.entry.reviewed_at)}
                            </div>
                        )}
                        <button
                            onClick={() => setViewReasonModal({ open: false, reason: '', entry: null })}
                            className="w-full px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                        >
                            Luk
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
