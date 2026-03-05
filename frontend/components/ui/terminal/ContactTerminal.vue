<template>
  <div
      class="contact__right"
      ref="terminalRef"
  >
    <div class="terminal fade-item">
      <div class="terminal__header">faq.sh</div>
      <div class="terminal__body">
        <div class="terminal__line">
          <span class="prompt">$</span> cat faq.json
        </div>
        <div class="faq-list">
          <div
              v-for="(item, i) in props.faq"
              :key="i"
              class="faq-item"
              :class="{ open: openFaq === i }"
              @click="openFaq = openFaq === i ? null : i"
          >
            <div class="faq-item__question">
              <span class="faq-item__arrow">{{ openFaq === i ? '▾' : '▸' }}</span>
              <span class="faq-item__text">{{ item.q }}</span>
            </div>
            <Transition name="faq-expand">
              <div v-show="openFaq === i" class="faq-item__answer">
                {{ item.a }}
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  faq: { q: string; a: string }[]
}>()

const { isSectionVisible, targetRef: terminalRef } = useSectionVisible(0.1)

const isAdaptiveMobile = ref(false)
const checkIsAdaptiveMobile = () => {
  isAdaptiveMobile.value = window.innerWidth <= 768
}
const openFaq = ref<number | null>(0)

onMounted(() => {
  checkIsAdaptiveMobile()
  window.addEventListener("resize", checkIsAdaptiveMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkIsAdaptiveMobile)
})
</script>
<style scoped>
.faq-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.faq-item {
  border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  user-select: none;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item__question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  font-family: var(--font-inter);
  font-size: 0.78rem;
  color: #e0e0e0;
  line-height: 1.5;
  transition: color 0.2s;
}

.faq-item:hover .faq-item__question,
.faq-item.open .faq-item__question {
  color: var(--accent);
}

.faq-item__arrow {
  color: var(--accent);
  font-size: 0.75rem;
  margin-top: 1px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.faq-item__answer {
  font-family: var(--font-inter);
  font-size: 0.72rem;
  color: var(--text-dim);
  line-height: 1.7;
  padding: 0 0 12px 16px;
  border-left: 2px solid var(--accent);
  margin-left: 4px;

  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.25s ease;
}

.faq-list {
  overflow-anchor: none;
}

.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.faq-expand-enter-to,
.faq-expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Terminal */
.terminal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  overflow: hidden;
}

.terminal__header {
  background: var(--bg-tertiary);
  padding: 10px 15px;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.9rem;
}

.terminal__body {
  padding: 20px;
  min-height: 388px;
  overflow-y: auto;
}

.terminal__line {
  margin-bottom: 15px;
}

.terminal__line .prompt {
  color: var(--accent);
}

.terminal__body pre {
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.8;
}

.fade-down-enter-from{
  opacity: 0;
  transform: translateY(-15px);
}

.fade-down-enter-to{
  opacity: 1;
  transform: translateY(0);
}

.fade-down-enter-active{
  transition: all 0.5s ease-out;
  transition-delay: var(--enter-delay, 0s);
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}

@keyframes cardRevealDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    clip-path: inset(0 0 100% 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
}
</style>