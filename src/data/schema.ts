export type LanguageCode = 'es' | 'en'

export type LocalizedString = Partial<Record<LanguageCode, string>>

export type CardMode = 'team' | 'all-play'

export interface CardCategory {
  id: string
  name: LocalizedString
  colorHex: string
}

export interface CardType {
  id: string
  categoryId: string
  name: LocalizedString
  activity: LocalizedString
  mode: CardMode
  legacyName?: string
}

export interface CardBlock {
  label?: string
  text?: string
  list?: string[]
}

export interface CardContent {
  blocks: CardBlock[]
  answer?: string
}

export interface Card {
  id: string
  typeId: string
  groups: string[]
  languages: LanguageCode[]
  createdAt: string
  content: Partial<Record<LanguageCode, CardContent>>
}
