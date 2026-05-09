import { cardClass, cardTitleClass } from './ui'

export default function ProfileCard({
    profileForm,
    sports,
    loading,
    onProfileChange,
    onToggleSport,
    onPhotoChange,
    onPhotoClear,
    onSave,
}) {
    const photoPreview = profileForm.photoBase64

    const handleChange = (field) => (event) => {
        onProfileChange(field, event.target.value)
    }

    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
                <h2 className={cardTitleClass}>Your profile</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                    Profile
                </span>
            </div>
            <div className="mt-5 grid gap-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                    No photo
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Profile photo
                            </p>
                            <input
                                className="mt-2 block w-full text-xs text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-white"
                                type="file"
                                accept="image/*"
                                onChange={onPhotoChange}
                            />
                            <p className="mt-2 text-xs text-slate-400">
                                Stored in MongoDB as base64. Max 2 MB.
                            </p>
                        </div>
                    </div>
                    {photoPreview && (
                        <button
                            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600"
                            onClick={onPhotoClear}
                            type="button"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    placeholder="Display name"
                    value={profileForm.displayName}
                    onChange={handleChange('displayName')}
                />
                <textarea
                    className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    placeholder="Short bio"
                    value={profileForm.bio}
                    onChange={handleChange('bio')}
                />
                <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                    placeholder="Skill level (optional)"
                    value={profileForm.skillLevel}
                    onChange={handleChange('skillLevel')}
                />
            </div>

            <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sports
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {sports.map((sport) => {
                        const isActive = profileForm.sports.includes(sport._id)
                        return (
                            <button
                                key={sport._id}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${isActive
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-300 bg-white text-slate-600'
                                    }`}
                                onClick={() => onToggleSport(sport._id)}
                                type="button"
                            >
                                {sport.name}
                            </button>
                        )
                    })}
                </div>
            </div>

            <button
                className="mt-6 rounded-2xl bg-[#2ec4b6] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-200 transition hover:translate-y-[-1px]"
                onClick={onSave}
                disabled={loading}
                type="button"
            >
                {loading ? 'Saving...' : 'Save profile'}
            </button>
        </section>
    )
}
