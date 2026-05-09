import Location from '../models/Location.js'

const defaultLocations = [
  {
    name: 'Riverfront Courts',
    address: 'Strada Splaiului 15',
    priceEstimate: '$$',
    lat: 44.4275,
    lng: 26.1025,
  },
  {
    name: 'Old Town Sports Hub',
    address: 'Bulevardul Unirii 21',
    priceEstimate: '$',
    lat: 44.4292,
    lng: 26.1048,
  },
  {
    name: 'Greenline Arena',
    address: 'Calea Victoriei 88',
    priceEstimate: '$$$',
    lat: 44.4364,
    lng: 26.0987,
  },
]

export const seedLocations = async () => {
  const count = await Location.countDocuments()
  if (count > 0) {
    return
  }

  await Location.insertMany(defaultLocations)
}
