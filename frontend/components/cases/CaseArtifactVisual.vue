<template>
  <figure class="case-artifact" :class="`case-artifact--${safeSlug}`">
    <span class="case-artifact__index" aria-hidden="true">{{ indexLabel }}</span>

    <div v-if="safeSlug === 'wellness-app'" class="case-artifact__wellness" aria-hidden="true">
      <video
        ref="wellnessVideo"
        class="case-artifact__wellness-video"
        muted
        loop
        playsinline
        preload="metadata"
        poster="/cases/wellness-app/wellness-promo-poster.jpg"
        tabindex="-1"
        @loadedmetadata="syncWellnessPlayback"
      >
        <source src="/cases/wellness-app/wellness-promo.mp4" type="video/mp4" />
      </video>
    </div>

    <img
      v-else-if="imageUrl"
      class="case-artifact__cover"
      :src="imageUrl"
      alt=""
      aria-hidden="true"
      loading="lazy"
    />

    <div v-else-if="safeSlug === 'restaurant-menu'" class="case-artifact__menu" aria-hidden="true">
      <article class="artifact-menu-phone artifact-menu-phone--catalog">
        <div class="artifact-mobile-bar"><i></i><b>{{ labels.menu }}</b><span>•••</span></div>
        <div class="artifact-category-row"><span class="is-active">{{ labels.popular }}</span><span>{{ labels.main }}</span><span>{{ labels.drinks }}</span></div>
        <div class="artifact-dish artifact-dish--hero"><i></i><div><strong>{{ labels.bowl }}</strong><small>420 · 12 min</small></div><b>12 €</b></div>
        <div class="artifact-dish"><i></i><div><strong>{{ labels.salad }}</strong><small>310 · 8 min</small></div><b>9 €</b></div>
        <div class="artifact-mobile-action">{{ labels.toCart }} <b>21 €</b></div>
      </article>
      <article class="artifact-menu-phone artifact-menu-phone--detail">
        <div class="artifact-food-photo"><span>VEZHA / FOOD</span></div>
        <div class="artifact-food-copy"><small>{{ labels.main }}</small><strong>{{ labels.bowl }}</strong><p>{{ labels.ingredients }}</p></div>
        <div class="artifact-quantity"><button type="button" tabindex="-1">−</button><b>1</b><button type="button" tabindex="-1">+</button></div>
        <div class="artifact-mobile-action">{{ labels.add }} <b>12 €</b></div>
      </article>
      <article class="artifact-menu-phone artifact-menu-phone--status">
        <div class="artifact-status-mark"><i></i><span></span></div>
        <small>ORDER / 0142</small>
        <strong>{{ labels.accepted }}</strong>
        <p>{{ labels.status }}</p>
        <div class="artifact-status-line"><i></i><i></i><i></i></div>
      </article>
    </div>

    <div v-else-if="safeSlug === 'ai-support'" class="case-artifact__support" aria-hidden="true">
      <div class="artifact-workspace-bar"><b>VEZHA / SUPPORT</b><span>{{ labels.online }}</span></div>
      <aside class="artifact-ticket-list">
        <small>{{ labels.inbox }}</small>
        <article class="is-active"><i>01</i><div><b>{{ labels.delivery }}</b><span>{{ labels.client }}</span></div></article>
        <article><i>02</i><div><b>{{ labels.refund }}</b><span>Olga M.</span></div></article>
        <article><i>03</i><div><b>{{ labels.integration }}</b><span>Anton K.</span></div></article>
      </aside>
      <div class="artifact-conversation">
        <header><div><small>{{ labels.dialog }}</small><b>{{ labels.client }}</b></div><span>HITL</span></header>
        <div class="artifact-message artifact-message--customer">{{ labels.question }}</div>
        <div class="artifact-message artifact-message--assistant">
          <small>AI DRAFT</small>
          <p>{{ labels.answer }}</p>
          <div><span>01</span><span>02</span><span>03</span></div>
        </div>
        <footer><span>{{ labels.edit }}</span><b>{{ labels.send }}</b></footer>
      </div>
      <aside class="artifact-sources">
        <small>{{ labels.sources }}</small>
        <article><span>01</span><div><b>{{ labels.deliveryRules }}</b><i>96%</i></div></article>
        <article><span>02</span><div><b>{{ labels.region }}</b><i>91%</i></div></article>
        <article><span>03</span><div><b>{{ labels.sla }}</b><i>84%</i></div></article>
        <div class="artifact-confidence"><span>{{ labels.confidence }}</span><b>0.94</b></div>
      </aside>
    </div>

    <div v-else-if="safeSlug === 'crm-workspace'" class="case-artifact__crm" aria-hidden="true">
      <div class="artifact-workspace-bar"><b>VEZHA / CRM</b><span>{{ labels.focus }}</span></div>
      <aside class="artifact-crm-rail"><i class="is-active"></i><i></i><i></i><i></i><i></i></aside>
      <div class="artifact-pipeline">
        <header><div><small>{{ labels.pipeline }}</small><strong>{{ labels.deals }}</strong></div><button type="button" tabindex="-1">{{ labels.newDeal }}</button></header>
        <div class="artifact-pipeline-grid">
          <section><div><b>{{ labels.lead }}</b><span>04</span></div><article><small>VEZHA FOOD</small><strong>Telegram Mini App</strong><i>12 800 €</i></article><article><small>NORTH LAB</small><strong>Client portal</strong><i>8 400 €</i></article></section>
          <section><div><b>{{ labels.discovery }}</b><span>03</span></div><article class="is-risk"><small>ATLAS GROUP</small><strong>CRM workspace</strong><i>18 600 €</i></article><article><small>WELLNESS</small><strong>PWA product</strong><i>14 200 €</i></article></section>
          <section><div><b>{{ labels.proposal }}</b><span>02</span></div><article><small>LOOP MEDIA</small><strong>AI support</strong><i>21 300 €</i></article></section>
        </div>
      </div>
      <aside class="artifact-next-action">
        <small>{{ labels.nextAction }}</small>
        <strong>{{ labels.risk }}</strong>
        <p>{{ labels.riskCopy }}</p>
        <button type="button" tabindex="-1">{{ labels.openDeal }}</button>
      </aside>
    </div>

    <div v-else class="case-artifact__fallback" aria-hidden="true">
      <small>{{ project.type }}</small>
      <strong>{{ project.name }}</strong>
      <div><i></i><i></i><i></i></div>
    </div>

    <figcaption class="sr-only">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { IProjects } from "~/utils/interfaces/IProjects";

