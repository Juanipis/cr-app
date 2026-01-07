#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const STORE_PATH = path.resolve(process.cwd(), 'src/data/store.json')

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    fail(`Store not found at ${STORE_PATH}`)
  }
  const store = readJson(STORE_PATH)
  store.categories = store.categories || []
  store.cardTypes = store.cardTypes || []
  store.cards = store.cards || []
  return store
}

function saveStore(store) {
  writeJson(STORE_PATH, store)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function parseArgs(args) {
  const parsed = { _: [] }
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (!next || next.startsWith('--')) {
        parsed[key] = true
      } else {
        if (parsed[key]) {
          parsed[key] = Array.isArray(parsed[key])
            ? [...parsed[key], next]
            : [parsed[key], next]
        } else {
          parsed[key] = next
        }
        i += 1
      }
    } else {
      parsed._.push(arg)
    }
  }
  return parsed
}

function output(data, asJson) {
  if (asJson) {
    console.log(JSON.stringify(data, null, 2))
    return
  }
  if (Array.isArray(data)) {
    data.forEach((item) => console.log(item))
    return
  }
  console.log(data)
}

function ensureArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getTypeById(store, id) {
  return store.cardTypes.find((type) => type.id === id)
}

function getCategoryById(store, id) {
  return store.categories.find((category) => category.id === id)
}

function listCards(store, options) {
  let cards = store.cards
  const groupFilters = ensureArray(options.group)
  if (options.type) {
    cards = cards.filter((card) => card.typeId === options.type)
  }
  if (options.category) {
    const types = store.cardTypes
      .filter((type) => type.categoryId === options.category)
      .map((type) => type.id)
    cards = cards.filter((card) => types.includes(card.typeId))
  }
  if (groupFilters.length > 0) {
    cards = cards.filter((card) =>
      groupFilters.every((group) => card.groups.includes(group))
    )
  }
  if (options.language) {
    cards = cards.filter((card) => card.languages.includes(options.language))
  }
  if (options['missing-language']) {
    const lang = options['missing-language']
    cards = cards.filter((card) => !card.content?.[lang])
  }
  return cards
}

function formatCardSummary(card) {
  return [
    card.id,
    `type=${card.typeId}`,
    `groups=${card.groups.join(',') || 'none'}`,
    `langs=${card.languages.join(',') || 'none'}`,
    `createdAt=${card.createdAt}`,
  ].join(' | ')
}

function listCardTypes(store) {
  return store.cardTypes.map((type) =>
    [
      type.id,
      `category=${type.categoryId}`,
      `mode=${type.mode}`,
      `name=${type.name?.es || ''}`,
    ].join(' | ')
  )
}

function listCategories(store) {
  return store.categories.map((category) =>
    [category.id, `color=${category.colorHex}`].join(' | ')
  )
}

function validateCard(card, store) {
  if (!card.id) fail('Card must include id.')
  if (!card.typeId) fail('Card must include typeId.')
  if (!getTypeById(store, card.typeId)) {
    fail(`Unknown typeId: ${card.typeId}`)
  }
  if (!Array.isArray(card.groups)) fail('Card groups must be an array.')
  if (!Array.isArray(card.languages)) fail('Card languages must be an array.')
  if (!card.createdAt) fail('Card must include createdAt (YYYY-MM-DD).')
  if (!card.content || typeof card.content !== 'object') {
    fail('Card content must be an object keyed by language.')
  }
}

function ensureCardDefaults(card) {
  if (!card.createdAt) {
    card.createdAt = todayIso()
  }
  if (!card.languages || card.languages.length === 0) {
    card.languages = Object.keys(card.content || {})
  }
  if (!card.groups) {
    card.groups = []
  }
}

function addCard(store, inputPath) {
  const card = readJson(inputPath)
  ensureCardDefaults(card)
  if (store.cards.find((item) => item.id === card.id)) {
    fail(`Card id already exists: ${card.id}`)
  }
  validateCard(card, store)
  store.cards.push(card)
  saveStore(store)
  return card
}

