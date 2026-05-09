export const getTodayKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getDefaultSessionTime = (date = new Date()) => {
  const sessionDate = new Date(date)
  sessionDate.setHours(18, 0, 0, 0)

  return sessionDate
}
