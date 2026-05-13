import type { AssetKey } from '../types'

export const ASSET_LABELS: Record<AssetKey, string> = {
  macbook: 'MacBook / Mac',
  iphone: 'iPhone',
  ipad: 'iPad',
  windows: 'Windows PC',
  android: 'Android Phone',
  'apple-tv': 'Apple TV / Smart TV',
  kindle: 'Kindle',
  airpods: 'AirPods',
  'apple-one': 'Apple One / iCloud+',
  spotify: 'Spotify Premium',
  'amazon-prime': 'Amazon Prime',
  netflix: 'Netflix',
  'adobe-cc': 'Adobe Creative Cloud',
  microsoft365: 'Microsoft 365',
  'google-one': 'Google One',
  'linkedin-premium': 'LinkedIn Premium',
  'notion-pro': 'Notion Pro',
  figma: 'Figma',
  'canva-pro': 'Canva Pro',
  'chatgpt-plus': 'ChatGPT Plus',
  'claude-pro': 'Claude Pro',
  'youtube-premium': 'YouTube Premium',
  student: 'Student',
  'government-employee': 'Government Employee',
  military: 'Military / Veteran',
  senior: 'Senior (60+)',
  teacher: 'Teacher / Educator',
  freelancer: 'Freelancer / Self-Employed',
  'small-business': 'Small Business Owner',
  'credit-card-basic': 'Credit Card (Basic)',
  'credit-card-premium': 'Credit Card (Premium / Metal)',
  'health-insurance': 'Health Insurance',
  'bank-account': 'Active Bank Account',
  'library-card': 'Public Library Card',
  github: 'GitHub Account',
  'google-account': 'Google Account',
  university: 'University / College Access',
}

export interface ChipSection {
  title: string
  keys: AssetKey[]
}

export const CHIP_SECTIONS: ChipSection[] = [
  {
    title: 'Devices',
    keys: [
      'macbook',
      'iphone',
      'ipad',
      'windows',
      'android',
      'apple-tv',
      'kindle',
      'airpods',
    ],
  },
  {
    title: 'Subscriptions',
    keys: [
      'apple-one',
      'spotify',
      'amazon-prime',
      'netflix',
      'adobe-cc',
      'microsoft365',
      'google-one',
      'linkedin-premium',
      'notion-pro',
      'figma',
      'canva-pro',
      'chatgpt-plus',
      'claude-pro',
      'youtube-premium',
    ],
  },
  {
    title: 'Status / Identity',
    keys: [
      'student',
      'government-employee',
      'military',
      'senior',
      'teacher',
      'freelancer',
      'small-business',
    ],
  },
  {
    title: 'Financial Access',
    keys: [
      'credit-card-basic',
      'credit-card-premium',
      'health-insurance',
      'bank-account',
    ],
  },
  {
    title: 'Other Access',
    keys: ['library-card', 'github', 'google-account', 'university'],
  },
]
