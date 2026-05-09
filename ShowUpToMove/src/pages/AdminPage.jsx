import { useEffect, useState } from 'react'

import { apiFetch } from '../api'
import { cardClass, cardTitleClass } from '../components/ui'

const getAdminErrorMessage = (error) => {
    const message = String(error?.message || '')
    if (/admin only/i.test(message)) {
        return 'You do not have admin rights for this action.'
    }
    if (/failed to fetch|networkerror/i.test(message)) {
        return 'Server is not responding. Check if the API is running.'
    }
    return message || 'An error occurred.'
}

export default function AdminPage() {
    const [users, setUsers] = useState([])
    const [locations, setLocations] = useState([])
    const [sessions, setSessions] = useState([])
    const [sports, setSports] = useState([])
    const [locationForm, setLocationForm] = useState({
        name: '',
        address: '',
        priceEstimate: '',
        sportIds: [],
    })
    const [editingLocationId, setEditingLocationId] = useState('')
    const [loading, setLoading] = useState({
        users: false,
        locations: false,
        create: false,
        remove: '',
        removeSession: '',
    })
    const [notice, setNotice] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const loadUsers = async () => {
        setLoading((prev) => ({ ...prev, users: true }))
        setErrorMessage('')

        try {
            const data = await apiFetch('/api/admin/users')
            setUsers(data)
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, users: false }))
        }
    }

    const loadLocations = async () => {
        setLoading((prev) => ({ ...prev, locations: true }))
        setErrorMessage('')

        try {
            const data = await apiFetch('/api/locations')
            setLocations(data)
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, locations: false }))
        }
    }

    const loadSports = async () => {
        try {
            const data = await apiFetch('/api/sports')
            setSports(data)
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        }
    }

    const loadSessions = async () => {
        try {
            const data = await apiFetch('/api/sessions')
            setSessions(data)
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        }
    }

    useEffect(() => {
        loadUsers()
        loadLocations()
        loadSports()
        loadSessions()
    }, [])

    const handleLocationChange = (field) => (event) => {
        setLocationForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

    const toggleLocationSport = (sportId) => {
        setLocationForm((prev) => {
            const current = new Set(prev.sportIds || [])
            if (current.has(sportId)) {
                current.delete(sportId)
            } else {
                current.add(sportId)
            }
            return { ...prev, sportIds: [...current] }
        })
    }

    const handleAddLocation = async (event) => {
        event.preventDefault()
        setLoading((prev) => ({ ...prev, create: true }))
        setNotice('')
        setErrorMessage('')

        if ((locationForm.sportIds || []).length === 0) {
            setErrorMessage('Select at least one sport before saving location.')
            setLoading((prev) => ({ ...prev, create: false }))
            return
        }

        try {
            const endpoint = editingLocationId
                ? `/api/locations/${editingLocationId}`
                : '/api/locations'
            const method = editingLocationId ? 'PUT' : 'POST'
            const created = await apiFetch(endpoint, {
                method,
                body: locationForm,
            })
            setLocations((prev) =>
                editingLocationId
                    ? prev.map((loc) => (loc._id === editingLocationId ? created : loc))
                    : [created, ...prev],
            )
            setLocationForm({ name: '', address: '', priceEstimate: '', sportIds: [] })
            setEditingLocationId('')
            setNotice(editingLocationId ? 'Location updated.' : 'Location added.')
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, create: false }))
        }
    }

    const handleDeleteLocation = async (locationId) => {
        setLoading((prev) => ({ ...prev, remove: locationId }))
        setNotice('')
        setErrorMessage('')

        try {
            await apiFetch(`/api/locations/${locationId}`, { method: 'DELETE' })
            setLocations((prev) => prev.filter((item) => item._id !== locationId))
            setNotice('Location deleted.')
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, remove: '' }))
        }
    }

    const handleEditLocation = (location) => {
        setEditingLocationId(location._id)
        setLocationForm({
            name: location.name || '',
            address: location.address || '',
            priceEstimate: location.priceEstimate || '',
            sportIds: (location.sports || []).map((sport) => sport._id || sport),
        })
    }

    const handleDeleteSession = async (sessionId) => {
        setLoading((prev) => ({ ...prev, removeSession: sessionId }))
        setNotice('')
        setErrorMessage('')

        try {
            await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
            setSessions((prev) => prev.filter((item) => item._id !== sessionId))
            setNotice('Session deleted.')
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, removeSession: '' }))
        }
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
                <section className={`${cardClass} p-6`}>
                    <h2 className={cardTitleClass}>Admin panel</h2>
                    <p className="mt-3 text-sm text-slate-600">
                        Manage users, sessions, and locations from one place.
                    </p>
                    {(notice || errorMessage) && (
                        <div
                            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${errorMessage
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                                }`}
                        >
                            {errorMessage || notice}
                        </div>
                    )}
                </section>

                <section className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Users</h3>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                            {users.length}
                        </span>
                    </div>
                    {loading.users ? (
                        <p className="mt-4 text-sm text-slate-500">Loading users...</p>
                    ) : (
                        <div className="mt-4 space-y-3 text-sm">
                            {users.length === 0 && (
                                <p className="text-slate-500">No users yet.</p>
                            )}
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                                >
                                    <p className="font-semibold text-slate-800">
                                        {user.displayName || user.email}
                                    </p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                    <p className="mt-1 text-xs text-slate-400">Role: {user.role}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Sessions</h3>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                            {sessions.length}
                        </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                        {sessions.map((session) => (
                            <div
                                key={session._id}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                            >
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {session.name || session.sport?.name || 'Session'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Captain: {session.captain?.displayName || 'Unknown'}
                                    </p>
                                </div>
                                <button
                                    className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                                    type="button"
                                    onClick={() => handleDeleteSession(session._id)}
                                    disabled={loading.removeSession === session._id}
                                >
                                    {loading.removeSession === session._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="space-y-6">
                <section className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Locations</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {locations.length}
                        </span>
                    </div>

                    <form className="mt-4 grid gap-3" onSubmit={handleAddLocation}>
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                            placeholder="Location name"
                            value={locationForm.name}
                            onChange={handleLocationChange('name')}
                            required
                        />
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                            placeholder="Address"
                            value={locationForm.address}
                            onChange={handleLocationChange('address')}
                        />
                        <input
                            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-amber-400"
                            placeholder="Price estimate (e.g. $$)"
                            value={locationForm.priceEstimate}
                            onChange={handleLocationChange('priceEstimate')}
                        />
                        <div className="flex flex-wrap gap-2">
                            {sports.map((sport) => {
                                const active = locationForm.sportIds.includes(sport._id)
                                return (
                                    <button
                                        key={sport._id}
                                        type="button"
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                                        onClick={() => toggleLocationSport(sport._id)}
                                    >
                                        {sport.name}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            className="rounded-2xl bg-[#ff6b35] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px]"
                            type="submit"
                            disabled={loading.create}
                        >
                            {loading.create ? 'Saving...' : editingLocationId ? 'Save location' : 'Add location'}
                        </button>
                        {editingLocationId && (
                            <button
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600"
                                type="button"
                                onClick={() => {
                                    setEditingLocationId('')
                                    setLocationForm({ name: '', address: '', priceEstimate: '', sportIds: [] })
                                }}
                            >
                                Cancel edit
                            </button>
                        )}
                    </form>

                    <div className="mt-6 space-y-3 text-sm">
                        {loading.locations && (
                            <p className="text-slate-500">Loading locations...</p>
                        )}
                        {!loading.locations && locations.length === 0 && (
                            <p className="text-slate-500">No locations yet.</p>
                        )}
                        {locations.map((location) => (
                            <div
                                key={location._id}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                            >
                                <div>
                                    <p className="font-semibold text-slate-800">{location.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {location.address || 'Address TBD'}
                                    </p>
                                    {location.sports?.length > 0 && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Sports: {location.sports.map((sport) => sport.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="rounded-full border border-indigo-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-700"
                                    type="button"
                                    onClick={() => handleEditLocation(location)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                                    type="button"
                                    onClick={() => handleDeleteLocation(location._id)}
                                    disabled={loading.remove === location._id}
                                >
                                    {loading.remove === location._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
