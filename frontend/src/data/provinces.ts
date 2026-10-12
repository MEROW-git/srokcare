export interface DistrictOption {
  en: string
  km: string
}

export interface ProvinceData {
  en: string
  km: string
  defaultLat: number
  defaultLng: number
  districts: DistrictOption[]
}

export const CAMBODIA_PROVINCES: ProvinceData[] = [
  {
    en: 'Phnom Penh',
    km: 'ភ្នំពេញ',
    defaultLat: 11.5564,
    defaultLng: 104.9282,
    districts: [
      { en: 'Daun Penh', km: 'ដូនពេញ' },
      { en: 'Chamkarmon', km: 'ចំការមន' },
      { en: 'Tuol Kork', km: 'ទួលគោក' },
      { en: 'Sen Sok', km: 'សែនសុខ' },
      { en: 'Prampir Meakkakra', km: '៧មករា' },
      { en: 'Chbar Ampov', km: 'ច្បារអំពៅ' },
      { en: 'Mean Chey', km: 'មានជ័យ' },
      { en: 'Russey Keo', km: 'ឫស្សីកែវ' },
    ],
  },
  {
    en: 'Siem Reap',
    km: 'សៀមរាប',
    defaultLat: 13.3671,
    defaultLng: 103.8448,
    districts: [
      { en: 'Siem Reap City', km: 'ក្រុងសៀមរាប' },
      { en: 'Svay Dangkum', km: 'ស្វាយដង្គំ' },
      { en: 'Sala Kamreuk', km: 'សាលាកំរើក' },
      { en: 'Prasat Bakong', km: 'ប្រាសាទបាគង' },
      { en: 'Banteay Srei', km: 'បន្ទាយស្រី' },
    ],
  },
  {
    en: 'Battambang',
    km: 'បាត់ដំបង',
    defaultLat: 13.0957,
    defaultLng: 103.2022,
    districts: [
      { en: 'Battambang Municipality', km: 'ក្រុងបាត់ដំបង' },
      { en: 'Svay Pao', km: 'ស្វាយប៉ោ' },
      { en: 'Sangkae', km: 'សង្កែ' },
      { en: 'Moung Ruessei', km: 'មោងឫស្សី' },
      { en: 'Banan', km: 'បាណន់' },
    ],
  },
  {
    en: 'Kampot',
    km: 'កំពត',
    defaultLat: 10.6104,
    defaultLng: 104.1815,
    districts: [
      { en: 'Kampong Bay', km: 'កំពង់បាយ' },
      { en: 'Tuek Chhou', km: 'ទឹកឈូ' },
      { en: 'Kampong Trach', km: 'កំពង់ត្រាច' },
      { en: 'Chhuk', km: 'ឈូក' },
    ],
  },
  {
    en: 'Preah Sihanouk',
    km: 'ព្រះសីហនុ',
    defaultLat: 10.6275,
    defaultLng: 103.5221,
    districts: [
      { en: 'Mittapheap', km: 'មិត្តភាព' },
      { en: 'Preah Sihanouk City', km: 'ក្រុងព្រះសីហនុ' },
      { en: 'Prey Nob', km: 'ព្រៃនប់' },
      { en: 'Stueng Hav', km: 'ស្ទឹងហាវ' },
    ],
  },
  {
    en: 'Kandal',
    km: 'កណ្តាល',
    defaultLat: 11.4744,
    defaultLng: 104.9542,
    districts: [
      { en: 'Takhmao', km: 'តាខ្មៅ' },
      { en: 'Kien Svay', km: 'កៀនស្វាយ' },
      { en: 'Ang Snuol', km: 'អង្គស្នួល' },
      { en: 'Muk Kampool', km: 'មុខកំពូល' },
    ],
  },
  {
    en: 'Banteay Meanchey',
    km: 'បន្ទាយមានជ័យ',
    defaultLat: 13.5859,
    defaultLng: 102.9737,
    districts: [
      { en: 'Serei Saophoan', km: 'សិរីសោភ័ណ' },
      { en: 'Poipet', km: 'ប៉ោយប៉ែត' },
      { en: 'Mongkol Borei', km: 'មង្គលបូរី' },
    ],
  },
  {
    en: 'Kampong Cham',
    km: 'កំពង់ចាម',
    defaultLat: 11.9934,
    defaultLng: 105.4635,
    districts: [
      { en: 'Kampong Cham City', km: 'ក្រុងកំពង់ចាម' },
      { en: 'Batheay', km: 'បាធាយ' },
      { en: 'Chamkar Leu', km: 'ចំការលើ' },
    ],
  },
]