function updateCard(store, cardId, inputPath, merge) {
  const index = store.cards.findIndex((card) => card.id === cardId)
  if (index === -1) fail(`Card not found: ${cardId}`)
  const payload = readJson(inputPath)
  if (payload.id && payload.id !== cardId) {
    fail(`Payload id ${payload.id} does not match ${cardId}`)
  }
  let updated = payload
  if (merge) {
    const current = store.cards[index]
    updated = { ...current, ...payload }
    if (payload.content) {
      updated.content = { ...current.content, ...payload.content }
    }
    if (payload.languages) {
      updated.languages = payload.languages
    }
    if (payload.groups) {
      updated.groups = payload.groups
    }
  }
  ensureCardDefaults(updated)
  validateCard(updated, store)
  store.cards[index] = updated
  saveStore(store)
  return updated
}

function removeCard(store, cardId) {
  const next = store.cards.filter((card) => card.id !== cardId)
  if (next.length === store.cards.length) {
    fail(`Card not found: ${cardId}`)
  }
  store.cards = next
  saveStore(store)
}

function validateType(type, store) {
  if (!type.id) fail('Type must include id.')
  if (!type.categoryId) fail('Type must include categoryId.')
  if (!getCategoryById(store, type.categoryId)) {
    fail(`Unknown categoryId: ${type.categoryId}`)
  }
  if (!type.mode) fail('Type must include mode (team|all-play).')
}

function addType(store, inputPath) {
  const type = readJson(inputPath)
  if (store.cardTypes.find((item) => item.id === type.id)) {
    fail(`Type id already exists: ${type.id}`)
  }
  validateType(type, store)
  store.cardTypes.push(type)
  saveStore(store)
  return type
}

function updateType(store, typeId, inputPath, merge) {
  const index = store.cardTypes.findIndex((type) => type.id === typeId)
  if (index === -1) fail(`Type not found: ${typeId}`)
  const payload = readJson(inputPath)
  if (payload.id && payload.id !== typeId) {
    fail(`Payload id ${payload.id} does not match ${typeId}`)
  }
  let updated = payload
  if (merge) {
    const current = store.cardTypes[index]
    updated = { ...current, ...payload }
    if (payload.name) updated.name = { ...current.name, ...payload.name }
    if (payload.activity) {
      updated.activity = { ...current.activity, ...payload.activity }
    }
  }
  validateType(updated, store)
  store.cardTypes[index] = updated
  saveStore(store)
  return updated
}

function removeType(store, typeId) {
  if (store.cards.some((card) => card.typeId === typeId)) {
    fail(`Type ${typeId} is still used by cards.`)
  }
  const next = store.cardTypes.filter((type) => type.id !== typeId)
  if (next.length === store.cardTypes.length) {
    fail(`Type not found: ${typeId}`)
  }
  store.cardTypes = next
  saveStore(store)
}

function addCategory(store, inputPath) {
  const category = readJson(inputPath)
  if (!category.id) fail('Category must include id.')
  if (!category.colorHex) fail('Category must include colorHex.')
  if (store.categories.find((item) => item.id === category.id)) {
    fail(`Category id already exists: ${category.id}`)
  }
  store.categories.push(category)
  saveStore(store)
  return category
}

function updateCategory(store, categoryId, inputPath, merge) {
  const index = store.categories.findIndex((category) => category.id === categoryId)
  if (index === -1) fail(`Category not found: ${categoryId}`)
  const payload = readJson(inputPath)
  if (payload.id && payload.id !== categoryId) {
    fail(`Payload id ${payload.id} does not match ${categoryId}`)
  }
  let updated = payload
  if (merge) {
    const current = store.categories[index]
    updated = { ...current, ...payload }
    if (payload.name) updated.name = { ...current.name, ...payload.name }
  }
  if (!updated.id) fail('Category must include id.')
  if (!updated.colorHex) fail('Category must include colorHex.')
  store.categories[index] = updated
  saveStore(store)
  return updated
}

