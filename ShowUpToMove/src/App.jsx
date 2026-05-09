import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import SessionDetailsPage from './pages/SessionDetailsPage'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
const PLAYER_LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced']
const normalizeSkillLevel = (value = '') => {
  const skill = String(value).toLowerCase()
  if (skill.startsWith('begin')) return 'beginner'
  if (skill.startsWith('inter')) return 'intermediate'
  if (skill.startsWith('adv')) return 'advanced'
  return ''
}

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
    return 'Firebase auth is not configured. Check Firebase Console settings and .env.'
  }
  if (code === 'auth/invalid-api-key') {
    return 'The Firebase API key is invalid.'
  }
  if (code === 'auth/invalid-credential') {
    return 'Invalid email or password.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email is already in use.'
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak (minimum 6 characters).'
  }

  return error?.message || 'Authentication failed.'
}

const getLocationErrorMessage = (error) => {
  const message = String(error?.message || '')
  if (/admin only/i.test(message)) {
    return 'Only admins can add locations.'
  }
  if (/failed to fetch|networkerror/i.test(message)) {
    return 'Server is not responding. Check if the API is running.'
  }
  return message || 'An error occurred.'
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
  const location = useLocation()
  const navigate = useNavigate()
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
    name: '',
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
  const [matchSuggestion, setMatchSuggestion] = useState(null)
  const [invites, setInvites] = useState([])
  const [screenAlert, setScreenAlert] = useState(null)
  const [profileDirty, setProfileDirty] = useState(false)
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
  const upcomingChatSessions = useMemo(
    () =>
      (mySessions || []).filter(
        (session) => session?.scheduledAt && new Date(session.scheduledAt) >= new Date(),
      ),
    [mySessions],
  )
  const filteredLocations = useMemo(() => {
    if (!manualForm.sportId) return locations
    return (locations || []).filter((locationItem) => {
      const supported = locationItem?.sports || []
      if (supported.length === 0) return true
      return supported.some((sport) => (sport?._id || sport) === manualForm.sportId)
    })
  }, [locations, manualForm.sportId])
  const isProfilePage = location.pathname === '/profile'

  const showScreenAlert = (message, type = 'success') => {
    setScreenAlert({ message, type })
    setTimeout(() => {
      setScreenAlert((current) => (current?.message === message ? null : current))
    }, 3500)
  }

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
      const [
        profileData,
        sportsData,
        sessionsData,
        mySessionsData,
        locationsData,
        invitesData,
      ] =
        await Promise.all([
          apiFetch('/api/users/me'),
          apiFetch('/api/sports'),
          apiFetch('/api/sessions'),
          apiFetch('/api/sessions?me=1'),
          apiFetch('/api/locations'),
          apiFetch('/api/users/me/invites'),
        ])

      setProfile(profileData)
      setSports(sportsData)
      setSessions(sessionsData)
      setMySessions(mySessionsData)
      setLocations(locationsData)
      setInvites(invitesData || [])
    } catch (error) {
      setErrorMessage(error.message)
      showScreenAlert(error.message || 'Action failed.', 'error')
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
        setInvites([])
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!authUser) {
      return
    }
    loadDashboard()
  }, [location.pathname])

  useEffect(() => {
    if (!authUser) {
      return
    }
    const intervalId = setInterval(() => {
      loadDashboard()
    }, 15000)
    return () => clearInterval(intervalId)
  }, [authUser])

  useEffect(() => {
    if (!profile) {
      return
    }
    if (isProfilePage && profileDirty) {
      return
    }

    setProfileForm({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      skillLevel: profile.skillLevel || '',
      sports: profile.sports ? profile.sports.map((sport) => sport._id) : [],
      photoBase64: profile.photoBase64 || '',
    })
    setProfileDirty(false)
  }, [profile, isProfilePage, profileDirty])

  useEffect(() => {
    if (!manualForm.locationId) return
    const stillValid = filteredLocations.some((loc) => loc._id === manualForm.locationId)
    if (!stillValid) {
      setManualForm((prev) => ({ ...prev, locationId: '' }))
    }
  }, [manualForm.locationId, filteredLocations])

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
    setProfile(null)
    setSessions([])
    setMySessions([])
    setSports([])
    setLocations([])
    setSelectedSessionId('')
    setChatMessages([])
    setChatDraft('')
    setNotice('')
    setErrorMessage('')
    setMatchSuggestion(null)
    setManualForm({
      name: '',
      sportId: '',
      scheduledAt: '',
      locationId: '',
      desiredPlayerLevels: [],
      autoJoin: true,
    })
    setProfileForm({
      displayName: '',
      bio: '',
      skillLevel: '',
      sports: [],
      photoBase64: '',
    })
    setAuthForm({ email: '', password: '', displayName: '' })
    localStorage.clear()
    sessionStorage.clear()
    await signOut(auth)
  }

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileChange = (field, value) => {
    setProfileDirty(true)
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
        desiredPlayerLevels: [...current],
      }
    })
  }

  const toggleSport = (sportId) => {
    setProfileDirty(true)
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
      let payload = { ...profileForm }
      const missingSkillLevel = !String(profileForm.skillLevel || '').trim()
      const missingSports = !Array.isArray(profileForm.sports) || profileForm.sports.length === 0
      const hasBio = String(profileForm.bio || '').trim().length > 0

      if ((missingSkillLevel || missingSports) && hasBio) {
        const useAi = window.confirm(
          'You did not fully select level/sports. Do you want AI suggestions before saving?',
        )

        if (useAi) {
          try {
            const aiData = await apiFetch('/api/users/me/ai-suggestions', {
              method: 'POST',
              body: { bio: profileForm.bio },
            })

            const aiSkill = aiData?.skillLevel || ''
            const aiSports = Array.isArray(aiData?.sports) ? aiData.sports : []
            const confirmApply = window.confirm(
              `AI suggests level: ${aiSkill || 'not detected'} and ${aiSports.length} sport(s). Apply these suggestions?`,
            )

            if (confirmApply) {
              payload = {
                ...payload,
                skillLevel: missingSkillLevel ? aiSkill || payload.skillLevel : payload.skillLevel,
                sports: missingSports ? (aiSports.length ? aiSports : payload.sports) : payload.sports,
              }
              setProfileForm((prev) => ({
                ...prev,
                skillLevel: payload.skillLevel,
                sports: payload.sports,
              }))
            }
          } catch (aiError) {
            setErrorMessage(`AI suggestion failed: ${aiError.message}`)
          }
        }
      }

      const updated = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: payload,
      })
      setProfile(updated)
      setProfileDirty(false)
      setNotice('Profile updated!')
      showScreenAlert('Profile updated successfully.')
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
        setProfileDirty(true)
        setProfileForm((prev) => ({
          ...prev,
          photoBase64: reader.result,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoClear = () => {
    setProfileDirty(true)
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
      await apiFetch('/api/match', { method: 'POST' })
      await loadDashboard()
      const suggestion = await apiFetch('/api/match/suggest')
      const suggestedSession = suggestion?.session

      if (!suggestedSession) {
        setNotice('No available upcoming session found right now.')
        return
      }
      setMatchSuggestion(suggestedSession)
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
        name: manualForm.name || '',
        sportId: manualForm.sportId,
        scheduledAt: manualForm.scheduledAt || undefined,
        locationId: manualForm.locationId || undefined,
        desiredPlayerLevels: manualForm.desiredPlayerLevels || [],
      }
      const created = await apiFetch('/api/sessions', {
        method: 'POST',
        body: payload,
      })
      setSessions((prev) => [created, ...prev])
      setMySessions((prev) => [created, ...prev])
      setManualForm({
        name: '',
        sportId: '',
        scheduledAt: '',
        locationId: '',
        desiredPlayerLevels: [],
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
      showScreenAlert('You joined the session.')
      await loadDashboard()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!sessionId) {
      return
    }

    setLoading((prev) => ({ ...prev, session: true }))
    setErrorMessage('')

    try {
      await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      setSessions((prev) => prev.filter((session) => session._id !== sessionId))
      setMySessions((prev) => prev.filter((session) => session._id !== sessionId))
      if (selectedSessionId === sessionId) {
        setSelectedSessionId('')
        setChatMessages([])
      }
      setNotice('Session deleted.')
      showScreenAlert('Session deleted.')
      await loadDashboard()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleBroadcastInvite = async (sessionId) => {
    if (!sessionId) return
    setLoading((prev) => ({ ...prev, session: true }))
    setErrorMessage('')
    try {
      const data = await apiFetch(`/api/sessions/${sessionId}/broadcast-invite`, {
        method: 'POST',
      })
      setNotice(`Broadcast sent to ${data.invitedCount || 0} users.`)
      showScreenAlert(`Broadcast sent to ${data.invitedCount || 0} users.`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleInviteResponse = async (inviteId, action) => {
    setLoading((prev) => ({ ...prev, session: true }))
    setErrorMessage('')
    try {
      await apiFetch(`/api/users/me/invites/${inviteId}/respond`, {
        method: 'POST',
        body: { action },
      })
      setInvites((prev) => prev.filter((invite) => invite._id !== inviteId))
      if (action === 'accept') {
        setNotice('Invite accepted.')
        showScreenAlert('Invite accepted.')
      } else {
        setNotice('Invite refused.')
        showScreenAlert('Invite refused.')
      }
      await loadDashboard()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleAutoDetectProfile = async () => {
    setLoading((prev) => ({ ...prev, profile: true }))
    setErrorMessage('')

    try {
      const data = await apiFetch('/api/users/me/ai-suggestions', {
        method: 'POST',
        body: { bio: profileForm.bio },
      })

      setProfileForm((prev) => ({
        ...prev,
        skillLevel: data.skillLevel || prev.skillLevel,
        sports: data.sports?.length ? data.sports : prev.sports,
      }))
      setNotice('AI suggestions applied from profile description.')
      showScreenAlert('AI suggestions applied.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }))
    }
  }

  const handleLeaveSession = async (sessionId) => {
    if (!sessionId) {
      return
    }
    setLoading((prev) => ({ ...prev, session: true }))
    setErrorMessage('')

    try {
      await apiFetch(`/api/sessions/${sessionId}/leave`, { method: 'POST' })
      if (selectedSessionId === sessionId) {
        setSelectedSessionId('')
        setChatMessages([])
      }
      setNotice('You left the session.')
      showScreenAlert('You left the session.')
      await loadDashboard()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading((prev) => ({ ...prev, session: false }))
    }
  }

  const handleOpenSessionChat = (sessionId) => {
    if (!sessionId) return
    setSelectedSessionId(sessionId)
    navigate('/chat')
  }

  const handleOpenSessionDetails = (sessionId) => {
    if (!sessionId) return
    navigate(`/sessions/${sessionId}`)
  }

  const handleConfirmMatchJoin = async () => {
    if (!matchSuggestion?._id) return
    await handleJoinSession(matchSuggestion._id)
    setMatchSuggestion(null)
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
      showScreenAlert('Location added.')
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
                  invites={invites}
                  onInviteResponse={handleInviteResponse}
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
                  onAutoDetectProfile={handleAutoDetectProfile}
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
                  isAdmin={isAdmin}
                  onJoinSession={handleJoinSession}
                  onLeaveSession={handleLeaveSession}
                  onDeleteSession={handleDeleteSession}
                  onBroadcastInvite={handleBroadcastInvite}
                  onOpenSessionChat={handleOpenSessionChat}
                  onOpenSessionDetails={handleOpenSessionDetails}
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
                  filteredLocations={filteredLocations}
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
            path="/sessions/:sessionId"
            element={
              <RequireAuth authReady={authReady} authUser={authUser}>
                <SessionDetailsPage formatSessionTime={formatSessionTime} />
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
                  sessions={upcomingChatSessions}
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

      {matchSuggestion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Join Suggested Session?</h3>
            <p className="mt-2 text-sm text-slate-600">
              {matchSuggestion.name || matchSuggestion.sport?.name} at{' '}
              {matchSuggestion.location?.name || 'Location TBD'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Players:{' '}
              {(matchSuggestion.participants || [])
                .map((p) => p.displayName || p.email)
                .join(', ') || 'No players yet'}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={handleConfirmMatchJoin}
              >
                Join Now
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setMatchSuggestion(null)}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {screenAlert && (
        <div className="fixed left-1/2 top-6 z-50 w-[min(92vw,560px)] -translate-x-1/2">
          <div
            className={`rounded-2xl border px-5 py-4 shadow-2xl ${
              screenAlert.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            <p className="text-sm font-semibold">{screenAlert.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
