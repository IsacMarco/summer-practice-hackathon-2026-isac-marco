import { cardClass, cardTitleClass } from './ui'

export default function AvailabilityCard({
    availabilityStatus,
    todayLabel,
    onUpdateAvailability,
}) {
    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>ShowUpToday?</h2>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-900">
                    {todayLabel}
                </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
                Tell the system if you are ready to play. We will match you into the
                right group size.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    className={`rounded-full hover:bg-emerald-600 hover:text-white px-5 py-3 text-sm font-semibold uppercase tracking-wider transition ${availabilityStatus === 'yes'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-emerald-600 border border-emerald-200'
                        }`}
                    onClick={() => onUpdateAvailability(true)}
                    type="button"
                >
                    Yes, match me
                </button>
                <button
                    className={`rounded-full hover:bg-slate-600 hover:text-white px-5 py-3 text-sm font-semibold uppercase tracking-wider transition ${availabilityStatus === 'no'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                    onClick={() => onUpdateAvailability(false)}
                    type="button"
                >
                    Not today
                </button>
            </div>
        </section>
    )
}
