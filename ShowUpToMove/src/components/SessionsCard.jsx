import { cardClass, cardTitleClass } from './ui'

const levelLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function SessionsCard({
  sessions,
  mySessionIds,
  currentUserId,
  isAdmin,
  formatSessionTime,
  onJoinSession,
  onLeaveSession,
  onDeleteSession,
  onBroadcastInvite,
  onOpenSessionChat,
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
          const isCreator = session.createdBy?._id === currentUserId
          const canDelete = isCreator || isAdmin
          const canBroadcast = isCreator
          const levels = (session.desiredPlayerLevels || [])
            .map((level) => levelLabels[level] || level)
            .join(', ')

          return (
            <div
              key={session._id}
              className="group relative w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {session.name || session.sport?.name || 'Session'}
                </span>
                <span className="text-xs uppercase tracking-wider">
                  {session.participants?.length || 0} players
                </span>
              </div>
              <p className="mt-2 text-xs opacity-80">
                {session.location?.name || 'Location TBD'} |{' '}
                {formatSessionTime(session.scheduledAt)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Captain: {session.captain?.displayName || 'Unknown'} | Cost:{' '}
                {session.location?.priceEstimate || 'N/A'}
              </p>
              {levels && <p className="mt-2 text-xs text-slate-500">Looking for: {levels}</p>}
              <div className="pointer-events-none absolute -top-2 right-2 z-10 hidden w-80 rounded-2xl border border-indigo-100 bg-white p-4 shadow-xl group-hover:block">
                <p className="text-sm font-semibold text-slate-900">
                  {session.name || session.sport?.name || 'Session'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Sport: {session.sport?.name || 'Unknown'}
                </p>
                <p className="text-xs text-slate-600">
                  Captain: {session.captain?.displayName || 'Unknown'}
                </p>
                <p className="text-xs text-slate-600">
                  Location: {session.location?.name || 'TBD'}
                </p>
                <p className="text-xs text-slate-600">
                  Cost: {session.location?.priceEstimate || 'N/A'}
                </p>
                <p className="text-xs text-slate-600">
                  Levels: {levels || 'Any'}
                </p>
                <p className="mt-2 text-xs text-slate-700">
                  Players:{' '}
                  {(session.participants || [])
                    .map((player) => player.displayName || player.email || 'Player')
                    .join(', ') || 'No players yet'}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {isJoined ? (
                  <>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Joined
                    </span>
                    <button
                      type="button"
                      onClick={() => onLeaveSession(session._id)}
                      className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoinSession(session._id)}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    Join session
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteSession(session._id)}
                    className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  >
                    Delete
                  </button>
                )}
                {canBroadcast && (
                  <button
                    type="button"
                    onClick={() => onBroadcastInvite(session._id)}
                    className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                  >
                    Broadcast Invite
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenSessionChat(session._id)}
                  className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700"
                >
                  Open Chat
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
