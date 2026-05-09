import { cardClass, cardTitleClass } from './ui'

export default function ManualEventCard({
    sports,
    locations,
    manualForm,
    onManualChange,
    onCreateSession,
    loading,
}) {
    // Funcția ta originală pentru gestionarea schimbărilor
    const handleChange = (field) => (event) => {
        onManualChange(field, event.target.value)
    }

    // Clase CSS pentru designul premium al input-urilor
    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
    const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500"

    return (
        // Păstrăm containerul tău (cardClass), dar rafinăm interiorul
        <section className="flex flex-col gap-6">
            <form onSubmit={onCreateSession} className="flex flex-col gap-4">

                {/* Rândul 1: Sport & Locație */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Sport</label>
                        <select
                            className={inputClass}
                            value={manualForm?.sportId || ''}
                            onChange={handleChange('sportId')}
                            required
                        >
                            <option value="" disabled>Select sport</option>
                            {/* Folosim "?." pentru siguranță în caz că sports e undefined */}
                            {sports?.map((sport) => (
                                <option key={sport._id} value={sport._id}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Location</label>
                        <select
                            className={inputClass}
                            value={manualForm?.locationId || ''}
                            onChange={handleChange('locationId')}
                            required
                        >
                            <option value="" disabled>Select location</option>
                            {locations?.map((location) => (
                                <option key={location._id} value={location._id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Rândul 2: Data și Ora */}
                <div>
                    <label className={labelClass}>Date & Time</label>
                    <input
                        className={inputClass}
                        type="datetime-local"
                        value={manualForm?.scheduledAt || ''}
                        onChange={handleChange('scheduledAt')}
                        required
                    />
                </div>

                {/* Buton Premium */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-full bg-slate-900 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                        </span>
                    ) : (
                        'Create session'
                    )}
                </button>
            </form>
        </section>
    )
}