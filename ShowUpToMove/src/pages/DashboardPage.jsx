import { Link } from 'react-router-dom'
import AvailabilityCard from '../components/AvailabilityCard'
import MatchCard from '../components/MatchCard'
import NoticeBanner from '../components/NoticeBanner'
import { cardClass, cardTitleClass } from '../components/ui'

export default function DashboardPage({
    notice,
    errorMessage,
    profileForm,
    availabilityStatus,
    todayLabel,
    onUpdateAvailability,
    loadingMatch,
    onMatch,
    sessions,
    formatSessionTime,
}) {
    const displayName = profileForm.displayName || 'Player'
    const sportsCount = profileForm.sports?.length || 0
    const availabilityLabel =
        availabilityStatus === 'yes' ? 'In' : availabilityStatus === 'no' ? 'Out' : 'Not set'
    const upcomingSessions = sessions.slice(0, 3)

    return (
        <div className="mx-auto w-full max-w-6xl px-6 pb-16">
            <div className="soft-rise">
                <NoticeBanner notice={notice} errorMessage={errorMessage} />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                    <section className={`${cardClass} soft-rise soft-rise-delay-1 p-6`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                            Today in motion
                        </p>
                        <h2 className={`${cardTitleClass} mt-2`}>
                            Welcome back, {displayName}.
                        </h2>
                        <p className="mt-3 text-sm text-slate-600">
                            Your warm-up is simple: check in, tune your profile, and we will
                            build the right squad around you.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <span className="rounded-full border border-white/70 bg-white/70 px-3 py-2">
                                Availability: {availabilityLabel}
                            </span>
                            <span className="rounded-full border border-white/70 bg-white/70 px-3 py-2">
                                Sessions: {sessions.length}
                            </span>
                            <span className="rounded-full border border-white/70 bg-white/70 px-3 py-2">
                                Sports: {sportsCount}
                            </span>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-slate-300 transition hover:translate-y-[-1px]"
                                to="/profile"
                            >
                                Edit profile
                            </Link>
                            <Link
                                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 transition hover:border-slate-300"
                                to="/sessions"
                            >
                                Plan sessions
                            </Link>
                            <Link
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 transition hover:border-emerald-300"
                                to="/chat"
                            >
                                Open chat
                            </Link>
                        </div>
                    </section>

                    <div className="soft-rise soft-rise-delay-2">
                        <AvailabilityCard
                            availabilityStatus={availabilityStatus}
                            todayLabel={todayLabel}
                            onUpdateAvailability={onUpdateAvailability}
                        />
                    </div>
                    <div className="soft-rise soft-rise-delay-3">
                        <MatchCard loading={loadingMatch} onMatch={onMatch} />
                    </div>
                </div>

                <div className="space-y-6">
                    <section className={`${cardClass} soft-rise soft-rise-delay-2 p-6`}>
                        <h2 className={cardTitleClass}>Up next</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            A quick look at your closest sessions.
                        </p>
                        <div className="mt-4 space-y-3">
                            {upcomingSessions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-sm text-slate-500">
                                    No sessions yet. Run matching or create one in Sessions.
                                </div>
                            ) : (
                                upcomingSessions.map((session) => (
                                    <div
                                        key={session._id}
                                        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">
                                                {session.sport?.name || 'Session'}
                                            </span>
                                            <span className="text-xs uppercase tracking-wider text-slate-500">
                                                {session.participants?.length || 0} players
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {formatSessionTime(session.scheduledAt)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link
                            className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600"
                            to="/sessions"
                        >
                            View all sessions
                        </Link>
                    </section>

                    <section className={`${cardClass} soft-rise soft-rise-delay-3 p-6`}>
                        <h2 className={cardTitleClass}>Stay warm</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Small rituals keep the group energy high and the matches smooth.
                        </p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                                Answer the daily check-in so captains can plan quickly.
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                                Send one friendly line in chat once your session locks in.
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                                Keep your sports list fresh so matching stays accurate.
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
