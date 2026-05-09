import { cardClass, cardTitleClass } from './ui'

export default function SessionsCard({
    sessions,
    selectedSessionId,
    onSelectSession,
    formatSessionTime,
}) {
    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Your sessions</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                    {sessions.length}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {sessions.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No sessions yet. Run matching or create one manually.
                    </p>
                )}

                {sessions.map((session) => (
                    <button
                        key={session._id}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedSessionId === session._id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white/80 text-slate-700'
                            }`}
                        onClick={() => onSelectSession(session._id)}
                        type="button"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">
                                {session.sport?.name || 'Session'}
                            </span>
                            <span className="text-xs uppercase tracking-wider">
                                {session.participants?.length || 0} players
                            </span>
                        </div>
                        <p className="mt-2 text-xs opacity-80">
                            {formatSessionTime(session.scheduledAt)}
                        </p>
                    </button>
                ))}
            </div>
        </section>
    )
}