const props = withDefaults(defineProps<{
  project: IProjects;
  indexLabel?: string;
  locale?: "ru" | "en";
}>(), {
  indexLabel: "01",
  locale: "ru",
});

const safeSlug = computed(() => props.project.slug || "project");
const imageUrl = computed(() => props.project.cover_image_url || props.project.image_url || "");
const caption = computed(() => props.locale === "ru"
  ? `Интерфейсные артефакты проекта ${props.project.name}`
  : `Product interface artifacts for ${props.project.name}`);
const wellnessVideo = ref<HTMLVideoElement | null>(null);
let reduceMotionQuery: MediaQueryList | undefined;

function syncWellnessPlayback() {
  const video = wellnessVideo.value;
  if (!video) return;

  if (reduceMotionQuery?.matches) {
    video.pause();
    if (video.readyState > 0) video.currentTime = 0;
    return;
  }

  void video.play().catch(() => {
    // The poster remains visible if a browser blocks autoplay.
  });
}

onMounted(() => {
  reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduceMotionQuery.addEventListener("change", syncWellnessPlayback);
  syncWellnessPlayback();
});

onBeforeUnmount(() => reduceMotionQuery?.removeEventListener("change", syncWellnessPlayback));

const labels = computed(() => props.locale === "ru" ? {
  accepted: "Заказ принят",
  add: "Добавить",
  answer: "Заказ уже передан курьеру. Доставка по вашему адресу займёт около 25 минут.",
  bowl: "Боул с лососем",
  client: "Мария С.",
  confidence: "Уверенность ответа",
  deals: "Сделки и следующие действия",
  delivery: "Статус доставки",
  deliveryRules: "Правила доставки",
  dialog: "Диалог #1842",
  discovery: "В работе",
  drinks: "Напитки",
  edit: "Редактировать ответ",
  focus: "Фокус",
  inbox: "Входящие / 12",
  ingredients: "Лосось, рис, авокадо, овощи и соус понзу.",
  integration: "Интеграция API",
  lead: "Новые",
  main: "Основное",
  menu: "Меню",
  newDeal: "+ Сделка",
  nextAction: "Следующее действие",
  online: "Оператор онлайн",
  openDeal: "Открыть сделку",
  pipeline: "Воронка / август",
  popular: "Популярное",
  proposal: "Предложение",
  question: "Подскажите, где мой заказ и когда его доставят?",
  refund: "Возврат оплаты",
  region: "Зоны и регионы",
  risk: "Риск по Atlas Group",
  riskCopy: "Нет ответа 3 дня. Подготовить follow-up и уточнить срок решения.",
  salad: "Зелёный салат",
  send: "Отправить",
  sla: "SLA поддержки",
  sources: "Источники ответа",
  status: "Ресторан готовит заказ. Сообщим, когда курьер выедет.",
  toCart: "В корзину",
} : {
  accepted: "Order accepted",
  add: "Add",
  answer: "The order is already with the courier. Delivery to your address will take about 25 minutes.",
  bowl: "Salmon bowl",
  client: "Maria S.",
  confidence: "Answer confidence",
  deals: "Deals and next actions",
  delivery: "Delivery status",
  deliveryRules: "Delivery rules",
  dialog: "Conversation #1842",
  discovery: "Discovery",
  drinks: "Drinks",
  edit: "Edit answer",
  focus: "Focus",
  inbox: "Inbox / 12",
  ingredients: "Salmon, rice, avocado, vegetables and ponzu sauce.",
  integration: "API integration",
  lead: "New",
  main: "Main",
  menu: "Menu",
  newDeal: "+ Deal",
  nextAction: "Next action",
  online: "Operator online",
  openDeal: "Open deal",
  pipeline: "Pipeline / August",
  popular: "Popular",
  proposal: "Proposal",
  question: "Where is my order and when will it arrive?",
  refund: "Payment refund",
  region: "Regions and zones",
  risk: "Atlas Group risk",
  riskCopy: "No reply for 3 days. Prepare a follow-up and confirm the decision date.",
  salad: "Green salad",
  send: "Send",
  sla: "Support SLA",
  sources: "Answer sources",
  status: "The restaurant is preparing your order. We will notify you when the courier leaves.",
  toCart: "View cart",
});
</script>

