const levelOptions = [
  { value: 'beginner', label: 'Incepator' },
  { value: 'intermediate', label: 'Mediu' },
  { value: 'advanced', label: 'Avansat' },
]

export default function ManualEventCard({
  sports,
  locations,
  manualForm,
  onManualChange,
  onManualLevelToggle,
  onCreateSession,
  loading,
}) {
  const handleChange = (field) => (event) => {
    onManualChange(field, event.target.value)
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500'
  const labelClass =
    'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500'

  return (
    <section className="flex flex-col gap-6">
      <form onSubmit={onCreateSession} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Sport</label>
            <select
              className={inputClass}
              value={manualForm?.sportId || ''}
              onChange={handleChange('sportId')}
              required
            >
              <option value="" disabled>
                Select sport
              </option>
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
              <option value="" disabled>
                Select location
              </option>
              {locations?.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div>
          <label className={labelClass}>Tip jucatori cautati</label>
          <div className="flex flex-wrap gap-2">
            {levelOptions.map((option) => {
              const active = (manualForm?.desiredPlayerLevels || []).includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onManualLevelToggle(option.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-slate-900 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating...' : 'Create session'}
        </button>
      </form>
    </section>
  )
}
