// Approximate district centers from MapTiler Geocoding (© MapTiler).
// These are starting points for a report pin, not precise issue locations.
const DISTRICT_CENTERS: Record<string, Record<string, [number, number]>> = {
  'Phnom Penh': {
    'Daun Penh': [11.57727, 104.91943],
    Chamkarmon: [11.54954, 104.91844],
    'Tuol Kork': [11.57387, 104.89969],
    'Sen Sok': [11.57399, 104.85297],
    'Prampir Meakkakra': [11.56376, 104.91067],
    'Chbar Ampov': [11.52291, 104.96689],
    'Mean Chey': [11.53151, 104.89847],
    'Russey Keo': [11.62879, 104.90376],
  },
  'Siem Reap': {
    'Siem Reap City': [13.38505, 103.85227],
    'Svay Dangkum': [13.3629, 103.84139],
    'Sala Kamreuk': [13.34456, 103.86497],
    'Prasat Bakong': [13.34215, 103.99784],
    'Banteay Srei': [13.59266, 104.01147],
  },
  Battambang: {
    'Battambang Municipality': [13.10203, 103.19976],
    'Svay Pao': [13.09343, 103.19679],
    Sangkae: [13.07446, 103.24387],
    'Moung Ruessei': [12.83005, 103.5219],
    Banan: [12.9366, 103.13831],
  },
  Kampot: {
    'Kampong Bay': [10.60991, 104.18102],
    'Tuek Chhou': [10.68625, 104.23799],
    'Kampong Trach': [10.55719, 104.4679],
    Chhuk: [10.83597, 104.45481],
  },
  'Preah Sihanouk': {
    Mittapheap: [10.62205, 103.52234],
    'Preah Sihanouk City': [10.62205, 103.52234],
    'Prey Nob': [10.6524, 103.79583],
    'Stueng Hav': [10.79756, 103.70373],
  },
  Kandal: {
    Takhmao: [11.46761, 104.94605],
    'Kien Svay': [11.50998, 105.04999],
    'Ang Snuol': [11.50783, 104.71578],
    'Muk Kampool': [11.72978, 104.9664],
  },
  'Banteay Meanchey': {
    'Serei Saophoan': [13.61417, 102.96563],
    Poipet: [13.6594, 102.57083],
    'Mongkol Borei': [13.45821, 102.98796],
  },
  'Kampong Cham': {
    'Kampong Cham City': [11.99219, 105.46283],
    Batheay: [11.99311, 104.94578],
    'Chamkar Leu': [12.269, 105.2871],
  },
}

export function getDistrictCenter(province: string, district: string): [number, number] | undefined {
  return DISTRICT_CENTERS[province]?.[district]
}