<style scoped>
.case-artifact {
  --artifact-accent: #30c8f2;
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 520px;
  margin: 0;
  overflow: hidden;
  border-radius: 24px;
  background: #080b0e;
  color: #f4f6f7;
  isolation: isolate;
}

.case-artifact::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(circle at 52% 38%, rgba(52, 65, 76, .22), transparent 45%),
    linear-gradient(145deg, #0b0e12, #050709 76%);
}

.case-artifact::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08), inset 0 -80px 100px rgba(0, 0, 0, .2);
  border-radius: inherit;
}

.case-artifact__index {
  position: absolute;
  top: -4%;
  right: 2.4%;
  z-index: -1;
  color: rgba(255, 255, 255, .045);
  font: 500 clamp(160px, 21vw, 340px)/.82 var(--font-ui);
  letter-spacing: -.07em;
}

.case-artifact__wellness,
.case-artifact__menu {
  position: absolute;
  inset: 0;
}

.case-artifact__wellness {
  overflow: hidden;
  background: #05070a;
}

.case-artifact__wellness-video {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.artifact-device {
  position: absolute;
  overflow: hidden;
  border: 7px solid #171a1f;
  border-radius: clamp(22px, 2.8vw, 43px);
  background: #000;
  box-shadow: 0 38px 90px rgba(0, 0, 0, .54), inset 0 0 0 1px rgba(255, 255, 255, .14);
}

.artifact-device::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
  pointer-events: none;
}

