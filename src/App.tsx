import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { categories, cardTypes, cards, groupSets } from '@/data/seed'
import { cn } from '@/lib/utils'

const languageOptions = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
]

const uiText = {
  es: {
    tagline: 'Baraja. Revela. Juega.',
    description:
      'Elige un color para sacar un desafio y toca la carta para ver la respuesta. Usa grupos e idioma para armar rondas tematicas.',
    languageLabel: 'Idioma',
    groupsLabel: 'Grupos',
    setsLabel: 'Sets',
    avoidRepeats: 'No repetir en la partida',
    tapToDraw: 'Toca para sacar',
    cardsAvailable: 'cartas disponibles',
    drawAnother: 'Sacar otra',
    tapToFlip: 'Toca para voltear',
    answer: 'Respuesta',
    tapToReturn: 'Toca para volver',
    noCards:
      'No hay cartas para esta seleccion. Quita grupos o cambia el idioma.',
    allPlay: 'Todos juegan',
    clearGroups: 'Limpiar',
    noAnswer: 'Respuesta pendiente',
  },
  en: {
    tagline: 'Shuffle. Reveal. Play.',
    description:
      'Pick a color to draw a challenge, then flip the card to reveal the answer. Use groups and language to build themed rounds.',
    languageLabel: 'Language',
    groupsLabel: 'Groups',
    setsLabel: 'Sets',
    avoidRepeats: 'Avoid repeats this round',
    tapToDraw: 'Tap to draw',
    cardsAvailable: 'cards available',
    drawAnother: 'Draw another',
    tapToFlip: 'Tap to flip',
    answer: 'Answer',
    tapToReturn: 'Tap to return',
    noCards:
      'No cards match this selection yet. Try removing groups or switch the language.',
    allPlay: 'All play',
    clearGroups: 'Clear',
    noAnswer: 'Pending answer',
  },
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [language, setLanguage] = useState('es')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [avoidRepeats, setAvoidRepeats] = useState(true)
  const [usedCardIds, setUsedCardIds] = useState<string[]>([])
  const shuffleTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (shuffleTimer.current) {
        window.clearTimeout(shuffleTimer.current)
      }
    }
  }, [])

  const groupOptions = useMemo(() => {
    const set = new Set<string>()
    cards.forEach((card) => {
      card.groups.forEach((group) => set.add(group))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [])

  const getCardsForCategory = (categoryId: string) => {
    const typeIds = cardTypes
      .filter((type) => type.categoryId === categoryId)
      .map((type) => type.id)
    return cards.filter((card) => {
      if (!typeIds.includes(card.typeId)) return false
      if (selectedGroups.length > 0) {
        if (!selectedGroups.every((group) => card.groups.includes(group))) {
          return false
        }
      }
      return Boolean(card.content?.[language as keyof typeof card.content])
    })
  }

  const filteredCards = useMemo(() => {
    let pool = cards
    if (selectedCategory) {
      const typeIds = cardTypes
        .filter((type) => type.categoryId === selectedCategory)
        .map((type) => type.id)
      pool = pool.filter((card) => typeIds.includes(card.typeId))
    }
    if (selectedGroups.length > 0) {
      pool = pool.filter((card) =>
        selectedGroups.every((group) => card.groups.includes(group)),
      )
    }
    pool = pool.filter((card) => Boolean(card.content?.[language as keyof typeof card.content]))
    return pool
  }, [selectedCategory, selectedGroups, language])

  const availableCards = useMemo(() => {
    const pool = selectedCategory
      ? getCardsForCategory(selectedCategory)
      : filteredCards
    if (!avoidRepeats) return pool
    return pool.filter((card) => !usedCardIds.includes(card.id))
  }, [selectedCategory, filteredCards, avoidRepeats, usedCardIds])

  const activeCard = useMemo(() => {
    return cards.find((card) => card.id === activeCardId) ?? null
  }, [activeCardId])

  const activeType = useMemo(() => {
    if (!activeCard) return null
    return cardTypes.find((type) => type.id === activeCard.typeId) ?? null
  }, [activeCard])

  const activeContent = activeCard?.content?.[language as keyof typeof activeCard.content]
  const activeCategory = categories.find((c) => c.id === selectedCategory)
  const activeCategoryLabel =
    activeCategory?.name?.[language as keyof typeof activeCategory.name] ?? activeCategory?.name?.es ?? selectedCategory
  const activeCategoryColor = activeCategory
    ? `hsl(var(--${activeCategory.id}))`
    : 'hsl(var(--blue))'

  const handleShuffle = (categoryId: string) => {
    if (shuffleTimer.current) {
      window.clearTimeout(shuffleTimer.current)
    }
    setSelectedCategory(categoryId)
    setIsFlipped(false)
    setIsShuffling(true)
    shuffleTimer.current = window.setTimeout(() => {
      const pool = getCardsForCategory(categoryId)
      if (pool.length === 0) {
        setActiveCardId(null)
        setIsShuffling(false)
        return
      }
      let availablePool = pool
      if (avoidRepeats) {
        availablePool = pool.filter((card) => !usedCardIds.includes(card.id))
        if (availablePool.length === 0) {
          setUsedCardIds([])
          availablePool = pool
        }
      }
      const nextCard =
        availablePool[Math.floor(Math.random() * availablePool.length)]
      setActiveCardId(nextCard?.id ?? null)
      if (nextCard && avoidRepeats) {
        setUsedCardIds((prev) =>
          prev.includes(nextCard.id) ? prev : [...prev, nextCard.id],
        )
      }
      setIsShuffling(false)
    }, 720)
  }

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((item) => item !== group) : [...prev, group],
    )
  }

  const applyPreset = (groups: string[]) => {
    setSelectedGroups(groups)
  }

  const ui = uiText[language as 'es' | 'en'] ?? uiText.es

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(238,236,225,0.85),rgba(225,228,235,0.9))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-[hsl(var(--blue))] opacity-20 blur-3xl" />
        <div className="absolute right-12 top-32 h-64 w-64 rounded-full bg-[hsl(var(--red))] opacity-20 blur-3xl" />
        <div className="absolute bottom-8 left-24 h-72 w-72 rounded-full bg-[hsl(var(--green))] opacity-20 blur-3xl" />
        <div className="absolute bottom-12 right-20 h-60 w-60 rounded-full bg-[hsl(var(--yellow))] opacity-20 blur-3xl" />
        <div className="absolute left-1/2 top-24 h-32 w-32 -translate-x-1/2 rotate-12 rounded-3xl border border-white/60 bg-white/30 shadow-lg backdrop-blur" />
        <div className="absolute right-10 bottom-24 h-24 w-24 -rotate-12 rounded-full border border-white/40 bg-white/40 shadow-lg backdrop-blur" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-4 pt-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            cr-app tribute
          </p>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            {ui.tagline}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            {ui.description}
          </p>
        </div>

        <div className="card-surface w-full max-w-xl space-y-4 p-4 md:w-[360px]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {ui.languageLabel}
            </p>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full bg-white/90">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {ui.groupsLabel}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {ui.setsLabel}
              </p>
              <Button
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={() => setSelectedGroups([])}
              >
                {ui.clearGroups}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupSets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => applyPreset(preset.groups)}
                >
                  {preset.label[language as 'es' | 'en'] ?? preset.label.es}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {groupOptions.map((group) => (
                <Button
                  key={group}
                  variant={selectedGroups.includes(group) ? 'default' : 'secondary'}
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => toggleGroup(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">
                {ui.avoidRepeats}
              </span>
              <Switch checked={avoidRepeats} onCheckedChange={setAvoidRepeats} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-10">
        <div className="grid min-h-[60vh] grid-cols-2 grid-rows-2 gap-4 md:min-h-[50vh]">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id
            const label = category.name[language as keyof typeof category.name] ?? category.name.es ?? category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleShuffle(category.id)}
                className={cn(
                  'group relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-3xl text-left transition duration-300',
                  isActive ? 'ring-4 ring-white/70' : 'ring-1 ring-white/40',
                )}
                style={{ backgroundColor: `hsl(var(--${category.id}))` }}
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-white/10" />
                  <div className="absolute -left-6 -top-8 h-24 w-24 rounded-full bg-white/25 blur-xl" />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
                <div className="relative z-10 text-center">
                  <p className="panel-title">{label}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">
                    {ui.tapToDraw}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-muted-foreground/40">
              {availableCards.length} {ui.cardsAvailable}
            </Badge>
            {selectedGroups.length > 0 && (
              <span>{selectedGroups.join(', ')}</span>
            )}
          </div>
          {selectedCategory && (
            <Button variant="outline" onClick={() => handleShuffle(selectedCategory)}>
              {ui.drawAnother}
            </Button>
          )}
        </div>
      </main>

      {selectedCategory && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-6 py-10">
          <div className="pointer-events-auto w-full max-w-md">
            {isShuffling ? (
              <div className="relative mx-auto h-[360px] w-[260px]">
                {[0, 1, 2].map((index) => (
                  <div
                    key={`shuffle-${index}`}
                    className={cn(
                      'absolute left-1/2 top-1/2 h-[320px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur',
                      index === 0 && 'shuffle-card',
                      index === 1 && 'shuffle-card shuffle-delay-150',
                      index === 2 && 'shuffle-card shuffle-delay-300',
                    )}
                  />
                ))}
              </div>
            ) : activeCard && activeContent ? (
              <div className="relative mx-auto w-[280px] [perspective:1200px] md:w-[320px]">
                <div
                  className="grid transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className="card-surface card-pop col-start-1 row-start-1 flex flex-col gap-4 p-6"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {activeType?.name?.[language as keyof typeof activeType.name] ?? activeType?.name?.es}
                        </p>
                        <h2 className="font-display text-lg font-semibold">
                          {activeCategoryLabel}
                        </h2>
                      </div>
                      {activeType?.mode === 'all-play' && (
                        <Badge className="bg-black/80 text-white">{ui.allPlay}</Badge>
                      )}
                    </div>
                    <div
                      className="h-1 w-full rounded-full"
                      style={{ backgroundColor: activeCategoryColor }}
                    />
                    <Separator />
                    <div className="rounded-2xl bg-muted/70 p-3 text-xs text-muted-foreground">
                      {activeType?.activity?.[language as keyof typeof activeType.activity] ?? activeType?.activity?.es}
                    </div>
                    <div className="space-y-3 text-sm">
                      {activeContent.blocks.map((block: any, index: number) => (
                        <div key={`${block.label}-${index}`} className="space-y-1">
                          {block.label && (
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                              {block.label}
                            </p>
                          )}
                          {block.text && <p className="text-base">{block.text}</p>}
                          {block.list && (
                            <ul className="space-y-1">
                              {block.list.map((item: string) => (
                                <li key={item} className="text-sm">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <span>{activeCard.createdAt}</span>
                      <span className="uppercase tracking-[0.3em]">
                        {ui.tapToFlip}
                      </span>
                    </div>
                  </div>
                  <div
                    className="card-surface col-start-1 row-start-1 flex flex-col justify-between gap-4 p-6"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        {ui.answer}
                      </p>
                      <p className="font-display text-2xl font-semibold">
                        {activeContent.answer ?? ui.noAnswer}
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="uppercase tracking-[0.3em]">{ui.tapToReturn}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => setIsFlipped((prev) => !prev)}
                />
              </div>
            ) : (
              <div className="card-surface p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {ui.noCards}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
