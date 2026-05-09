import { cardClass, cardTitleClass } from './ui'

const levelLabels = {
  beginner: 'Incepator',
  intermediate: 'Mediu',
  advanced: 'Avansat',
}

export default function SessionsCard({
  sessions,
  mySessionIds,
  formatSessionTime,
  onJoinSession,
}) {
  return (
    <section className={`${cardClass} p-6`}>
      <div className="flex items-center justify-between">
        <h2 className={cardTitleClass}>Sessions</h2>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          {sessions.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {sessions.length === 0 && (
          <p className="text-sm text-slate-500">No sessions available yet.</p>
        )}

        {sessions.map((session) => {
          const isJoined = mySessionIds?.has(session._id)
          const levels = (session.desiredPlayerLevels || [])
            .map((level) => levelLabels[level] || level)
            .join(', ')

          return (
            <div
              key={session._id}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm text-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{session.sport?.name || 'Session'}</span>
                <span className="text-xs uppercase tracking-wider">
                  {session.participants?.length || 0} players
                </span>
              </div>
              <p className="mt-2 text-xs opacity-80">
                {session.location?.name || 'Location TBD'} |{' '}
                {formatSessionTime(session.scheduledAt)}
              </p>
              {levels && <p className="mt-2 text-xs text-slate-500">Cauta: {levels}</p>}
              <div className="mt-3">
                {isJoined ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Joined
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoinSession(session._id)}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    Join session
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
