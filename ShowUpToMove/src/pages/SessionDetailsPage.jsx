import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import NoticeBanner from '../components/NoticeBanner'
import { cardClass, cardTitleClass } from '../components/ui'

export default function SessionDetailsPage({ formatSessionTime }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [session, setSession] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatDraft, setChatDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const isJoined = !!(
    me?._id &&
    session?.participants?.some((player) => player._id === me._id)
  )
  const isCreator = !!(me?._id && session?.createdBy?._id === me._id)
  const canDelete = isCreator || me?.role === 'admin'
  const canBroadcast = isCreator

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [sessionData, meData] = await Promise.all([
          apiFetch(`/api/sessions/${sessionId}`),
          apiFetch('/api/users/me'),
        ])
        if (!mounted) return
        setSession(sessionData)
        setMe(meData)
      } catch (error) {
        if (mounted) setErrorMessage(error.message)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || !isJoined) {
      setChatMessages([])
      return
    }
    const loadChat = async () => {
      try {
        const data = await apiFetch(`/api/chats/${sessionId}`)
        setChatMessages(data.messages || [])
      } catch (error) {
        setErrorMessage(error.message)
      }
    }
    loadChat()
  }, [sessionId, isJoined])

  const reloadSession = async () => {
    const data = await apiFetch(`/api/sessions/${sessionId}`)
    setSession(data)
  }

  const handleJoin = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      await apiFetch(`/api/sessions/${sessionId}/join`, { method: 'POST' })
      await reloadSession()
      setNotice('Joined session.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await apiFetch(`/api/sessions/${sessionId}/leave`, { method: 'POST' })
      if (data?.removed) {
        navigate('/sessions')
        return
      }
      await reloadSession()
      setNotice('Left session.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      navigate('/sessions')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcast = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await apiFetch(`/api/sessions/${sessionId}/broadcast-invite`, {
        method: 'POST',
      })
      setNotice(`Broadcast sent to ${data.invitedCount || 0} users.`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatDraft.trim() || !isJoined) return
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await apiFetch(`/api/chats/${sessionId}`, {
        method: 'POST',
        body: { text: chatDraft.trim() },
      })
      setChatMessages(data.messages || [])
      setChatDraft('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16">
      <NoticeBanner notice={notice} error={errorMessage} />
      {!session ? (
        <section className={`${cardClass} p-6`}>
          <p className="text-sm text-slate-500">Loading session details...</p>
        </section>
      ) : (
        <div className="space-y-6">
          <section className={`${cardClass} p-6`}>
            <h2 className={cardTitleClass}>{session.name || session.sport?.name || 'Session'}</h2>
            <p className="mt-3 text-lg font-semibold text-slate-800">
              Captain: {session.captain?.displayName || 'Unknown'}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Location: {session.location?.name || 'Location TBD'}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Cost: {session.location?.priceEstimate || 'N/A'}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Starts at: {formatSessionTime(session.scheduledAt)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {!isJoined && (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={loading}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Join Session
                </button>
              )}
              {isJoined && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={loading}
                  className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-800"
                >
                  Leave Session
                </button>
              )}
              {isJoined && canBroadcast && (
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={loading}
                  className="rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700"
                >
                  Broadcast Invite
                </button>
              )}
              {isJoined && canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-700"
                >
                  Delete Session
                </button>
              )}
            </div>
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

          <section className={`${cardClass} p-6`}>
            <h3 className="text-lg font-semibold text-slate-900">Session Chat</h3>
            {!isJoined ? (
              <p className="mt-3 text-sm text-slate-500">
                Join this session to access the chat.
              </p>
            ) : (
              <>
                <div className="mt-4 h-56 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-slate-500">No messages yet.</p>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div key={`${message._id || index}`}>
                        <p className="text-xs font-semibold text-slate-500">
                          {message.sender?.displayName || 'Anonymous'}
                        </p>
                        <p className="text-sm text-slate-700">{message.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                    placeholder="Type a message"
                    value={chatDraft}
                    onChange={(event) => setChatDraft(event.target.value)}
                    disabled={!isJoined}
                  />
                  <button
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white"
                    onClick={handleSendMessage}
                    disabled={!isJoined || loading}
                    type="button"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
