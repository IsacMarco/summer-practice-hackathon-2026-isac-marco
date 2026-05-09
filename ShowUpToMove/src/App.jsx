import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'

import { apiFetch } from './api'
import { auth } from './firebase'
import Header from './components/Header'
import LoadingCard from './components/LoadingCard'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PublicLocationsPage from './pages/PublicLocationsPage'
import SessionsPage from './pages/SessionsPage'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
const PLAYER_LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced']

const formatSessionTime = (value) => {
  if (!value) {
    return 'Time TBD'
  }

  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getAuthErrorMessage = (error) => {
  const code = error?.code || ''
  if (code === 'auth/configuration-not-found') {
    return (
      'Firebase auth nu este configurat. Verifica setarile din Firebase Console si .env.'
    )
  }
  if (code === 'auth/invalid-api-key') {
    return 'API key-ul Firebase este invalid.'
  }
  if (code === 'auth/invalid-credential') {
    return 'Email sau parola incorecta.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'Acest email este deja folosit.'
  }
  if (code === 'auth/weak-password') {
    return 'Parola este prea slaba (minim 6 caractere).'
  }

  return error?.message || 'Autentificarea a esuat.'
}

const getLocationErrorMessage = (error) => {
  const message = String(error?.message || '')
  if (/admin only/i.test(message)) {
    return 'Doar adminul poate adauga locatii.'
  }
  if (/failed to fetch|networkerror/i.test(message)) {
    return 'Serverul nu raspunde. Verifica daca API-ul ruleaza.'
  }
  return message || 'A aparut o eroare.'
}

// Extracted loading placeholder component
const LoadingPlaceholder = () => (
  <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-20">
    <LoadingCard />
  </div>
)

// Extracted RequireAuth component to prevent unnecessary re-renders
const RequireAuth = ({ authReady, authUser, children }) => {
  if (!authReady) {
    return <LoadingPlaceholder />
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Extracted RequireAdmin component to prevent unnecessary re-renders
const RequireAdmin = ({ authReady, authUser, profile, children }) => {
  if (!authReady) {
    return <LoadingPlaceholder />
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <LoadingPlaceholder />
  }

  if (profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const [authReady, setAuthReady] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    displayName: '',
  })
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    skillLevel: '',
    sports: [],
    photoBase64: '',
  })
  const [sports, setSports] = useState([])
  const [sessions, setSessions] = useState([])
  const [mySessions, setMySessions] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatDraft, setChatDraft] = useState('')
  const [manualForm, setManualForm] = useState({
    sportId: '',
    scheduledAt: '',
    locationId: '',
    desiredPlayerLevels: [...PLAYER_LEVEL_OPTIONS],
    autoJoin: true,
  })
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    priceEstimate: '',
    sportIds: [],
  })
  const [notice, setNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState({
    dashboard: false,
    profile: false,
    match: false,
    session: false,
    chat: false,
    location: false,
  })

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const availabilityStatus = profile?.availability?.status || 'no'
  const joinedSessionIds = useMemo(
    () => new Set((mySessions || []).map((session) => session._id)),
    [mySessions],
  )

  const syncUser = async (user) => {
    await apiFetch('/api/auth/sync', {
      method: 'POST',
      body: {
        email: user.email,
        displayName: user.displayName || '',
      },
    })
  }

  const loadDashboard = async () => {
    setLoading((prev) => ({ ...prev, dashboard: true }))
    setErrorMessage('')

    try {
      const [profileData, sportsData, sessionsData, mySessionsData, locationsData] =
        await Promise.all([
          apiFetch('/api/users/me'),
          apiFetch('/api/sports'),
          apiFetch('/api/sessions'),
          apiFetch('/api/sessions?me=1'),
          apiFetch('/api/locations'),
        ])

      setProfile(profileData)
      setSports(sportsData)
      setSessions(sessionsData)
      setMySessions(mySessionsData)
      setLocations(locationsData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }))
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user)
      setAuthReady(true)
      setNotice('')
      setAuthError('')
      setErrorMessage('')

      if (user) {
        try {
          await syncUser(user)
          await loadDashboard()
        } catch (error) {
          setErrorMessage(error.message)
        }
      } else {
        setProfile(null)
        setSessions([])
        setMySessions([])
        setSports([])
        setLocations([])
        setSelectedSessionId('')
        setChatMessages([])
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!profile) {
      return
    }

    setProfileForm({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      skillLevel: profile.skillLevel || '',
      sports: profile.sports ? profile.sports.map((sport) => sport._id) : [],
      photoBase64: profile.photoBase64 || '',
    })
  }, [profile])

  useEffect(() => {
    if (selectedSessionId && !joinedSessionIds.has(selectedSessionId)) {
      setSelectedSessionId('')
      setChatMessages([])
    }
  }, [selectedSessionId, joinedSessionIds])

  useEffect(() => {
    if (!selectedSessionId || !joinedSessionIds.has(selectedSessionId)) {
      return
    }

    const loadChat = async () => {
      setLoading((prev) => ({ ...prev, chat: true }))
      try {
        const data = await apiFetch(`/api/chats/${selectedSessionId}`)
        setChatMessages(data.messages || [])
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading((prev) => ({ ...prev, chat: false }))
      }
    }

    loadChat()
  }, [selectedSessionId, joinedSessionIds])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthBusy(true)

    try {
      if (authMode === 'register') {
        const credential = await createUserWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password,
        )
        if (authForm.displayName) {
          await updateProfile(credential.user, {
            displayName: authForm.displayName,
          })
        }
      } else {
        await signInWithEmailAndPassword(
          auth,
          authForm.email,
          authForm.password,
        )
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setAuthBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field, value) => {
    setLocationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleManualChange = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleManualLevelToggle = (level) => {
    setManualForm((prev) => {
      const current = new Set(prev.desiredPlayerLevels || [])
      if (current.has(level)) {
        current.delete(level)
      } else {
        current.add(level)
      }

      return {
        ...prev,
        desiredPlayerLevels:
          current.size > 0 ? [...current] : [...PLAYER_LEVEL_OPTIONS],
      }
    })
  }

  const toggleSport = (sportId) => {
    setProfileForm((prev) => {
      const current = new Set(prev.sports)
      if (current.has(sportId)) {
        current.delete(sportId)
      } else {
        current.add(sportId)
      }
      return { ...prev, sports: [...current] }
    })
  }

  const handleProfileSave = async () => {
    setLoading((prev) => ({ ...prev, profile: true }))
    setNotice('')
    setErrorMessage('')

    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: profileForm,
      })
      setProfile(updated)
      setNotice('Profile updated!')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }))
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMessage('Photo is too large. Keep it under 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfileForm((prev) => ({
          ...prev,
          photoBase64: reader.result,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoClear = () => {
    setProfileForm((prev) => ({ ...prev, photoBase64: '' }))
  }

  const updateAvailability = async (available) => {
    setNotice('')
    setErrorMessage('')

    try {
      const data = await apiFetch('/api/availability', {
        method: 'POST',
        body: { available },
      })
      setProfile((prev) => ({ ...prev, availability: data }))
      setNotice(available ? 'Marked as available!' : 'Maybe next time!')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleMatch = async () => {
    setLoading((prev) => ({ ...prev, match: true }))
    setNotice('')
    setErrorMessage('')

    try {
      const data = await apiFetch('/api/match', { method: 'POST' })
      setSessions(data.sessions || [])
      setNotice(`Matched into ${data.createdSessionIds?.length || 0} sessions.`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, match: false }))
    }
  }

  const handleCreateSession = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, session: true }))
    setNotice('')
    setErrorMessage('')

    try {
      const payload = {
        sportId: manualForm.sportId,
        scheduledAt: manualForm.scheduledAt || undefined,
        locationId: manualForm.locationId || undefined,
        desiredPlayerLevels: manualForm.desiredPlayerLevels,
      }
      const created = await apiFetch('/api/sessions', {
        method: 'POST',
        body: payload,
      })
      setSessions((prev) => [created, ...prev])
      setMySessions((prev) => [created, ...prev])
      setManualForm({
        sportId: '',
        scheduledAt: '',
        locationId: '',
        desiredPlayerLevels: [...PLAYER_LEVEL_OPTIONS],
        autoJoin: true,
      })
      setNotice('Manual session created!')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleJoinSession = async (sessionId) => {
    if (!sessionId) {
      return
    }

    setLoading((prev) => ({ ...prev, session: true }))
    setErrorMessage('')

    try {
      const joined = await apiFetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
      })

      setSessions((prev) =>
        prev.map((session) => (session._id === joined._id ? joined : session)),
      )
      setMySessions((prev) => {
        const exists = prev.some((session) => session._id === joined._id)
        return exists ? prev : [joined, ...prev]
      })
      setSelectedSessionId(joined._id)
      setNotice('You joined the session.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleSendMessage = async () => {
    if (
      !selectedSessionId ||
      !joinedSessionIds.has(selectedSessionId) ||
      !chatDraft.trim()
    ) {
      return
    }

    setLoading((prev) => ({ ...prev, chat: true }))
    setErrorMessage('')

    try {
      const data = await apiFetch(`/api/chats/${selectedSessionId}`, {
        method: 'POST',
        body: { text: chatDraft.trim() },
      })
      setChatMessages(data.messages || [])
      setChatDraft('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, chat: false }))
    }
  }

  const handleAddLocation = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, location: true }))
    setErrorMessage('')

    try {
      const created = await apiFetch('/api/locations', {
        method: 'POST',
        body: locationForm,
      })
      setLocations((prev) => [created, ...prev])
      setLocationForm({ name: '', address: '', priceEstimate: '', sportIds: [] })
      setNotice('Location added!')
    } catch (error) {
      setErrorMessage(getLocationErrorMessage(error))
    } finally {
      setLoading((prev) => ({ ...prev, location: false }))
    }
  }

  const isLoading = Object.values(loading).some(Boolean)
  const isAdmin = profile?.role === 'admin'

  const renderAuthPage = () => {
    if (!authReady) {
      return <LoadingPlaceholder />
    }

    if (authUser) {
      return <Navigate to="/dashboard" replace />
    }

    return (
      <AuthPage
        authMode={authMode}
        authForm={authForm}
        authError={authError}
        authBusy={authBusy}
        onFieldChange={handleAuthFieldChange}
        onSubmit={handleAuthSubmit}
        onToggleMode={() =>
          setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
        }
      />
    )
  }

  const renderHome = () => {
    if (!authReady) {
      return <LoadingPlaceholder />
    }

    return <Navigate to={authUser ? '/dashboard' : '/locations'} replace />
  }

  return (
    <div className="app-shell">
      <div className="pointer-events-none absolute -top-24 right-[-5rem] h-72 w-72 rounded-full bg-orange-300/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 left-[-4rem] h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl animate-pulse" />
      <div className="relative z-10">
        <Header
          authUser={authUser}
          profile={profile}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />
        <Routes>
          <Route path="/" element={renderHome()} />
          <Route path="/login" element={renderAuthPage()} />
          <Route
            path="/locations"
            element={<PublicLocationsPage authUser={authUser} />}
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin authReady={authReady} authUser={authUser} profile={profile}>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth authReady={authReady} authUser={authUser}>
                <DashboardPage
                  notice={notice}
                  errorMessage={errorMessage}
                  profileForm={profileForm}
                  availabilityStatus={availabilityStatus}
                  todayLabel={todayLabel}
                  onUpdateAvailability={updateAvailability}
                  loadingMatch={loading.match}
                  onMatch={handleMatch}
                  sessions={sessions}
                  formatSessionTime={formatSessionTime}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth authReady={authReady} authUser={authUser}>
                <ProfilePage
                  notice={notice}
                  errorMessage={errorMessage}
                  profileForm={profileForm}
                  sports={sports}
                  loadingProfile={loading.profile}
                  onProfileChange={handleProfileChange}
                  onToggleSport={toggleSport}
                  onPhotoChange={handlePhotoChange}
                  onPhotoClear={handlePhotoClear}
                  onSaveProfile={handleProfileSave}
                  availabilityStatus={availabilityStatus}
                  todayLabel={todayLabel}
                  onUpdateAvailability={updateAvailability}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/sessions"
            element={
              <RequireAuth authReady={authReady} authUser={authUser}>
                <SessionsPage
                  notice={notice}
                  errorMessage={errorMessage}
                  sessions={sessions}
                  mySessionIds={joinedSessionIds}
                  currentUserId={profile?._id}
                  onJoinSession={handleJoinSession}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                  formatSessionTime={formatSessionTime}
                  loadingMatch={loading.match}
                  onMatch={handleMatch}
                  availabilityStatus={availabilityStatus}
                  todayLabel={todayLabel}
                  onUpdateAvailability={updateAvailability}
                  sports={sports}
                  locations={locations}
                  manualForm={manualForm}
                  onManualChange={handleManualChange}
                  onManualLevelToggle={handleManualLevelToggle}
                  onCreateSession={handleCreateSession}
                  loadingSession={loading.session}
                  locationForm={locationForm}
                  onLocationChange={handleLocationChange}
                  onAddLocation={handleAddLocation}
                  loadingLocation={loading.location}
                  isAdmin={isAdmin}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireAuth authReady={authReady} authUser={authUser}>
                <ChatPage
                  notice={notice}
                  errorMessage={errorMessage}
                  sessions={mySessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                  formatSessionTime={formatSessionTime}
                  chatMessages={chatMessages}
                  chatDraft={chatDraft}
                  onChatDraftChange={setChatDraft}
                  onSendMessage={handleSendMessage}
                  loadingChat={loading.chat}
                />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isLoading && (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
          Working...
        </div>
      )}
    </div>
  )
}

export default App
