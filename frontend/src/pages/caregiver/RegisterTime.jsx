import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { timeEntriesApi, caregiversApi } from '../../utils/api';
import { formatHours, translateWeekday } from '../../utils/helpers';

// Icons
const NoAccessIcon = () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function RegisterTime({ caregiverId = 1 }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedChildId = searchParams.get('child');

    const [caregiver, setCaregiver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        child_id: preselectedChildId || '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        comment: ''
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        loadCaregiver();
    }, [caregiverId]);

    useEffect(() => {
        // Auto-preview når værdier ændres
        if (formData.child_id && formData.date && formData.start_time && formData.end_time) {
            loadPreview();
        }
    }, [formData.child_id, formData.date, formData.start_time, formData.end_time]);

    async function loadCaregiver() {
        try {
            const data = await caregiversApi.getById(caregiverId);
            setCaregiver(data);
        } catch (error) {
            console.error('Fejl:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadPreview() {
        try {
            const result = await timeEntriesApi.preview({
                child_id: parseInt(formData.child_id),
                date: formData.date,
                start_time: formData.start_time,
                end_time: formData.end_time
            });
            setPreview(result);
        } catch (error) {
            console.error('Preview fejl:', error);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.child_id) {
            alert('Vælg venligst et barn');
            return;
        }

        // Tjek om dato er i fremtiden
        const today = new Date().toISOString().split('T')[0];
        if (formData.date > today) {
            alert('Du kan ikke registrere timer for fremtidige datoer');
            return;
        }

        setSubmitting(true);
        try {
            await timeEntriesApi.create({
                caregiver_id: caregiverId,
                child_id: parseInt(formData.child_id),
                date: formData.date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                comment: formData.comment
            });

            alert('Registrering oprettet!');
            navigate('/barnepige/mine-timer');
        } catch (error) {
            alert('Fejl: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-[#B54A32]"></div>
            </div>
        );
    }

    if (!caregiver?.children?.length) {
        return (
            <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400 shadow-inner">
                    <NoAccessIcon />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ingen børn tilknyttet</h2>
                <p className="text-gray-500">
                    Du kan ikke registrere timer da du ikke er tilknyttet nogen børn.
                </p>
            </div>
        );
    }

    const grantExceeded = preview?.grantStatus?.exceeded;
    const grantError = preview?.grantStatus?.error;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#B54A32] to-[#9a3f2b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#B54A32]/30">
                        <ClockIcon />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Registrer Timer</h2>
                        <p className="text-gray-500 mt-0.5">Udfyld formularen for at registrere dine timer</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card-strong rounded-2xl p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {/* Barn */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Barn *</label>
                        <select
                            value={formData.child_id}
                            onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
                            className="glass-input w-full rounded-xl px-4 py-3"
                            required
                        >
                            <option value="">Vælg barn...</option>
                            {caregiver.children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.first_name} {child.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dato */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dato *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="glass-input w-full rounded-xl px-4 py-3"
                            required
                        />
                        <p className="mt-1.5 text-xs text-gray-400">Du kan ikke registrere timer for fremtidige datoer</p>
                    </div>

                    {/* Tid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Start tid *</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                className="glass-input w-full rounded-xl px-4 py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Slut tid *</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                className="glass-input w-full rounded-xl px-4 py-3"
                                required
                            />
                        </div>
                    </div>

                    {/* Kommentar */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kommentar</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            className="glass-input w-full rounded-xl px-4 py-3 h-24 resize-none"
                            placeholder="Valgfri kommentar..."
                        />
                    </div>
                </div>

                {/* Preview */}
                {preview && (
                    <div
                        className={`rounded-2xl p-6 backdrop-blur-sm border-2 animate-fade-in-up ${
                            grantExceeded || grantError
                                ? 'bg-rose-500/10 border-rose-500/30'
                                : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}
                        style={{ animationDelay: '0.2s' }}
                    >
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ClockIcon />
                            Beregnet timefordeling
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                            <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Normaltimer</div>
                                <div className="text-lg font-bold text-gray-900">{formatHours(preview.allowances.normal_hours)}</div>
                            </div>
                            <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Aftentillæg</div>
                                <div className="text-lg font-bold text-gray-900">{formatHours(preview.allowances.evening_hours)}</div>
                            </div>
                            <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Nattillæg</div>
                                <div className="text-lg font-bold text-gray-900">{formatHours(preview.allowances.night_hours)}</div>
                            </div>
                            <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Lørdagstillæg</div>
                                <div className="text-lg font-bold text-gray-900">{formatHours(preview.allowances.saturday_hours)}</div>
                            </div>
                            <div className="text-center p-3 bg-white/60 rounded-xl border border-white/40 backdrop-blur-sm">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Søn-/Helligdag</div>
                                <div className="text-lg font-bold text-gray-900">{formatHours(preview.allowances.sunday_holiday_hours)}</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-[#B54A32]/10 to-[#B54A32]/5 rounded-xl border border-[#B54A32]/20">
                                <div className="text-xs text-[#B54A32] mb-1 font-semibold">Total</div>
                                <div className="text-xl font-bold text-[#B54A32]">
                                    {formatHours(preview.allowances.total_hours)}
                                </div>
                            </div>
                        </div>

                        {/* Bevillingsstatus */}
                        {preview.grantStatus && (
                            <div className={`p-4 rounded-xl backdrop-blur-sm ${
                                grantExceeded || grantError
                                    ? 'bg-rose-500/15 border border-rose-500/30'
                                    : 'bg-emerald-500/15 border border-emerald-500/30'
                            }`}>
                                {grantError ? (
                                    <div className="text-rose-700">
                                        <div className="flex items-center gap-2 font-bold">
                                            <WarningIcon />
                                            <span>{grantError}</span>
                                        </div>
                                        {preview.grantStatus.allowedDays && (
                                            <div className="mt-2 text-sm">
                                                Tilladte dage: {preview.grantStatus.allowedDays.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ) : grantExceeded ? (
                                    <div className="text-rose-700">
                                        <div className="flex items-center gap-2 font-bold">
                                            <WarningIcon />
                                            <span>Bevilling overskrides!</span>
                                        </div>
                                        <div className="mt-2 text-sm space-y-1">
                                            <div>Forbrugt: {formatHours(preview.grantStatus.usedHours)} / {formatHours(preview.grantStatus.grantHours)} timer</div>
                                            <div>Efter registrering: {formatHours(preview.grantStatus.totalAfterNew)} timer</div>
                                            <div className="font-semibold">Overskredet med: {formatHours(preview.grantStatus.exceededBy)} timer</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-emerald-700">
                                        <div className="flex items-center gap-2 font-bold">
                                            <CheckIcon />
                                            <span>Inden for bevilling</span>
                                        </div>
                                        <div className="mt-2 text-sm space-y-1">
                                            <div>Forbrugt: {formatHours(preview.grantStatus.usedHours)} / {formatHours(preview.grantStatus.grantHours)} timer</div>
                                            <div className="font-semibold">Resterende: {formatHours(preview.grantStatus.remainingHours)} timer</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`flex-1 px-6 py-3.5 rounded-xl text-white font-semibold transition-all shadow-lg ${
                            submitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : grantExceeded || grantError
                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 hover:shadow-rose-500/40'
                                : 'btn-kalundborg'
                        }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                Indsender...
                            </span>
                        ) : 'Indsend registrering'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/barnepige')}
                        className="px-6 py-3.5 bg-white/50 hover:bg-white/70 text-gray-700 rounded-xl font-semibold transition-all border border-white/30"
                    >
                        Annuller
                    </button>
                </div>

                {(grantExceeded || grantError) && (
                    <p className="text-sm text-rose-600 text-center font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        Bemærk: Registreringen vil blive oprettet, men markeret som overskridelse.
                    </p>
                )}
            </form>
        </div>
    );
}
