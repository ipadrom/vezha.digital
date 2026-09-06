import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { caseBlockLayoutOptions, defaultCaseBlockLayouts, convertBlockToFreeform, type CaseBlock } from '../utils/caseBuilder.ts'

test('air is opt-in for the existing blocks and does not replace their defaults', () => {
  for (const kind of ['challenge_solution', 'results'] as const) assert.ok(caseBlockLayoutOptions[kind].some(option => option.value === 'air'))
  assert.equal(defaultCaseBlockLayouts.challenge_solution, 'narrative')
  assert.equal(defaultCaseBlockLayouts.results, 'statement')
})

test('the public renderer and inline editable canvas share the same air composition', () => {
  const publicView = readFileSync('components/case-builder/PublicCaseBuilder.vue', 'utf8')
  const canvas = readFileSync('components/admin/cases/CaseBlockCanvasCard.vue', 'utf8')
  const air = readFileSync('components/case-builder/CaseEditorialAir.vue', 'utf8')
  for (const source of [publicView, canvas]) assert.match(source, /<CaseEditorialAir v-else-if="block.settings.layout === 'air'/)
  assert.match(canvas, /#field="\{ path, value, label \}"/)
  assert.match(air, /case-air__benefits/)
  assert.match(air, /repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(air, /@container case-air \(max-width: 440px\)/)
  assert.doesNotMatch(air, /padStart|font-mono|v-html/)
})

test('freeform conversion keeps outcome titles, descriptions and inline introductions', () => {
  const results = { type: 'results', settings: { layout: 'air' }, content_ru: { items: [{ title: 'Итог', text: 'Пояснение' }] }, content_en: { items: [{ title: 'Outcome', text: 'Explanation' }] } } as CaseBlock
  const converted = convertBlockToFreeform(results)
  assert.ok(converted.content_ru.elements.some(item => item.text === 'Итог\nПояснение'))
  assert.ok(converted.content_en.elements.some(item => item.text === 'Outcome\nExplanation'))
  const challenge = { type: 'challenge_solution', settings: { layout: 'air' }, content_ru: { solution_label: 'Программа сравнивает', solution: 'варианты.' }, content_en: { solution_label: 'The tool compares', solution: 'options.' } } as CaseBlock
  assert.ok(convertBlockToFreeform(challenge).content_ru.elements.some(item => item.text === 'Программа сравнивает варианты.'))
})
