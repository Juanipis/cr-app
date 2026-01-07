import store from './store.json'
import type { Card, CardCategory, CardType, GroupSet } from './schema'

export const categories = store.categories as CardCategory[]
export const cardTypes = store.cardTypes as CardType[]
export const cards = store.cards as Card[]
export const groupSets = (store.groupSets ?? []) as GroupSet[]
