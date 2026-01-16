import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timeEntriesApi, childrenApi, caregiversApi } from '../../utils/api';
import { formatHours, formatDate } from '../../utils/helpers';

// Icons
const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ArrowIcon = () => (
    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pendingCount: 0,
        approvedToday: 0,
        childrenCount: 0,
        caregiversCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentPending, setRecentPending] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [entries, children, caregivers] = await Promise.all([
                timeEntriesApi.getAll(),
                childrenApi.getAll(),
                caregiversApi.getAll()
            ]);

            const pending = entries.filter(e => e.status === 'pending');
            const today = new Date().toISOString().split('T')[0];
            const approvedToday = entries.filter(
                e => e.status === 'approved' &&
                e.reviewed_at &&
                e.reviewed_at.startsWith(today)
            ).length;

            setStats({
                pendingCount: pending.length,
                approvedToday,
                childrenCount: children.length,
                caregiversCount: caregivers.length
            });

            setRecentPending(pending.slice(0, 5));
        } catch (error) {
            console.error('Fejl ved indlæsning:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-[#B54A32]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-gray-900">Oversigt</h2>
                <p className="text-gray-500 mt-1">Overblik over timeregistreringer og stamdata</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                    to="/admin/godkendelse"
                    className="glass-card rounded-2xl p-6 hover-lift group cursor-pointer"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                            <ClockIcon />
                        </div>
                        <div className="text-gray-400 group-hover:text-[#B54A32] transition-colors">
                            <ArrowIcon />
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="text-4xl font-bold text-gray-900">{stats.pendingCount}</div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">Afventer godkendelse</div>
                    </div>
                </Link>

                <div
                    className="glass-card rounded-2xl p-6 animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <CheckIcon />
                    </div>
                    <div className="mt-5">
                        <div className="text-4xl font-bold text-gray-900">{stats.approvedToday}</div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">Godkendt i dag</div>
                    </div>
                </div>

                <Link
                    to="/admin/boern"
                    className="glass-card rounded-2xl p-6 hover-lift group cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#B54A32] to-[#9a3f2b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#B54A32]/30">
                            <UserIcon />
                        </div>
                        <div className="text-gray-400 group-hover:text-[#B54A32] transition-colors">
                            <ArrowIcon />
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="text-4xl font-bold text-gray-900">{stats.childrenCount}</div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">Børn</div>
                    </div>
                </Link>

                <Link
                    to="/admin/barnepiger"
                    className="glass-card rounded-2xl p-6 hover-lift group cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                            <UsersIcon />
                        </div>
                        <div className="text-gray-400 group-hover:text-[#B54A32] transition-colors">
                            <ArrowIcon />
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="text-4xl font-bold text-gray-900">{stats.caregiversCount}</div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">Barnepiger</div>
                    </div>
                </Link>
            </div>

            {/* Recent pending */}
            {recentPending.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="px-6 py-5 border-b border-white/20">
                        <h3 className="font-semibold text-gray-900 text-lg">Seneste afventende registreringer</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                        {recentPending.map((entry, index) => (
                            <div
                                key={entry.id}
                                className="px-6 py-4 flex items-center justify-between hover:bg-white/30 transition-all duration-200"
                                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 text-sm font-bold shadow-inner">
                                        {entry.caregiver_first_name?.charAt(0)}{entry.caregiver_last_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {entry.caregiver_first_name} {entry.caregiver_last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {entry.child_first_name} {entry.child_last_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-lg">{formatHours(entry.total_hours)} timer</div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(entry.date)} &middot; {entry.start_time}-{entry.end_time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 border-t border-white/20 bg-white/20">
                        <Link
                            to="/admin/godkendelse"
                            className="inline-flex items-center gap-2 text-[#B54A32] hover:text-[#9a3f2b] text-sm font-semibold group transition-colors"
                        >
                            Se alle afventende
                            <ArrowIcon />
                        </Link>
                    </div>
                </div>
            )}

            {recentPending.length === 0 && (
                <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                        <CheckIcon />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Ingen afventende registreringer</h3>
                    <p className="text-gray-500 mt-2">Alle registreringer er blevet behandlet</p>
                </div>
            )}
        </div>
    );
}
