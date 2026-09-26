import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('stage videos wait for their panel and restart each time it opens', () => {
  const publicView = readFileSync('components/case-builder/PublicCaseBuilder.vue', 'utf8')
  // Plain autoplay ran every collapsed stage video from page load.
  assert.match(publicView, /<video v-if="item\.video_url" :autoplay="allowAutoplay && isProcessOpen\(block, index\)"/)
  assert.match(publicView, /const syncProcessVideos = \(\) => \{[\s\S]*?if \(!video\.autoplay\) video\.pause\(\)\s*else if \(video\.paused\) \{\s*video\.currentTime = 0/)
  assert.match(publicView, /watch\(\[processOpen, isPhone\], syncProcessVideos, \{ deep: true, flush: 'post' \}\)/)
})