.artifact-device img { display: block; width: 100%; height: 100%; object-fit: cover; }
.artifact-device__speaker { position: absolute; top: 8px; left: 50%; z-index: 2; width: 22%; height: 4px; border-radius: 999px; transform: translateX(-50%); background: #292d32; }
.artifact-device--plan { left: 5%; bottom: -17%; width: 28%; aspect-ratio: 390 / 844; transform: rotate(-1.2deg); }
.artifact-device--session { top: 3.5%; left: 50%; z-index: 2; width: 31%; aspect-ratio: 390 / 844; transform: translateX(-50%); }
.artifact-device--food { right: 5%; bottom: -18%; width: 28%; aspect-ratio: 390 / 844; transform: rotate(1.2deg); }

.case-artifact__cover { display: block; width: 100%; height: 100%; object-fit: cover; }

.artifact-menu-phone {
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 28%;
  aspect-ratio: 390 / 844;
  padding: 20px;
  border: 7px solid #171a1f;
  border-radius: clamp(22px, 2.8vw, 42px);
  background: #f5f1e9;
  color: #101215;
  box-shadow: 0 36px 86px rgba(0, 0, 0, .5);
}

.artifact-menu-phone--catalog { left: 5%; bottom: -17%; transform: rotate(-1.2deg); }
.artifact-menu-phone--detail { top: 3.5%; left: 50%; z-index: 2; transform: translateX(-50%); }
.artifact-menu-phone--status { right: 5%; bottom: -17%; align-items: center; justify-content: center; text-align: center; transform: rotate(1.2deg); }
.artifact-mobile-bar { display: flex; align-items: center; min-height: 34px; font-size: 12px; }
.artifact-mobile-bar i { width: 23px; height: 23px; border: 1px solid currentColor; border-radius: 50%; }
.artifact-mobile-bar b { margin-inline: auto; font-size: 14px; }
.artifact-mobile-bar span { letter-spacing: .1em; }
.artifact-category-row { display: flex; gap: 7px; margin-top: 19px; overflow: hidden; white-space: nowrap; font-size: 8px; }
.artifact-category-row span { padding: 7px 9px; border: 1px solid rgba(16, 18, 21, .2); border-radius: 999px; }
.artifact-category-row .is-active { border-color: #111; background: #111; color: #fff; }
.artifact-dish { display: grid; grid-template-columns: 38px 1fr auto; gap: 9px; align-items: center; margin-top: 12px; padding: 10px; border-top: 1px solid rgba(16, 18, 21, .16); }
.artifact-dish--hero { margin-top: 22px; }
.artifact-dish > i { width: 38px; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 28%, #f7d79f 0 17%, #df7657 18% 34%, #5a8a54 35% 55%, #1b2221 56%); }
.artifact-dish div { display: grid; gap: 4px; }
.artifact-dish strong { font-size: 9px; }.artifact-dish small { color: #666; font-size: 7px; }.artifact-dish > b { font-size: 9px; }
.artifact-mobile-action { display: flex; justify-content: space-between; margin-top: auto; padding: 13px 15px; border-radius: 10px; background: #111; color: #fff; font-size: 9px; }
.artifact-food-photo { position: relative; height: 35%; margin: -20px -20px 0; background: radial-gradient(circle at 55% 42%, #f4d3a2 0 11%, #d96c4d 12% 26%, #6d9a55 27% 45%, #17201d 46% 58%, #080b0c 59%); }
.artifact-food-photo span { position: absolute; left: 15px; bottom: 13px; font: 500 7px var(--font-mono); color: #fff; letter-spacing: .14em; }
.artifact-food-copy { display: grid; gap: 9px; margin-top: 22px; }.artifact-food-copy small { color: #777; font: 500 7px var(--font-mono); }.artifact-food-copy strong { max-width: 160px; font-size: clamp(16px, 2vw, 28px); line-height: 1; }.artifact-food-copy p { color: #666; font-size: 8px; line-height: 1.5; }
.artifact-quantity { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-block: 14px; }
.artifact-quantity button { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid #111; border-radius: 50%; background: transparent; color: inherit; }
.artifact-status-mark { position: relative; width: 72px; aspect-ratio: 1; margin-bottom: 28px; border: 1px solid #111; border-radius: 50%; }
.artifact-status-mark::before { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(16, 18, 21, .22); border-radius: 50%; }
.artifact-status-mark i { position: absolute; top: 34px; left: 22px; width: 13px; height: 2px; transform: rotate(45deg); background: #111; }.artifact-status-mark span { position: absolute; top: 29px; left: 31px; width: 24px; height: 2px; transform: rotate(-45deg); background: #111; }
.artifact-menu-phone--status > small { font: 500 7px var(--font-mono); letter-spacing: .14em; }.artifact-menu-phone--status > strong { margin-top: 10px; font-size: clamp(16px, 2vw, 28px); }.artifact-menu-phone--status > p { max-width: 180px; color: #666; font-size: 8px; line-height: 1.5; }
.artifact-status-line { display: flex; gap: 6px; width: 74%; margin-top: 30px; }.artifact-status-line i { flex: 1; height: 3px; background: #111; }.artifact-status-line i:last-child { opacity: .18; }

.case-artifact__support,
.case-artifact__crm {
  position: absolute;
  inset: 7% 4%;
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 16px;
  background: #0e1216;
  box-shadow: 0 40px 90px rgba(0, 0, 0, .38);
}

.case-artifact__support { grid-template: 44px 1fr / 22% 1fr 27%; }
.artifact-workspace-bar { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; padding-inline: 18px; border-bottom: 1px solid rgba(255, 255, 255, .11); font: 500 8px var(--font-mono); letter-spacing: .12em; }
.artifact-workspace-bar span { display: flex; align-items: center; gap: 8px; color: rgba(244, 246, 247, .62); }.artifact-workspace-bar span::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--artifact-accent); box-shadow: 0 0 14px rgba(48, 200, 242, .4); }
.artifact-ticket-list { padding: 20px 12px; border-right: 1px solid rgba(255, 255, 255, .1); }.artifact-ticket-list > small, .artifact-sources > small { padding-inline: 8px; color: rgba(244, 246, 247, .48); font: 500 8px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.artifact-ticket-list article { display: grid; grid-template-columns: 25px 1fr; gap: 9px; margin-top: 9px; padding: 12px 8px; border-radius: 9px; color: rgba(244, 246, 247, .56); }.artifact-ticket-list article.is-active { background: rgba(255, 255, 255, .07); color: #fff; }.artifact-ticket-list article i { color: var(--artifact-accent); font: 500 8px var(--font-mono); }.artifact-ticket-list article div { display: grid; gap: 4px; }.artifact-ticket-list article b { overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.artifact-ticket-list article span { color: rgba(244, 246, 247, .4); font-size: 7px; }
.artifact-conversation { display: flex; flex-direction: column; min-width: 0; padding: 20px; }.artifact-conversation header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, .09); }.artifact-conversation header div { display: grid; gap: 4px; }.artifact-conversation header small { color: rgba(244, 246, 247, .42); font: 500 7px var(--font-mono); }.artifact-conversation header b { font-size: 10px; }.artifact-conversation header > span { padding: 5px 7px; border: 1px solid rgba(48, 200, 242, .45); border-radius: 999px; color: var(--artifact-accent); font: 500 7px var(--font-mono); }
.artifact-message { max-width: 78%; margin-top: 20px; padding: 12px 14px; border-radius: 12px; font-size: clamp(8px, .9vw, 12px); line-height: 1.45; }.artifact-message--customer { align-self: flex-end; border-bottom-right-radius: 3px; background: #f1f3f4; color: #121519; }.artifact-message--assistant { border: 1px solid rgba(255, 255, 255, .12); border-bottom-left-radius: 3px; background: rgba(255, 255, 255, .045); }.artifact-message--assistant > small { color: var(--artifact-accent); font: 500 7px var(--font-mono); letter-spacing: .12em; }.artifact-message--assistant p { margin: 9px 0; }.artifact-message--assistant div { display: flex; gap: 5px; }.artifact-message--assistant span { display: grid; place-items: center; width: 20px; height: 20px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 50%; font: 500 6px var(--font-mono); }
.artifact-conversation footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding: 10px 12px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 9px; color: rgba(244, 246, 247, .42); font-size: 8px; }.artifact-conversation footer b { color: var(--artifact-accent); font: 500 7px var(--font-mono); letter-spacing: .1em; }
.artifact-sources { padding: 20px 12px; border-left: 1px solid rgba(255, 255, 255, .1); }.artifact-sources article { display: grid; grid-template-columns: 22px 1fr; gap: 8px; margin-top: 14px; padding: 11px 8px; border-top: 1px solid rgba(255, 255, 255, .1); }.artifact-sources article > span { color: var(--artifact-accent); font: 500 8px var(--font-mono); }.artifact-sources article div { display: flex; align-items: center; justify-content: space-between; gap: 6px; }.artifact-sources article b { font-size: 8px; }.artifact-sources article i { color: rgba(244, 246, 247, .45); font: 500 7px var(--font-mono); }
.artifact-confidence { display: flex; justify-content: space-between; align-items: end; margin: 26px 8px 0; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, .1); }.artifact-confidence span { max-width: 80px; color: rgba(244, 246, 247, .45); font-size: 8px; }.artifact-confidence b { color: var(--artifact-accent); font-size: clamp(18px, 2vw, 28px); font-weight: 500; }

.case-artifact__crm { grid-template: 44px 1fr / 52px 1fr; }
.artifact-crm-rail { display: flex; align-items: center; flex-direction: column; gap: 20px; padding-top: 24px; border-right: 1px solid rgba(255, 255, 255, .1); }.artifact-crm-rail i { width: 15px; height: 2px; background: rgba(255, 255, 255, .25); }.artifact-crm-rail i.is-active { background: var(--artifact-accent); }
.artifact-pipeline { min-width: 0; padding: 20px 22px; }.artifact-pipeline > header { display: flex; align-items: end; justify-content: space-between; }.artifact-pipeline > header div { display: grid; gap: 5px; }.artifact-pipeline > header small { color: rgba(244, 246, 247, .42); font: 500 7px var(--font-mono); letter-spacing: .1em; }.artifact-pipeline > header strong { font-size: clamp(15px, 1.8vw, 25px); font-weight: 500; }.artifact-pipeline > header button, .artifact-next-action button { min-height: 31px; padding: 7px 12px; border: 0; border-radius: 7px; background: #f1f3f4; color: #111418; font: 600 7px var(--font-mono); text-transform: uppercase; }
.artifact-pipeline-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; margin-top: 20px; }.artifact-pipeline-grid section { min-width: 0; padding: 10px; border-top: 1px solid rgba(255, 255, 255, .16); background: rgba(255, 255, 255, .025); }.artifact-pipeline-grid section > div { display: flex; justify-content: space-between; color: rgba(244, 246, 247, .58); font: 500 8px var(--font-mono); }.artifact-pipeline-grid article { display: grid; gap: 7px; margin-top: 10px; padding: 11px; border: 1px solid rgba(255, 255, 255, .1); border-radius: 9px; background: #12171c; }.artifact-pipeline-grid article.is-risk { border-color: rgba(48, 200, 242, .52); }.artifact-pipeline-grid article small { color: rgba(244, 246, 247, .42); font: 500 6px var(--font-mono); letter-spacing: .08em; }.artifact-pipeline-grid article strong { overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.artifact-pipeline-grid article i { color: var(--artifact-accent); font: 500 8px var(--font-mono); }
.artifact-next-action { position: absolute; right: 5.5%; bottom: 10%; z-index: 3; width: min(235px, 27%); padding: 18px; border-radius: 14px; background: #eef1f2; color: #111418; box-shadow: 0 24px 60px rgba(0, 0, 0, .42); }.artifact-next-action small { font: 500 7px var(--font-mono); letter-spacing: .1em; }.artifact-next-action strong { display: block; margin-top: 12px; font-size: clamp(13px, 1.6vw, 21px); }.artifact-next-action p { margin: 8px 0 15px; color: #5c6269; font-size: clamp(7px, .8vw, 10px); line-height: 1.45; }.artifact-next-action button { background: #111418; color: #fff; }

.case-artifact__fallback { position: absolute; inset: 12%; display: flex; flex-direction: column; justify-content: center; }.case-artifact__fallback small { color: var(--artifact-accent); font: 500 9px var(--font-mono); letter-spacing: .16em; }.case-artifact__fallback strong { max-width: 780px; margin-top: 24px; font-size: clamp(38px, 6vw, 86px); line-height: .94; letter-spacing: -.04em; }.case-artifact__fallback div { display: grid; gap: 11px; width: 52%; margin-top: 60px; }.case-artifact__fallback i { height: 1px; background: rgba(255, 255, 255, .2); }.case-artifact__fallback i:nth-child(2) { width: 72%; }.case-artifact__fallback i:nth-child(3) { width: 43%; }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (max-width: 900px) {
  .case-artifact { min-height: 0; aspect-ratio: 4 / 5; border-radius: 18px; }
  .case-artifact--wellness-app { aspect-ratio: 16 / 9; }
  .case-artifact__index { top: 2%; right: 1%; font-size: clamp(130px, 42vw, 220px); }
  .case-artifact__wellness-video {
    height: 100%;
    object-fit: cover;
  }
  .artifact-device--plan, .artifact-menu-phone--catalog { left: -16%; bottom: -5%; width: 58%; }
  .artifact-device--session, .artifact-menu-phone--detail { top: 5%; width: 66%; }
  .artifact-device--food, .artifact-menu-phone--status { right: -16%; bottom: -6%; width: 58%; }
  .case-artifact__support, .case-artifact__crm { inset: 5%; }
  .case-artifact__support { grid-template: 40px 1fr / 1fr; }
  .case-artifact__support .artifact-ticket-list, .case-artifact__support .artifact-sources { display: none; }
  .case-artifact__support .artifact-conversation { grid-column: 1; }
  .case-artifact__crm { grid-template: 40px 1fr / 38px 1fr; }
  .artifact-pipeline-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .artifact-pipeline-grid section:last-child { display: none; }
  .artifact-next-action { right: 8%; bottom: 8%; width: 52%; }
}

@media (max-width: 540px) {
  .artifact-menu-phone { padding: 13px; border-width: 5px; }
  .artifact-menu-phone--catalog { left: -28%; }.artifact-menu-phone--status { right: -28%; }
  .artifact-category-row span:nth-child(n + 3), .artifact-dish:nth-of-type(n + 3) { display: none; }
  .artifact-food-photo { margin: -13px -13px 0; }
  .artifact-pipeline { padding: 14px 12px; }
  .artifact-pipeline-grid { grid-template-columns: 1fr; }
  .artifact-pipeline-grid section:nth-child(n + 2) { display: none; }
  .artifact-next-action { width: 62%; }
}

@media (prefers-reduced-motion: no-preference) {
  .artifact-device--plan, .artifact-menu-phone--catalog { animation: artifact-drift-left 7s ease-in-out infinite alternate; }
  .artifact-device--food, .artifact-menu-phone--status { animation: artifact-drift-right 8s ease-in-out infinite alternate; }
}

@keyframes artifact-drift-left { to { transform: translateY(-8px) rotate(-.5deg); } }
@keyframes artifact-drift-right { to { transform: translateY(-10px) rotate(.4deg); } }
</style>
