import { cardClass, cardTitleClass } from './ui'

export default function LocationsCard({
    locations,
    locationForm = { name: '', address: '', priceEstimate: '' },
    onLocationChange = () => { },
    onAddLocation = () => { },
    loading = false,
    readOnly = false,
}) {
    const handleChange = (field) => (event) => {
        onLocationChange(field, event.target.value)
    }

    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Locations</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Nearby
                </span>
            </div>
            <div className="mt-4 space-y-3">
                {locations.length === 0 && !loading && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                        No locations yet.
                    </div>
                )}
                {locations.map((location) => (
                    <div
                        key={location._id}
                        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                    >
                        <p className="font-semibold text-slate-800">{location.name}</p>
                        <p className="text-xs text-slate-500">
                            {location.address || 'Address TBD'}
                        </p>
                        {location.priceEstimate && (
                            <p className="mt-1 text-xs text-slate-400">
                                Price: {location.priceEstimate}
                            </p>
                        )}
                        {location.sports?.length > 0 && (
                            <p className="mt-1 text-xs text-slate-400">
                                Sports: {location.sports.map((sport) => sport.name).join(', ')}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {!readOnly && (
                <form className="mt-4 grid gap-3" onSubmit={onAddLocation}>
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                        placeholder="New location name"
                        value={locationForm.name}
                        onChange={handleChange('name')}
                        required
                    />
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                        placeholder="Address"
                        value={locationForm.address}
                        onChange={handleChange('address')}
                    />
                    <input
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                        placeholder="Price estimate (e.g. $$)"
                        value={locationForm.priceEstimate}
                        onChange={handleChange('priceEstimate')}
                    />
                    <button
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add location'}
                    </button>
                </form>
            )}
        </section>
    )
}
