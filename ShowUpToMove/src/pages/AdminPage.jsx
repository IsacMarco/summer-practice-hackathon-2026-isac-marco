import { useEffect, useState } from 'react'

import { apiFetch } from '../api'
import { cardClass, cardTitleClass } from '../components/ui'

const getAdminErrorMessage = (error) => {
    const message = String(error?.message || '')
    if (/admin only/i.test(message)) {
        return 'Nu ai drepturi de admin pentru aceasta actiune.'
    }
    if (/failed to fetch|networkerror/i.test(message)) {
        return 'Serverul nu raspunde. Verifica daca API-ul ruleaza.'
    }
    return message || 'A aparut o eroare.'
}

export default function AdminPage() {
    const [users, setUsers] = useState([])
    const [locations, setLocations] = useState([])
    const [locationForm, setLocationForm] = useState({
        name: '',
        address: '',
        priceEstimate: '',
    })
    const [loading, setLoading] = useState({
        users: false,
        locations: false,
        create: false,
        remove: '',
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

    useEffect(() => {
        loadUsers()
        loadLocations()
    }, [])

    const handleLocationChange = (field) => (event) => {
        setLocationForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

    const handleAddLocation = async (event) => {
        event.preventDefault()
        setLoading((prev) => ({ ...prev, create: true }))
        setNotice('')
        setErrorMessage('')

        try {
            const created = await apiFetch('/api/locations', {
                method: 'POST',
                body: locationForm,
            })
            setLocations((prev) => [created, ...prev])
            setLocationForm({ name: '', address: '', priceEstimate: '' })
            setNotice('Locatia a fost adaugata.')
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
            setNotice('Locatia a fost stearsa.')
        } catch (error) {
            setErrorMessage(getAdminErrorMessage(error))
        } finally {
            setLoading((prev) => ({ ...prev, remove: '' }))
        }
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
                <section className={`${cardClass} p-6`}>
                    <h2 className={cardTitleClass}>Admin panel</h2>
                    <p className="mt-3 text-sm text-slate-600">
                        Administreaza userii si locatiile dintr-un singur loc.
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
                                <p className="text-slate-500">Nu exista useri inca.</p>
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
                        <button
                            className="rounded-2xl bg-[#ff6b35] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px]"
                            type="submit"
                            disabled={loading.create}
                        >
                            {loading.create ? 'Adding...' : 'Add location'}
                        </button>
                    </form>

                    <div className="mt-6 space-y-3 text-sm">
                        {loading.locations && (
                            <p className="text-slate-500">Loading locations...</p>
                        )}
                        {!loading.locations && locations.length === 0 && (
                            <p className="text-slate-500">Nu exista locatii inca.</p>
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
                                </div>
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
