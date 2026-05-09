import { cardClass, cardTitleClass } from './ui'

export default function SessionsCard({
    sessions,
    selectedSessionId,
    onSelectSession,
    formatSessionTime,
    // Noile props pentru funcționalitatea de ștergere
    currentUserId,
    onDeleteSession,
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

                {sessions.map((session) => {
                    // Verificăm dacă userul curent este creatorul sesiunii.
                    // Adaptat ca să suporte mai multe formate din backend-ul tău.
                    const isCreator = currentUserId && (
                        session.creatorId === currentUserId ||
                        session.creator === currentUserId ||
                        session.creator?._id === currentUserId
                    );

                    return (
                        <div
                            key={session._id}
                            className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedSessionId === session._id
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300'
                                }`}
                            // Click pe div selectează sesiunea
                            onClick={() => onSelectSession && onSelectSession(session._id)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    {session.sport?.name || 'Session'}
                                </span>
                                <span className="text-xs uppercase tracking-wider">
                                    {session.participants?.length || 0} players
                                </span>
                            </div>

                            <div className="mt-2 flex items-end justify-between">
                                <p className="text-xs opacity-80">
                                    {formatSessionTime(session.scheduledAt)}
                                </p>

                                {/* Butonul de Delete apare DOAR dacă ești creatorul */}
                                {isCreator && onDeleteSession && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Blochează click-ul să nu se ducă pe div-ul părinte
                                            onDeleteSession(session._id);
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${selectedSessionId === session._id
                                                ? 'bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white'
                                                : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                                            }`}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    )
}