import { cardClass, cardTitleClass } from './ui'

export default function ChatCard({
    selectedSessionId,
    chatMessages,
    chatDraft,
    onChatDraftChange,
    onSendMessage,
    loading,
}) {
    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Session chat</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                    Live
                </span>
            </div>

            <div className="mt-4 h-52 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm">
                {selectedSessionId ? (
                    chatMessages.length > 0 ? (
                        chatMessages.map((message, index) => (
                            <div key={`${message._id || index}`}>
                                <p className="text-xs font-semibold text-slate-500">
                                    {message.sender?.displayName || 'Anonymous'}
                                </p>
                                <p className="text-sm text-slate-700">{message.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">
                            No messages yet. Start the chat!
                        </p>
                    )
                ) : (
                    <p className="text-sm text-slate-500">
                        Select a session to open the chat.
                    </p>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                    placeholder="Type a message"
                    value={chatDraft}
                    onChange={(event) => onChatDraftChange(event.target.value)}
                    disabled={!selectedSessionId}
                />
                <button
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white"
                    onClick={onSendMessage}
                    disabled={!selectedSessionId || loading}
                    type="button"
                >
                    Send
                </button>
            </div>
        </section>
    )
}
