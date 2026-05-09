import { cardClass, cardTitleClass } from '../components/ui'
import NoticeBanner from '../components/NoticeBanner'

export default function ProfilePage({
  notice,
  errorMessage,
  profileForm,
  sports,
  loadingProfile,
  onProfileChange,
  onToggleSport,
  onPhotoChange,
  onPhotoClear,
  onSaveProfile,
  onAutoDetectProfile,
  availabilityStatus,
  todayLabel,
  onUpdateAvailability,
}) {
  const inputStyle =
    'w-full rounded-2xl border-2 border-slate-100 bg-white/60 px-5 py-4 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/50 placeholder:text-slate-400'
  const labelStyle =
    'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500'

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="soft-rise space-y-8">
        <NoticeBanner notice={notice} error={errorMessage} />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <section className={`${cardClass} overflow-hidden p-6 text-center`}>
              <div className="group relative mx-auto h-36 w-36 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl shadow-orange-100 transition-transform hover:scale-105">
                {profileForm.photoBase64 ? (
                  <img src={profileForm.photoBase64} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-5xl text-slate-300">
                    ?
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <label className="flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95">
                  Change Photo
                  <input type="file" className="hidden" onChange={onPhotoChange} accept="image/*" />
                </label>
                {profileForm.photoBase64 && (
                  <button
                    onClick={onPhotoClear}
                    className="text-xs font-semibold uppercase tracking-wider text-red-500 transition-colors hover:text-red-600"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </section>

            <section className={`${cardClass} p-6`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Daily Check-in - {todayLabel}
              </h3>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onUpdateAvailability(true)}
                  className={`rounded-2xl py-3 text-sm font-semibold transition-all ${
                    availabilityStatus === 'yes'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                      : 'bg-white text-slate-600 border border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  I'm ready to move
                </button>
                <button
                  onClick={() => onUpdateAvailability(false)}
                  className={`rounded-2xl py-3 text-sm font-semibold transition-all ${
                    availabilityStatus === 'no'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white text-slate-600 border border-slate-100 hover:border-orange-200'
                  }`}
                >
                  Skip today
                </button>
              </div>
            </section>
          </div>

          <div className="md:col-span-2">
            <section className={`${cardClass} p-8 lg:p-10`}>
              <h2 className={cardTitleClass}>Profile Settings</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your data is automatically synced. Click save to finalize changes.
              </p>

              <div className="mt-10 space-y-8">
                <div className="group">
                  <label className={`${labelStyle} group-focus-within:text-emerald-500 transition-colors`}>
                    Public Display Name
                  </label>
                  <input
                    type="text"
                    className={inputStyle}
                    placeholder="How should we call you?"
                    value={profileForm.displayName}
                    onChange={(e) => onProfileChange('displayName', e.target.value)}
                  />
                </div>

                <div className="group">
                  <label className={`${labelStyle} group-focus-within:text-emerald-500 transition-colors`}>
                    Brief Bio
                  </label>
                  <textarea
                    rows="3"
                    className={`${inputStyle} resize-none`}
                    placeholder="Share a bit about your style..."
                    value={profileForm.bio}
                    onChange={(e) => onProfileChange('bio', e.target.value)}
                  />
                  <button
                    onClick={onAutoDetectProfile}
                    type="button"
                    className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                  >
                    Auto detect level and sports with AI
                  </button>
                </div>

                <div className="group">
                  <label className={`${labelStyle} group-focus-within:text-emerald-500 transition-colors`}>
                    Your Skill Level
                  </label>
                  <div className="relative">
                    <select
                      className={`${inputStyle} appearance-none pr-12`}
                      value={profileForm.skillLevel}
                      onChange={(e) => onProfileChange('skillLevel', e.target.value)}
                    >
                      <option value="" disabled>
                        Choose your level
                      </option>
                      <option value="Beginner">Beginner - Just starting out</option>
                      <option value="Intermediate">Intermediate - I know the rules</option>
                      <option value="Advanced">Advanced - Competitive player</option>
                    </select>
                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Favorite Sports
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map((sport) => {
                      const isSelected = profileForm.sports.includes(sport._id)
                      return (
                        <button
                          key={sport._id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            onToggleSport(sport._id)
                          }}
                          className={`rounded-2xl px-5 py-2.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                              : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:bg-white hover:ring-slate-300'
                          }`}
                        >
                          {sport.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onSaveProfile}
                    disabled={loadingProfile}
                    className="group relative w-full overflow-hidden rounded-[2rem] bg-emerald-500 py-5 text-sm font-semibold uppercase tracking-wider text-white shadow-2xl shadow-emerald-200 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loadingProfile ? 'Synchronizing...' : 'Save Changes'}
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
