import SessionsCard from '../components/SessionsCard'
import MatchCard from '../components/MatchCard'
import ManualEventCard from '../components/ManualEventCard'
import AvailabilityCard from '../components/AvailabilityCard'
import NoticeBanner from '../components/NoticeBanner'

const widgetClass =
  'relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]'
const widgetHeaderClass =
  'mb-5 flex flex-col justify-between gap-3 border-b border-slate-50 pb-4 sm:flex-row sm:items-center sm:gap-0'
const widgetTitleClass = 'text-[1.15rem] font-bold tracking-tight text-slate-900'

export default function SessionsPage({
  notice,
  errorMessage,
  sessions,
  mySessionIds,
  formatSessionTime,
  onJoinSession,
  sports,
  locations,
  manualForm,
  onManualChange,
  onManualLevelToggle,
  onCreateSession,
  loadingSession,
  availabilityStatus,
  todayLabel,
  onUpdateAvailability,
  onMatch,
  loadingMatch,
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-2 lg:pt-4">
      <div className="soft-rise flex flex-col gap-6 lg:gap-8">
        <NoticeBanner notice={notice} error={errorMessage} />

        <header className="flex flex-col items-start gap-3">
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Sports Sessions
          </h1>
          <p className="max-w-xl text-[14px] leading-relaxed text-slate-500">
            Vezi toate sesiunile create, intra in cele potrivite si discuta doar
            in chat-urile sesiunilor la care participi.
          </p>
        </header>

        <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <section className={widgetClass}>
              <div className={widgetHeaderClass}>
                <div>
                  <h2 className={widgetTitleClass}>All Sessions</h2>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-400">
                    Toate sesiunile create pana acum.
                  </p>
                </div>
              </div>
              <SessionsCard
                sessions={sessions}
                mySessionIds={mySessionIds}
                formatSessionTime={formatSessionTime}
                onJoinSession={onJoinSession}
              />
            </section>

            <section className={widgetClass}>
              <div className={widgetHeaderClass}>
                <div>
                  <h2 className={widgetTitleClass}>Host a Session</h2>
                </div>
              </div>
              <ManualEventCard
                sports={sports}
                locations={locations}
                manualForm={manualForm}
                onManualChange={onManualChange}
                onManualLevelToggle={onManualLevelToggle}
                onCreateSession={onCreateSession}
                loading={loadingSession}
              />
            </section>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-indigo-50/80 to-white p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] ring-1 ring-indigo-100/50 sm:p-8">
              <h2 className={widgetTitleClass}>Auto-Match</h2>
              <MatchCard onRunMatch={onMatch} loading={loadingMatch} />
            </section>

            <section className={widgetClass}>
              <h2 className={widgetTitleClass}>Availability</h2>
              <AvailabilityCard
                availabilityStatus={availabilityStatus}
                todayLabel={todayLabel}
                onUpdateAvailability={onUpdateAvailability}
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
