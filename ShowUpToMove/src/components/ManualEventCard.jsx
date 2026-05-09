import { cardClass, cardTitleClass } from './ui'

export default function ManualEventCard({
    sports,
    locations,
    manualForm,
    onManualChange,
    onCreateSession,
    loading,
}) {
    const handleChange = (field) => (event) => {
        onManualChange(field, event.target.value)
    }

    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Manual event</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Create
                </span>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={onCreateSession}>
                <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    value={manualForm.sportId}
                    onChange={handleChange('sportId')}
                    required
                >
                    <option value="">Select sport</option>
                    {sports.map((sport) => (
                        <option key={sport._id} value={sport._id}>
                            {sport.name}
                        </option>
                    ))}
                </select>
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    type="datetime-local"
                    value={manualForm.scheduledAt}
                    onChange={handleChange('scheduledAt')}
                />
                <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    value={manualForm.locationId}
                    onChange={handleChange('locationId')}
                >
                    <option value="">Select location</option>
                    {locations.map((location) => (
                        <option key={location._id} value={location._id}>
                            {location.name}
                        </option>
                    ))}
                </select>
                <button
                    className="rounded-2xl bg-[#ff6b35] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-200"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create session'}
                </button>
            </form>
        </section>
    )
}
