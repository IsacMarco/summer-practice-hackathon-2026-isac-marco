import { cardClass, cardTitleClass } from '../components/ui'
import ChatCard from '../components/ChatCard'
import NoticeBanner from '../components/NoticeBanner'

/**
 * Chat Page that integrates the session list and the conversation window.
 * Uses existing UI components to maintain visual consistency.
 */
export default function ChatPage({
    notice,
    errorMessage,
    sessions,
    selectedSessionId,
    onSelectSession,
    formatSessionTime,
    chatMessages,
    chatDraft,
    onChatDraftChange,
    onSendMessage,
    loadingChat,
}) {
    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <div className="soft-rise space-y-6">
                {/* Display system notifications or errors */}
                <NoticeBanner notice={notice} error={errorMessage} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Active Sessions List */}
                    <section className={`${cardClass} p-6 lg:col-span-1`}>
                        <h2 className={`${cardTitleClass} mb-4`}>Your Sessions</h2>
                        <p className="mb-6 text-sm text-slate-600">
                            Select a session to view the group chat and coordinate with your team.
                        </p>

                        <div className="space-y-3">
                            {sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <button
                                        key={session._id}
                                        onClick={() => onSelectSession(session._id)}
                                        className={`w-full rounded-2xl p-4 text-left transition-all ${selectedSessionId === session._id
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-white/50 text-slate-700 hover:bg-white/80'
                                            }`}
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                                            {session.name || session.sport?.name || 'Sport'}
                                        </p>
                                        <p className="font-semibold">{session.location?.name || 'Location TBD'}</p>
                                        <p className="mt-1 text-xs opacity-80">
                                            Captain: {session.captain?.displayName || 'Unknown'} | Cost: {session.location?.priceEstimate || 'N/A'}
                                        </p>
                                        <p className="mt-1 text-xs">{formatSessionTime(session.scheduledAt)}</p>
                                    </button>
                                ))
                            ) : (
                                <p className="py-10 text-center text-sm text-slate-500">
                                    No active sessions found.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Actual Chat Component */}
                    <div className="lg:col-span-2">
                        <ChatCard
                            selectedSessionId={selectedSessionId}
                            chatMessages={chatMessages}
                            chatDraft={chatDraft}
                            onChatDraftChange={onChatDraftChange}
                            onSendMessage={onSendMessage}
                            loading={loadingChat}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}  
