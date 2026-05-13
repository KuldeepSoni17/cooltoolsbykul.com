export type AssetKey =
  | 'macbook'
  | 'iphone'
  | 'ipad'
  | 'windows'
  | 'android'
  | 'apple-tv'
  | 'kindle'
  | 'airpods'
  | 'apple-one'
  | 'spotify'
  | 'amazon-prime'
  | 'netflix'
  | 'adobe-cc'
  | 'microsoft365'
  | 'google-one'
  | 'linkedin-premium'
  | 'notion-pro'
  | 'figma'
  | 'canva-pro'
  | 'chatgpt-plus'
  | 'claude-pro'
  | 'youtube-premium'
  | 'student'
  | 'government-employee'
  | 'military'
  | 'senior'
  | 'teacher'
  | 'freelancer'
  | 'small-business'
  | 'credit-card-basic'
  | 'credit-card-premium'
  | 'health-insurance'
  | 'bank-account'
  | 'library-card'
  | 'github'
  | 'google-account'
  | 'university'

export type Category =
  | 'productivity'
  | 'money'
  | 'health'
  | 'creative'
  | 'learning'
  | 'privacy'
  | 'fun'

export type HubKey =
  | 'macbook'
  | 'iphone'
  | 'spotify'
  | 'amazon-prime'
  | 'credit-card'
  | 'student'
  | 'library'
  | 'microsoft365'
  | 'google'

export type Tier = 'quick-win' | 'unlockable' | 'deep-dive'

export type TimeToUnlock = '2min' | '15min' | '1hr' | 'ongoing'

export interface Opportunity {
  id: string
  title: string
  one_liner: string
  full_description: string
  why_missed: string
  unlock_steps: string[]
  requires: AssetKey[]
  impact_score: number
  tier: Tier
  time_to_unlock: TimeToUnlock
  categories: Category[]
  money_saved_monthly?: number
  time_saved?: string
  difficulty: 'zero' | 'easy' | 'moderate'
  verified_date: string
  sources: string[]
  hub: HubKey
}

export type FeedTierFilter = 'all' | Tier
export type FeedCategoryFilter = 'all' | Category
export type FeedSort = 'impact' | 'time' | 'money'
