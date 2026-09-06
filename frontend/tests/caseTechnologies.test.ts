import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { technologyGroups, technologyIcons, technologyIconPath, technologyId, relatedTechnologies } from '../utils/caseTechnologies.ts'
import { caseBlockLayoutOptions } from '../utils/caseBuilder.ts'

test('contours extend the existing technology layout choices', () => {
  assert.deepEqual(caseBlockLayoutOptions.technologies.map(item => item.value), ['map', 'contours', 'tags'])
})
test('groups follow first appearance, with stable IDs and a legacy fallback', () => {
  const items = [
    { id: 'python', label: 'Python', group: 'Приложение' },
    { id: 'ocr', label: 'OCR', group: 'Внешние сервисы' },
    { id: 'flask', label: 'Flask', group: 'Приложение' },
    { label: 'Legacy' },
  ]
  const groups = technologyGroups(items, 'Технологии')
  assert.deepEqual(groups.map(group => group.label), ['Приложение', 'Внешние сервисы', 'Технологии'])
  assert.deepEqual(groups[0].nodes.map(node => node.id), ['python', 'flask'])
  assert.equal(groups[2].nodes[0].id, 'technology-3')
  assert.equal(items[3].id, undefined)
  assert.equal(technologyId(items[0], 3), 'python')
})
test('related items exclude missing and self references', () => {
  const items = [
    { id: 'python', label: 'Python', related_ids: ['python', 'flask', 'removed'] },
    { id: 'flask', label: 'Flask' },
  ]
  assert.deepEqual(relatedTechnologies(items, items[0]), [items[1]])
})
test('every offered icon is bundled and unknown names cannot become arbitrary URLs', () => {
  for (const icon of technologyIcons) {
    const path = `public${technologyIconPath(icon.value)}`
    assert.ok(existsSync(path), path)
    const svg = readFileSync(path, 'utf8')
    assert.match(svg, /<svg/)
    assert.doesNotMatch(svg, /<script|<foreignObject|onload=|<image/i)
  }
  for (const value of [undefined, '', '../private', 'https://example.com/icon.svg']) {
    assert.equal(technologyIconPath(value), '/icons/technology/blocks.svg')
  }
})

test('technology transitions observe natural content and respect keyboard and reduced motion', () => {
  const component = readFileSync('components/case-builder/CaseTechnologyContours.vue', 'utf8')
  assert.match(component, /<Transition name="technology-copy" mode="out-in">/)
  assert.match(component, /resizeObserver\.observe\(bodyElement\.value\)/)
  assert.doesNotMatch(component, /resizeObserver\.observe\(surfaceElement/)
  assert.match(component, /resizeObserver\?\.disconnect\(\)/)
  assert.match(component, /cancelAnimationFrame\(measurementFrame\)/)
  assert.match(component, /height 200ms var\(--ease-out/)
  assert.match(component, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(component, /pill\?\.focus\(\{ preventScroll: true \}\)/)
  assert.doesNotMatch(component, /transition:\s*all|scale\(0\)/)
})

test('technology contours keep the selected explanation beside the cards on mobile', () => {
  const component = readFileSync('components/case-builder/CaseTechnologyContours.vue', 'utf8')
  const mobileRules = component.slice(component.indexOf('@container technology-contours (max-width: 680px)'))
  assert.match(mobileRules, /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(128px, \.72fr\)/)
  assert.match(mobileRules, /border-left:\s*1px solid var\(--technology-rule\)/)
  assert.doesNotMatch(mobileRules, /\.technology-contours__layout\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);/)
  assert.match(mobileRules, /\.technology-contours__nodes\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(mobileRules, /\.technology-contours__pill-copy\s*\{\s*display:\s*none/)
  assert.match(mobileRules, /grid-template-columns:\s*minmax\(112px, \.78fr\) minmax\(0, 1\.22fr\)/)
  assert.match(mobileRules, /aspect-ratio:\s*1/)
  assert.match(mobileRules, /border-radius:\s*50%/)
  assert.match(component, /:aria-label="node\.label"/)
})
