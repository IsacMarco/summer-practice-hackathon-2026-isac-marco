import Sport from '../models/Sport.js'

const defaultSports = [
  { name: 'Football', minPlayers: 10, maxPlayers: 14 },
  { name: 'Basketball', minPlayers: 6, maxPlayers: 10 },
  { name: 'Volleyball', minPlayers: 6, maxPlayers: 10 },
  { name: 'Tennis', minPlayers: 2, maxPlayers: 4 },
]

export const seedSports = async () => {
  const count = await Sport.countDocuments()
  if (count > 0) {
    return
  }

  await Sport.insertMany(defaultSports)
}
