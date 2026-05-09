import { cardClass, cardTitleClass } from './ui'

export default function MatchCard({ loading, onMatch }) {
    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Match engine</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Smart grouping
                </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
                Ready to find your squad? Run today's matching now and auto assign
                captains.
            </p>
            <button
                className="mt-5 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-slate-300 transition hover:translate-y-[-1px]"
                onClick={onMatch}
                disabled={loading}
                type="button"
            >
                {loading ? 'Matching...' : 'Run matching'}
            </button>
        </section>
    )
}
