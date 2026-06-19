import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, X, CheckCircle2, Video, AlertCircle, Loader2, FileText } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegistrationTabs({ registrations = [], onRefresh }) {
    const { user } = useAuth();
    const [tab, setTab] = useState('active');
    const [cancelling, setCancelling] = useState(null);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const navigate = useNavigate();
    const now = new Date();

    const completed = registrations.filter(r => r.userStatus === 'COMPLETED');
    const confirmed = registrations.filter(r => r.status === 'confirmed' && r.userStatus !== 'COMPLETED');
    const pending = registrations.filter(r => r.status === 'pending' && r.userStatus !== 'COMPLETED');

    const isLive = (startTime) => now >= new Date(new Date(startTime).getTime() - 5 * 60 * 1000);

    const handleCancel = async (slotId) => {
        if (!confirm('Cancel this registration?')) return;
        setCancelling(slotId);
        try {
            await API.delete(`/slots/${slotId}/register`);
            onRefresh?.();
        } catch {
            alert('Cancel failed');
        } finally {
            setCancelling(null);
        }
    };

    const tabs = [
        { id: 'active', label: 'Active', count: confirmed.length },
        { id: 'pending', label: 'Waitlist', count: pending.length },
        { id: 'history', label: 'History', count: completed.length },
    ];

    return (
        <div className="space-y-5">
            {/* Tab bar */}
            <div
                className="inline-flex p-1 rounded-xl gap-1"
                style={{ background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
            >
                {tabs.map(({ id, label, count }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                        style={tab === id ? {
                            background: 'var(--primary)',
                            color: 'white',
                            boxShadow: 'var(--shadow-primary)',
                        } : {
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {label}
                        {count > 0 && (
                            <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                                style={tab === id ? {
                                    background: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                } : {
                                    background: 'var(--border)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ACTIVE ROOMS */}
                {tab === 'active' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {confirmed.length === 0 ? (
                            <EmptyState icon={Video} message="No active sessions" sub="Rooms appear here once you're matched and the session starts." />
                        ) : confirmed.map((item) => {
                            const live = isLive(item.slot.startTime);
                            const roomId = item.room?._id;
                            return (
                                <div key={roomId || item.slot._id} className="card p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-bold text-base leading-snug flex-1" style={{ color: 'var(--text-main)' }}>
                                            {item.room?.topic || item.slot.topic || 'Group Discussion'}
                                        </h4>
                                        <span
                                            className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                                            style={live ? {
                                                background: '#ecfdf5',
                                                color: '#047857',
                                                border: '1px solid #a7f3d0',
                                            } : {
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary)',
                                                border: '1px solid #c7d2fe',
                                            }}
                                        >
                                            {live ? 'Join Now' : 'Confirmed'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(item.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            Room assigned
                                        </span>
                                    </div>

                                    <button
                                        disabled={!live || !roomId}
                                        onClick={() => live && roomId && navigate(`/room/${roomId}`)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150"
                                        style={live && roomId ? {
                                            background: 'var(--primary)',
                                            color: 'white',
                                            boxShadow: 'var(--shadow-primary)',
                                            cursor: 'pointer',
                                        } : {
                                            background: 'var(--bg-subtle)',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        <Video className="w-4 h-4" />
                                        {live && roomId ? 'Join Video Room' : 'Opens Soon'}
                                    </button>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* WAITLIST */}
                {tab === 'pending' && (
                    <motion.div
                        key="pending"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {pending.length === 0 ? (
                            <EmptyState icon={Clock} message="No pending registrations" sub="Sessions waiting to be matched appear here." />
                        ) : pending.map((item) => {
                            const live = isLive(item.slot.startTime);
                            const fillPct = Math.min((item.slot.waitingQueue.length / item.slot.minParticipants) * 100, 100);
                            const isCancelling = cancelling === item.slot._id;
                            return (
                                <div key={item.slot._id} className="card p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
                                                {item.slot.topic || 'AI Topic (generated at start)'}
                                            </h4>
                                            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(item.slot.startTime).toLocaleDateString()} · {new Date(item.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span
                                            className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                                            style={live ? {
                                                background: 'var(--warning-light)',
                                                color: '#92400e',
                                                border: '1px solid #fde68a',
                                            } : {
                                                background: 'var(--bg-subtle)',
                                                color: 'var(--text-muted)',
                                                border: '1px solid var(--border)',
                                            }}
                                        >
                                            {live ? 'Matching…' : 'Waitlist'}
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                            <span>{item.slot.waitingQueue.length} registered</span>
                                            <span>Min {item.slot.minParticipants} needed</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${fillPct}%` }}
                                                className="h-full rounded-full"
                                                style={{ background: fillPct >= 100 ? 'var(--success)' : 'var(--primary)' }}
                                            />
                                        </div>
                                        {item.needMore > 0 && (
                                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                                {item.needMore} more student(s) needed
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleCancel(item.slot._id)}
                                        disabled={isCancelling}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
                                        style={{ color: 'var(--danger)', border: '1px solid #fecaca', background: 'transparent' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                        Cancel Registration
                                    </button>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* HISTORY */}
                {tab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {completed.length === 0 ? (
                            <EmptyState icon={CheckCircle2} message="No completed sessions" sub="Your finished GD sessions will appear here." />
                        ) : completed.map((item) => (
                            <div
                                key={item.room?._id || item.slot._id}
                                className="card p-5 space-y-3 opacity-90 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-base" style={{ color: 'var(--text-secondary)' }}>
                                        {item.room?.topic || item.slot.topic || 'Group Discussion'}
                                    </h4>
                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                        Done
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(item.slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            Completed
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedReportId(item.room?._id)}
                                        disabled={!item.room?._id}
                                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> View Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {selectedReportId && (
                <ReportModal roomId={selectedReportId} onClose={() => setSelectedReportId(null)} user={user} />
            )}
        </div>
    );
}

function EmptyState({ icon: Icon, message, sub }) {
    return (
        <div className="col-span-2 py-14 text-center card">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--bg-subtle)' }}>
                <Icon className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{message}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
    );
}

function ReportModal({ roomId, onClose, user }) {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get(`/rooms/${roomId}`)
            .then(res => {
                const room = res.data.room;
                if (!room.participantAnalysis || room.participantAnalysis.length === 0) {
                    setError('Analysis not available yet. Please check back later.');
                    return;
                }
                const myAnalysis = room.participantAnalysis.find(a => String(a.userId) === String(user._id) || String(a.userId?._id) === String(user._id));
                if (!myAnalysis) {
                    setError('No performance report found for you in this session.');
                    return;
                }
                setAnalysis({ ...myAnalysis, overallSummary: room.overallSummary });
            })
            .catch(err => setError('Failed to load report. It may still be processing.'))
            .finally(() => setLoading(false));
    }, [roomId, user._id]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">AI Performance Report</h3>
                            <p className="text-xs font-medium text-gray-500">Individual Feedback Summary</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 bg-gray-100 text-gray-500 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <p className="text-sm font-semibold text-gray-500">Retrieving your analysis...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-800">{error}</p>
                            <p className="text-xs text-gray-500 mt-2">Analysis takes a few minutes after the session ends.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2 z-10">Overall Score</p>
                                <div className="text-6xl font-black z-10 drop-shadow-md">
                                    {analysis.performanceScore} <span className="text-2xl text-indigo-300">/ 10</span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">💡</span>
                                    Feedback Summary
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                    {analysis.summary || 'No detailed feedback provided.'}
                                </p>
                            </div>

                            {analysis.flags?.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">🎯</span>
                                        Areas of Note
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.flags.map((f, i) => (
                                            <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-gray-700 border border-gray-200 shadow-sm">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(analysis.isOffTopic || analysis.isMisbehaving) && (
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <h4 className="font-bold text-sm text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Behavioral Alerts
                                    </h4>
                                    <ul className="text-xs font-medium text-red-700 space-y-1.5 list-disc list-inside">
                                        {analysis.isOffTopic && <li>You strayed off-topic during the discussion.</li>}
                                        {analysis.isMisbehaving && <li>Inappropriate language or behavior was flagged.</li>}
                                    </ul>
                                </div>
                            )}
                            
                            {analysis.overallSummary && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">📊</span>
                                        Group Performance Overview
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                                        {analysis.overallSummary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