function removeCategory(store, categoryId) {
  if (store.cardTypes.some((type) => type.categoryId === categoryId)) {
    fail(`Category ${categoryId} is still used by card types.`)
  }
  const next = store.categories.filter((category) => category.id !== categoryId)
  if (next.length === store.categories.length) {
    fail(`Category not found: ${categoryId}`)
  }
  store.categories = next
  saveStore(store)
}

function showHelp() {
  console.log(`\nCards CLI\n\nCommands:\n  cards list [--category id] [--type id] [--group tag] [--language code] [--missing-language code] [--json]\n  cards add --input path\n  cards update --id id --input path [--merge]\n  cards remove --id id\n  cards missing --language code [--json]\n\n  types list [--json]\n  types add --input path\n  types update --id id --input path [--merge]\n  types remove --id id\n\n  categories list [--json]\n  categories add --input path\n  categories update --id id --input path [--merge]\n  categories remove --id id\n\nStore:\n  ${STORE_PATH}\n`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const [command, subcommand] = args._

  if (!command) {
    showHelp()
    return
  }

  const store = loadStore()

  if (command === 'cards') {
    if (subcommand === 'list') {
      const cards = listCards(store, args)
      const payload = args.json ? cards : cards.map(formatCardSummary)
      output(payload, args.json)
      return
    }
    if (subcommand === 'missing') {
      if (!args.language) fail('cards missing requires --language')
      const cards = listCards(store, { 'missing-language': args.language })
      const payload = args.json ? cards : cards.map(formatCardSummary)
      output(payload, args.json)
      return
    }
    if (subcommand === 'add') {
      if (!args.input) fail('cards add requires --input')
      const card = addCard(store, args.input)
      output(card, args.json)
      return
    }
    if (subcommand === 'update') {
      if (!args.id || !args.input) fail('cards update requires --id and --input')
      const card = updateCard(store, args.id, args.input, args.merge)
      output(card, args.json)
      return
    }
    if (subcommand === 'remove') {
      if (!args.id) fail('cards remove requires --id')
      removeCard(store, args.id)
      output(`Removed ${args.id}`)
      return
    }
  }

  if (command === 'types') {
    if (subcommand === 'list') {
      const payload = args.json ? store.cardTypes : listCardTypes(store)
      output(payload, args.json)
      return
    }
    if (subcommand === 'add') {
      if (!args.input) fail('types add requires --input')
      const type = addType(store, args.input)
      output(type, args.json)
      return
    }
    if (subcommand === 'update') {
      if (!args.id || !args.input) fail('types update requires --id and --input')
      const type = updateType(store, args.id, args.input, args.merge)
      output(type, args.json)
      return
    }
    if (subcommand === 'remove') {
      if (!args.id) fail('types remove requires --id')
      removeType(store, args.id)
      output(`Removed ${args.id}`)
      return
    }
  }

  if (command === 'categories') {
    if (subcommand === 'list') {
      const payload = args.json ? store.categories : listCategories(store)
      output(payload, args.json)
      return
    }
    if (subcommand === 'add') {
      if (!args.input) fail('categories add requires --input')
      const category = addCategory(store, args.input)
      output(category, args.json)
      return
    }
    if (subcommand === 'update') {
      if (!args.id || !args.input) {
        fail('categories update requires --id and --input')
      }
      const category = updateCategory(store, args.id, args.input, args.merge)
      output(category, args.json)
      return
    }
    if (subcommand === 'remove') {
      if (!args.id) fail('categories remove requires --id')
      removeCategory(store, args.id)
      output(`Removed ${args.id}`)
      return
    }
  }

  showHelp()
}

main()
