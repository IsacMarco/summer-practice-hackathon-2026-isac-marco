import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }) =>
    `text-xs font-semibold uppercase tracking-wider transition ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
    }`

export default function Header({ authUser, profile, isAdmin, onSignOut }) {
    const headerName =
        profile?.displayName || authUser?.displayName || authUser?.email || 'Player'
    const headerInitial = headerName.charAt(0).toUpperCase()

    return (
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-6 pt-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-600">
                    ShowUp2Move
                </span>
                <h1 className="font-serif text-4xl leading-tight text-slate-900 md:text-5xl">
                    Rally your next game with a single tap.
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
                    Set your sports, answer the daily prompt, and we will build the right
                    group, captain, chat, and venue for you.
                </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <nav className="flex flex-wrap items-center gap-3">
                    <NavLink className={navLinkClass} to="/locations">
                        Locations
                    </NavLink>
                    {authUser && (
                        <>
                            <NavLink className={navLinkClass} to="/dashboard">
                                Dashboard
                            </NavLink>
                            <NavLink className={navLinkClass} to="/profile">
                                Profile
                            </NavLink>
                            <NavLink className={navLinkClass} to="/sessions">
                                Sessions
                            </NavLink>
                            <NavLink className={navLinkClass} to="/chat">
                                Chat
                            </NavLink>
                        </>
                    )}
                    {isAdmin && (
                        <NavLink className={navLinkClass} to="/admin">
                            Admin
                        </NavLink>
                    )}
                    {!authUser && (
                        <NavLink className={navLinkClass} to="/login">
                            Login
                        </NavLink>
                    )}
                </nav>
                {authUser && (
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/80 text-sm font-semibold text-slate-700 shadow-md">
                            {profile?.photoBase64 ? (
                                <img
                                    src={profile.photoBase64}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{headerInitial}</span>
                            )}
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold text-slate-800">{headerName}</p>
                            <p className="text-xs text-slate-500">Ready to show up?</p>
                        </div>
                        <button
                            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:border-slate-400"
                            onClick={onSignOut}
                            type="button"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
