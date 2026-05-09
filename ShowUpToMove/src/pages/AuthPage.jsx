import { cardClass, cardTitleClass } from '../components/ui'

export default function AuthPage({
    authMode,
    authForm,
    authError,
    authBusy,
    onFieldChange,
    onSubmit,
    onToggleMode,
}) {
    const handleChange = (field) => (event) => {
        onFieldChange(field, event.target.value)
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center gap-6">
                <div className={`${cardClass} p-6`}>
                    <h2 className={cardTitleClass}>
                        A lightweight profile, a powerful match engine.
                    </h2>
                    <p className="mt-3 text-sm text-slate-600">
                        We use your availability and sports preferences to form the ideal
                        group size every day. No more group chats chaos.
                    </p>
                    <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Smart Matching
                            </p>
                            <p className="mt-2 font-semibold">Group size aware</p>
                            <p className="text-xs text-slate-500">Football 10-14, Tennis 2-4.</p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                ShowUpToday?
                            </p>
                            <p className="mt-2 font-semibold">One tap response</p>
                            <p className="text-xs text-slate-500">
                                Daily check-ins in seconds.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Captain Tools
                            </p>
                            <p className="mt-2 font-semibold">Auto assignment</p>
                            <p className="text-xs text-slate-500">
                                One person gets logistics tools.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Location Assist
                            </p>
                            <p className="mt-2 font-semibold">Venue suggestions</p>
                            <p className="text-xs text-slate-500">
                                Pricing and vote-ready options.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${cardClass} p-6`}>
                <h2 className={cardTitleClass}>
                    {authMode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    {authMode === 'login'
                        ? "Jump back into today's matches."
                        : 'Set up your profile and start matching.'}
                </p>

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                    {authMode === 'register' && (
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Display name
                            </label>
                            <input
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                                value={authForm.displayName}
                                onChange={handleChange('displayName')}
                                placeholder="Jordan Lee"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Email
                        </label>
                        <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                            type="email"
                            value={authForm.email}
                            onChange={handleChange('email')}
                            placeholder="you@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Password
                        </label>
                        <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                            type="password"
                            value={authForm.password}
                            onChange={handleChange('password')}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    {authError && (
                        <p className="rounded-2xl bg-rose-100 px-4 py-2 text-xs text-rose-700">
                            {authError}
                        </p>
                    )}

                    <button
                        className="w-full rounded-2xl bg-[#ff6b35] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px] hover:bg-orange-500 hover:shadow-orange-300/70"
                        type="submit"
                        disabled={authBusy}
                    >
                        {authBusy
                            ? 'Working...'
                            : authMode === 'login'
                                ? 'Sign in'
                                : 'Create account'}
                    </button>
                </form>

                <button
                    className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:text-slate-700 hover:underline"
                    onClick={onToggleMode}
                    type="button"
                >
                    {authMode === 'login'
                        ? 'Need an account? Register'
                        : 'Already have one? Sign in'}
                </button>
            </div>
        </div>
    )
}
