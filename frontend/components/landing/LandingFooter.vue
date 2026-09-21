<template>
  <footer class="vz-footer">
    <div
      class="vz-footer__cols"
      data-footer-cols
    >
      <div>
        <span>{{ copy.contactLabel }}</span>
        <nav class="vz-footer__contact-links">
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          <a href="https://t.me/vezha_digital" target="_blank" rel="noopener noreferrer">@vezha_digital</a>
          <a href="tel:+79939002366">8 (993) 900-23-66</a>
        </nav>
      </div>
      <div>
        <span>{{ copy.navLabel }}</span>
        <nav>
          <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
        </nav>
      </div>
    </div>
    <div class="vz-footer__sign" data-footer-sign>
      <strong data-clip-reveal><span data-footer-word>VEZHA</span></strong>
    </div>
    <div class="vz-footer__legal" data-footer-legal>
      <span>© 2026 · VEZHA DIGITAL</span>
      <span v-if="copy.legal">{{ copy.legal }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  copy: {
    topLink: string;
    base: [string, string];
    yearLabel: string;
    baseLabel: string;
    contactLabel: string;
    signOff: string;
    navLabel: string;
    legal: string;
  };
  contactEmail: string;
  navItems: Array<{ href: string; label: string }>;
}>();

</script>

<style scoped>
.vz-footer__cols .vz-footer__contact-links a {
  color: var(--ink);
}
</style>
