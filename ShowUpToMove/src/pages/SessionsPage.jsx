import SessionsCard from '../components/SessionsCard'
import MatchCard from '../components/MatchCard'
import ManualEventCard from '../components/ManualEventCard'
import AvailabilityCard from '../components/AvailabilityCard'
import NoticeBanner from '../components/NoticeBanner'

// Clase comune pentru widget-urile premium
const widgetClass = "relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
const widgetHeaderClass = "mb-5 flex flex-col justify-between gap-3 border-b border-slate-50 pb-4 sm:flex-row sm:items-center sm:gap-0"
const widgetTitleClass = "text-[1.15rem] font-bold tracking-tight text-slate-900"

export default function SessionsPage({
    notice,
    errorMessage,
    sessions,
    formatSessionTime,
    onLeaveSession,
    // Props pentru Ștergere (NOU adăugate)
    currentUserId,
    onDeleteSession,
    // Props pentru Matching & Disponibilitate
    availability,
    onUpdateAvailability,
    sports,
    onRunMatch,
    matching,
    locations,
    // Props pentru Eveniment Manual
    manualForm,
    onManualChange,
    onCreateSession,
    loadingManual
}) {
    return (
        <main className="mx-auto max-w-6xl px-6 pb-16 pt-2 lg:pt-4">
            <div className="soft-rise flex flex-col gap-6 lg:gap-8">

                <NoticeBanner notice={notice} error={errorMessage} />

                {/* Page Header Modern, mai compact */}
                <header className="flex flex-col items-start gap-3">
                    <div className="inline-flex">
                        <span className="rounded-full bg-indigo-50/50 px-3 py-1 ring-1 ring-indigo-100/50">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-[9px] font-black uppercase tracking-[0.3em] text-transparent">
                                Workspace
                            </span>
                        </span>
                    </div>
                    <h1 className="font-serif text-3xl leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                        Sports Sessions
                    </h1>
                    <p className="max-w-xl text-[14px] leading-relaxed text-slate-500">
                        Manage your current activities, host new ones manually, or let our algorithm find the perfect teammates for you.
                    </p>
                </header>

                {/* Grid Layout: 7 coloane stânga, 5 coloane dreapta */}
                <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">

                    {/* ========================================= */}
                    {/* STÂNGA: Sesiuni Active și Creare Manuală */}
                    {/* ========================================= */}
                    <div className="flex flex-col gap-6 lg:col-span-7">

                        <section className={widgetClass}>
                            <div className={widgetHeaderClass}>
                                <div>
                                    <h2 className={widgetTitleClass}>Active Sessions</h2>
                                    <p className="mt-0.5 text-[12px] font-medium text-slate-400">Games you are currently participating in.</p>
                                </div>
                                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-200/50 mt-3 sm:mt-0">
                                    <span className="mr-1.5 block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    {sessions?.length || 0} Active
                                </span>
                            </div>

                            <SessionsCard
                                sessions={sessions}
                                formatSessionTime={formatSessionTime}
                                onLeaveSession={onLeaveSession}
                                // Trimitem props-urile mai departe către card (NOU adăugate)
                                currentUserId={currentUserId}
                                onDeleteSession={onDeleteSession}
                            />
                        </section>

                        <section className={widgetClass}>
                            <div className={widgetHeaderClass}>
                                <div>
                                    <h2 className={widgetTitleClass}>Host a Session</h2>
                                    <p className="mt-0.5 text-[12px] font-medium text-slate-400">Create a specific event and invite players directly.</p>
                                </div>
                            </div>

                            <ManualEventCard
                                sports={sports}
                                locations={locations}
                                manualForm={manualForm}
                                onManualChange={onManualChange}
                                onCreateSession={onCreateSession}
                                loading={loadingManual}
                            />
                        </section>
                    </div>

                    {/* ========================================= */}
                    {/* DREAPTA: Matching și Disponibilitate */}
                    {/* ========================================= */}
                    <div className="flex flex-col gap-6 lg:col-span-5">

                        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-indigo-50/80 to-white p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] ring-1 ring-indigo-100/50 sm:p-8">
                            <div className="mb-5 pb-3">
                                <h2 className={widgetTitleClass}>Auto-Match</h2>
                                <p className="mt-0.5 text-[12px] font-medium text-indigo-900/60">Let the algorithm build the group for you.</p>
                            </div>

                            <MatchCard
                                onRunMatch={onRunMatch}
                                loading={matching}
                            />
                        </section>

                        <section className={widgetClass}>
                            <div className="mb-5 border-b border-slate-50 pb-4">
                                <h2 className={widgetTitleClass}>Availability</h2>
                                <p className="mt-0.5 text-[12px] font-medium text-slate-400">Update your schedule to get matched.</p>
                            </div>

                            <AvailabilityCard
                                availability={availability}
                                onUpdate={onUpdateAvailability}
                            />
                        </section>

                    </div>
                </div>
            </div>
        </main>
    )
}