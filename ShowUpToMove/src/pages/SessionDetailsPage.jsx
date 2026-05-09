import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import NoticeBanner from '../components/NoticeBanner'
import { cardClass, cardTitleClass } from '../components/ui'

export default function SessionDetailsPage({ formatSessionTime }) {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await apiFetch(`/api/sessions/${sessionId}`)
        if (mounted) setSession(data)
      } catch (error) {
        if (mounted) setErrorMessage(error.message)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [sessionId])

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16">
      <NoticeBanner error={errorMessage} />
      {!session ? (
        <section className={`${cardClass} p-6`}>
          <p className="text-sm text-slate-500">Loading session details...</p>
        </section>
      ) : (
        <div className="space-y-6">
          <section className={`${cardClass} p-6`}>
            <h2 className={cardTitleClass}>{session.name || session.sport?.name || 'Session'}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Captain: {session.captain?.displayName || 'Unknown'}
            </p>
            <p className="text-sm text-slate-600">
              Location: {session.location?.name || 'Location TBD'}
            </p>
            <p className="text-sm text-slate-600">
              Cost: {session.location?.priceEstimate || 'N/A'}
            </p>
            <p className="text-sm text-slate-600">
              Starts at: {formatSessionTime(session.scheduledAt)}
            </p>
          </section>

          <section className={`${cardClass} p-6`}>
            <h3 className="text-lg font-semibold text-slate-900">Players</h3>
            <div className="mt-4 space-y-3">
              {(session.participants || []).map((player) => (
                <div
                  key={player._id}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-slate-800">
                    {player.displayName || player.email || 'Player'}
                  </p>
                  <p className="text-xs text-slate-500">Level: {player.skillLevel || 'Not set'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bio: {player.bio || 'No description'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Sports: {(player.sports || []).map((sport) => sport.name).join(', ') || 'None'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
