import { NavLink } from 'react-router-dom'

// Modern pill-shaped navigation links with active background
const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`

export default function Header({ authUser, profile, isAdmin, onSignOut }) {
    const headerName = profile?.displayName || authUser?.displayName || authUser?.email || 'Player'
    const headerInitial = headerName.charAt(0).toUpperCase()

    return (
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-6 pt-10 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Side: Branding & Hero */}
            <div className="flex-1">
                {/* Gradient brand text inside a soft pill */}
                <div className="inline-block rounded-full bg-indigo-50/50 px-3 py-1 ring-1 ring-indigo-100/50">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.3em] text-transparent">
                        ShowUp2Move
                    </span>
                </div>

                <h1 className="mt-5 font-serif text-4xl leading-[1.15] tracking-tight text-slate-900 md:text-5xl lg:text-[56px]">
                    Rally your next game <br className="hidden md:block" />
                    <span className="text-slate-400">with a single tap.</span>
                </h1>

                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-600">
                    Set your sports, answer the daily prompt, and we will build the right
                    group, captain, chat, and venue for you.
                </p>
            </div>

            {/* Right Side: Navigation & User Profile */}
            <div className="flex w-full flex-col items-start gap-6 lg:w-auto lg:items-end lg:gap-8">

                {/* Navigation Menu - Pill layout */}
                <nav className="flex w-full flex-wrap items-center gap-1 border-b border-slate-100 pb-5 lg:w-auto lg:justify-end lg:border-none lg:pb-0">
                    <NavLink className={navLinkClass} to="/locations">Locations</NavLink>
                    {authUser && (
                        <>
                            <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>
                            <NavLink className={navLinkClass} to="/profile">Profile</NavLink>
                            <NavLink className={navLinkClass} to="/sessions">Sessions</NavLink>
                            <NavLink className={navLinkClass} to="/chat">Chat</NavLink>
                        </>
                    )}
                    {isAdmin && <NavLink className={navLinkClass} to="/admin">Admin</NavLink>}
                    {!authUser && <NavLink className={navLinkClass} to="/login">Login</NavLink>}
                </nav>

                {/* User Profile Card - Floating Widget Style */}
                {authUser && (
                    <div className="group flex w-full items-center justify-between gap-4 rounded-3xl bg-white p-3 pr-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(79,70,229,0.15)] lg:w-auto lg:justify-end">

                        {/* User Details */}
                        <div className="flex flex-col items-start justify-center pl-2 lg:items-end">
                            <p className="text-[15px] font-bold tracking-tight text-slate-900">{headerName}</p>
                            <p className="text-[11px] font-medium text-slate-500">
                                Ready to show up?
                            </p>
                            {/* Distinct, pill-shaped sign out button */}
                            <button
                                onClick={onSignOut}
                                className="mt-2.5 rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                            >
                                Sign Out
                            </button>
                        </div>

                        {/* Avatar Container with Animated Gradient Border on Hover */}
                        <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-slate-200 p-[2px] transition-all duration-500 group-hover:bg-gradient-to-tr group-hover:from-indigo-500 group-hover:to-purple-500 lg:ml-4">
                            <div className="h-full w-full overflow-hidden rounded-[14px] bg-white">
                                {profile?.photoBase64 ? (
                                    <img
                                        src={profile.photoBase64}
                                        alt="Profile"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-xl font-bold text-slate-400">
                                        {headerInitial}
                                    </div>
                                )}
                            </div>
                            {/* Online Status Indicator with thicker border */}
                            <span className="absolute -bottom-1 -right-1 block h-[18px] w-[18px] rounded-full border-[3px] border-white bg-emerald-500 shadow-sm" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
