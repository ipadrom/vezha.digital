<template>
  <article class="case-air" :data-kind="kind">
    <div class="case-air__layout">
      <header :data-od-id="`case-heading-${blockId}`">
        <h2><slot name="field" :path="[headingKey]" :value="content[headingKey] || ''" label="Заголовок слева">{{ content[headingKey] }}</slot></h2>
      </header>
      <div class="case-air__copy">
        <template v-if="kind === 'challenge_solution'">
          <p v-if="content.title && headingKey !== 'title'" class="case-air__lead"><slot name="field" :path="['title']" :value="content.title" label="Вводный абзац">{{ content.title }}</slot></p>
          <p v-if="content.challenge"><slot name="field" :path="['challenge']" :value="content.challenge" label="Задача">{{ content.challenge }}</slot></p>
          <p v-if="content.solution">
            <strong v-if="content.solution_label"><slot name="field" :path="['solution_label']" :value="content.solution_label" label="Выделенное начало решения">{{ content.solution_label }}</slot></strong>{{ ' ' }}<slot name="field" :path="['solution']" :value="content.solution" label="Решение">{{ content.solution }}</slot>
          </p>
          <p v-if="content.impact">
            <strong v-if="content.impact_label"><slot name="field" :path="['impact_label']" :value="content.impact_label" label="Выделенное начало эффекта">{{ content.impact_label }}</slot></strong>{{ ' ' }}<slot name="field" :path="['impact']" :value="content.impact" label="Эффект">{{ content.impact }}</slot>
          </p>
        </template>
        <template v-else>
          <p v-if="content.eyebrow && content.title" class="case-air__lead"><slot name="field" :path="['title']" :value="content.title" label="Вводный абзац">{{ content.title }}</slot></p>
          <p v-if="content.body" class="case-air__lead"><slot name="field" :path="['body']" :value="content.body" label="Итог">{{ content.body }}</slot></p>
          <ul v-if="items.length" class="case-air__benefits" role="list">
            <li v-for="(item, index) in items" :key="index" :data-od-id="`case-result-${blockId}-${index + 1}`">
              <p>
                <strong v-if="item.title"><slot name="field" :path="['items', index, 'title']" :value="item.title" label="Краткий итог">{{ item.title }}</slot></strong>
                <slot name="field" :path="['items', index, 'text']" :value="item.text" label="Пояснение итога">{{ item.text }}</slot>
              </p>
            </li>
          </ul>
          <a v-if="content.link_url" class="builder-link" :href="content.link_url" target="_blank" rel="noopener">{{ content.link_label || content.link_url }} ↗</a>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineSlots<{
  field?: (props: { path: Array<string | number>; value: string; label: string }) => any
}>()

const props = defineProps<{ kind: 'challenge_solution' | 'results'; content: Record<string, any>; blockId: string }>()
const headingKey = computed(() => props.content.eyebrow ? 'eyebrow' : 'title')
const items = computed(() => Array.isArray(props.content.items)
  ? props.content.items.map(item => typeof item === 'string' ? { title: '', text: item } : { title: item.title || '', text: item.text || '' })
  : [])
</script>

<style scoped>
.case-air { grid-column: 1 / -1; min-width: 0; container: case-air / inline-size; font-family: var(--font-ui); color: inherit; }
.case-air__layout { display: grid; grid-template-columns: var(--case-editorial-grid, minmax(150px, .72fr) minmax(0, 1.8fr)); gap: var(--case-editorial-gap, 32px); align-items: start; }
.case-air h2 { max-width: 13ch; margin: 0; font-size: var(--case-type-subhead, 26px); line-height: 1.1; font-weight: 540; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.case-air__copy { display: grid; gap: clamp(24px, 3cqw, 36px); min-width: 0; }
.case-air p { margin: 0; max-width: 70ch; color: var(--case-v2-muted, color-mix(in srgb, currentColor 72%, transparent)); font-size: var(--case-type-body, 16px); line-height: 1.7; white-space: pre-line; overflow-wrap: anywhere; }
.case-air p.case-air__lead { color: inherit; font-size: var(--case-type-body, 18px); line-height: 1.65; }
.case-air strong { color: inherit; font-weight: 560; }
.case-air__benefits { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; list-style: none; padding: 32px 0 0; margin: 0; border-top: 1px solid var(--case-v2-border, color-mix(in srgb, currentColor 18%, transparent)); }
.case-air__benefits p { font-size: clamp(.9rem, .85rem + .2cqw, 1.05rem); line-height: 1.65; }
.case-air__benefits strong { display: block; margin-bottom: 10px; font-size: var(--case-type-body, 16px); line-height: 1.4; }
@container case-air (max-width: 760px) {
  .case-air__layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .case-air h2 { max-width: none; }
}
@container case-air (max-width: 440px) {
  .case-air__benefits { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-top: 24px; }
}
</style>
