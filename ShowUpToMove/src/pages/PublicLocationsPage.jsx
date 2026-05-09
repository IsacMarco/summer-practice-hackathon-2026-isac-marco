import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiFetch } from '../api'
import LocationsCard from '../components/LocationsCard'
import { cardClass, cardTitleClass } from '../components/ui'

export default function PublicLocationsPage({ authUser }) {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let mounted = true

        const loadLocations = async () => {
            setLoading(true)
            setErrorMessage('')

            try {
                const data = await apiFetch('/api/locations')
                if (mounted) {
                    setLocations(data)
                }
            } catch (error) {
                if (mounted) {
                    const message = String(error.message || '')
                    const isNetworkError = /failed to fetch|networkerror/i.test(message)
                    setErrorMessage(
                        isNetworkError
                            ? 'Nu putem incarca locatiile acum. Verifica daca serverul merge.'
                            : 'A aparut o eroare la incarcarea locatiilor. Incearca din nou.',
                    )
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadLocations()

        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className={`${cardClass} p-6`}>
                <h2 className={cardTitleClass}>Public locations</h2>
                <p className="mt-3 text-sm text-slate-600">
                    Browse nearby venues even without an account. Sign in when you are
                    ready to join or create a session.
                </p>

                {authUser ? (
                    <Link
                        className="mt-6 inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-slate-300"
                        to="/dashboard"
                    >
                        Go to dashboard
                    </Link>
                ) : (
                    <Link
                        className="mt-6 inline-flex rounded-2xl bg-[#ff6b35] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-200"
                        to="/login"
                    >
                        Sign in to join
                    </Link>
                )}

                <div className="mt-6 space-y-2 text-xs text-slate-500">
                    <p>Public access: locations only.</p>
                    <p>Private access: matching, chat, and sessions.</p>
                </div>
            </div>

            <div className="space-y-4">
                {errorMessage && !loading && (
                    <div className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700">
                        {errorMessage}
                    </div>
                )}
                {loading && (
                    <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-500">
                        Loading locations...
                    </div>
                )}
                <LocationsCard locations={locations} readOnly loading={loading} />
            </div>
        </div>
    )
}
