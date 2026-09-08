import assert from 'node:assert/strict'
import test from 'node:test'
import { blockLibrary, blockLabel, createCaseBlock, localizedBlocks } from '../utils/caseBuilder.ts'

test('the library offers a separate phone preset without replacing the normal process', () => {
  const choices = blockLibrary.filter(item => item.type === 'process')
  assert.ok(choices.some(item => !item.layout))
  const preset = choices.find(item => item.layout === 'phone-showcase')!
  const phone = createCaseBlock(preset.type, preset.layout)
  assert.equal(phone.settings.layout, 'phone-showcase')
  assert.equal(phone.settings.disclosure_mode, 'single')
  assert.equal(phone.settings.open_first, true)
  assert.equal(blockLabel(phone.type, phone.settings.layout), 'Список с телефоном')
  assert.equal(createCaseBlock('process').settings.layout, 'chapter')
  assert.equal(createCaseBlock('process', 'invalid').settings.layout, 'chapter')
})

test('localization preserves editable screens, video and labels in the phone preset', () => {
  const phone = createCaseBlock('process', 'phone-showcase')
  phone.content_ru.items = [{ title: 'Пример', image_url: '/demo.png', image_label: 'До', secondary_image_url: '/after.png', secondary_image_label: 'После', video_url: '/demo.mp4' }]
  const publicBlock = localizedBlocks([phone], 'ru')[0]
  assert.equal(publicBlock.settings.layout, 'phone-showcase')
  assert.deepEqual(publicBlock.content.items, phone.content_ru.items)
})
