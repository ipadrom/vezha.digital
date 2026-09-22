import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef } from "vue";
import type { LandingCopy } from "./useLandingContent";

export type AboutFlowItem = {
  label: string;
  iconPaths: string[];
};

const aboutBusinessIcons = [
  [
    "M224,40V76a8,8,0,0,1-16,0V48H180a8,8,0,0,1,0-16h36A8,8,0,0,1,224,40Zm-8,132a8,8,0,0,0-8,8v28H180a8,8,0,0,0,0,16h36a8,8,0,0,0,8-8V180A8,8,0,0,0,216,172ZM76,208H48V180a8,8,0,0,0-16,0v36a8,8,0,0,0,8,8H76a8,8,0,0,0,0-16ZM40,84a8,8,0,0,0,8-8V48H76a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V76A8,8,0,0,0,40,84Zm136,92a8,8,0,0,1-6.41-3.19,52,52,0,0,0-83.2,0,8,8,0,1,1-12.8-9.62A67.94,67.94,0,0,1,101,141.51a40,40,0,1,1,53.94,0,67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,176,176Zm-48-40a24,24,0,1,0-24-24A24,24,0,0,0,128,136Z",
  ],
  [
    "M216,96A88,88,0,1,0,72,163.83V240a8,8,0,0,0,11.58,7.16L128,225l44.43,22.21A8.07,8.07,0,0,0,176,248a8,8,0,0,0,8-8V163.83A87.85,87.85,0,0,0,216,96ZM56,96a72,72,0,1,1,72,72A72.08,72.08,0,0,1,56,96ZM168,227.06l-36.43-18.21a8,8,0,0,0-7.16,0L88,227.06V174.37a87.89,87.89,0,0,0,80,0ZM128,152A56,56,0,1,0,72,96,56.06,56.06,0,0,0,128,152Zm0-96A40,40,0,1,1,88,96,40,40,0,0,1,128,56Z",
  ],
  [
    "M224,64H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56v8H32A16,16,0,0,0,16,80V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM224,80v32H192v-8a8,8,0,0,0-16,0v8H80v-8a8,8,0,0,0-16,0v8H32V80Zm0,112H32V128H64v8a8,8,0,0,0,16,0v-8h96v8a8,8,0,0,0,16,0v-8h32v64Z",
  ],
  [
    "M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z",
  ],
];

const aboutProductIcons = [
  [
    "M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z",
  ],
  ["M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Zm-61.14,36L78.15,126.35l-49.6-9.73ZM88,200V152.52l24.79,21.74Zm87.53,8L92.85,135.5l119-85.29Z"],
  ["M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z"],
  ["M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z"],
];

const aboutSupportStepIndex = 6;
const aboutFlowStepDurationMs = 4500;
const aboutFlowSnakeSegments = [
  { key: "design", path: "M 25 50 C 29 50 31 69 35 69", begin: "3.95s" },
  { key: "ux", path: "M 35 69 C 39 69 41 30 45 30", begin: "8.45s" },
  { key: "development", path: "M 45 30 C 50 30 50 65 55 65", begin: "12.95s" },
  { key: "testing", path: "M 55 65 C 60 65 60 33 65 33", begin: "17.45s" },
  { key: "launch", path: "M 65 33 C 70 33 70 50 75 50", begin: "21.95s" },
  { key: "product", path: "M 75 50 L 87.5 50", begin: "25.8s" },
];
const aboutFlowStepDelaysMs = Array.from(
  { length: aboutSupportStepIndex - 1 },
  (_, index) => (index + 1) * aboutFlowStepDurationMs,
);
const aboutFlowResultDelayMs = aboutSupportStepIndex * aboutFlowStepDurationMs;

type UseAboutFlowOptions = {
  copy: ComputedRef<LandingCopy>;
};

export function useAboutFlow(options: UseAboutFlowOptions) {
  const { copy } = options;
  const aboutFlowRef = ref<HTMLElement | null>(null);
  let aboutFlowResultTimer: ReturnType<typeof setTimeout> | null = null;
  let aboutFlowStepTimers: Array<ReturnType<typeof setTimeout>> = [];
  let aboutFlowObserver: IntersectionObserver | null = null;

  const aboutBusinessItems = computed<AboutFlowItem[]>(() => copy.value.about.business.map((label, index) => ({
    label,
    iconPaths: aboutBusinessIcons[index] || aboutBusinessIcons[0]!,
  })));
  const aboutProductItems = computed<AboutFlowItem[]>(() => copy.value.about.products.map((label, index) => ({
    label,
    iconPaths: aboutProductIcons[index] || aboutProductIcons[0]!,
  })));
  const aboutFlowBusinessIndex = ref(0);
  const aboutFlowStepIndex = ref(0);
  const aboutFlowDisplayStepIndex = ref(0);
  const activeAboutProduct = ref<AboutFlowItem | null>(null);
  const aboutFlowPhase = ref<"signal" | "result">("result");
  const aboutFlowCycleKey = ref(0);
  const aboutFlowResumeKey = ref(0);
  const aboutFlowResumeElapsedMs = ref(0);
  const aboutFlowTargetStepIndex = ref<number | null>(null);
  const aboutFlowNavigationKey = ref(0);
  const activeAboutBusiness = computed<AboutFlowItem>(() => (
    aboutBusinessItems.value[aboutFlowBusinessIndex.value] || aboutBusinessItems.value[0]!
  ));
  const canContinueAboutFlow = computed(() => (
    aboutFlowTargetStepIndex.value !== null
    && aboutFlowTargetStepIndex.value < aboutSupportStepIndex
  ));

  function setAboutFlowHost(element: HTMLElement | null) {
    aboutFlowRef.value = element;
  }

  function pickNextAboutProduct(): AboutFlowItem | null {
    const items = aboutProductItems.value;
    if (items.length <= 1) return items[0] || null;

    let next = activeAboutProduct.value;
    while (next?.label === activeAboutProduct.value?.label) {
      next = items[Math.floor(Math.random() * items.length)] || null;
    }
    return next;
  }

  function clearAboutFlowResultTimer() {
    if (!aboutFlowResultTimer) return;
    clearTimeout(aboutFlowResultTimer);
    aboutFlowResultTimer = null;
  }

  function clearAboutFlowStepTimers() {
    aboutFlowStepTimers.forEach((timer) => clearTimeout(timer));
    aboutFlowStepTimers = [];
  }

  function runAboutFlowCycle(advanceBusiness = true) {
    clearAboutFlowResultTimer();
    clearAboutFlowStepTimers();
    aboutFlowTargetStepIndex.value = null;
    if (advanceBusiness) {
      aboutFlowBusinessIndex.value = (aboutFlowBusinessIndex.value + 1) % aboutBusinessItems.value.length;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      aboutFlowStepIndex.value = aboutSupportStepIndex;
      aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
      activeAboutProduct.value = pickNextAboutProduct();
      aboutFlowPhase.value = "result";
      return;
    }

    activeAboutProduct.value = null;
    aboutFlowStepIndex.value = 0;
    aboutFlowDisplayStepIndex.value = 0;
    aboutFlowPhase.value = "signal";
    aboutFlowCycleKey.value += 1;
    aboutFlowStepTimers = aboutFlowStepDelaysMs.map((delay, index) => setTimeout(() => {
      aboutFlowStepIndex.value = index + 1;
      aboutFlowDisplayStepIndex.value = index + 1;
    }, delay));
    aboutFlowResultTimer = setTimeout(() => {
      aboutFlowStepIndex.value = aboutSupportStepIndex;
      aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
      activeAboutProduct.value = pickNextAboutProduct();
      aboutFlowPhase.value = "result";
      aboutFlowResultTimer = null;
    }, aboutFlowResultDelayMs);
  }

  function replayAboutFlow() {
    runAboutFlowCycle(true);
  }

  function continueAboutFlow() {
    const currentStep = Math.max(
      0,
      Math.min(aboutSupportStepIndex - 1, aboutFlowTargetStepIndex.value ?? aboutFlowStepIndex.value),
    );
    const resumeElapsedMs = Number.parseFloat(aboutFlowSnakeSegments[currentStep]?.begin || "0") * 1000;

    clearAboutFlowResultTimer();
    clearAboutFlowStepTimers();
    aboutFlowTargetStepIndex.value = null;
    activeAboutProduct.value = null;
    aboutFlowPhase.value = "signal";
    aboutFlowResumeElapsedMs.value = resumeElapsedMs;
    aboutFlowResumeKey.value += 1;

    aboutFlowStepTimers = aboutFlowStepDelaysMs.flatMap((delay, index) => {
      const nextStep = index + 1;
      if (nextStep <= currentStep) return [];
      return [setTimeout(() => {
        aboutFlowStepIndex.value = nextStep;
        aboutFlowDisplayStepIndex.value = nextStep;
      }, Math.max(0, delay - resumeElapsedMs))];
    });

    aboutFlowResultTimer = setTimeout(() => {
      aboutFlowStepIndex.value = aboutSupportStepIndex;
      aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
      activeAboutProduct.value = pickNextAboutProduct();
      aboutFlowPhase.value = "result";
      aboutFlowResultTimer = null;
    }, Math.max(0, aboutFlowResultDelayMs - resumeElapsedMs));
  }

  function selectAboutFlowStep(index: number) {
    const target = Math.max(0, Math.min(aboutSupportStepIndex, index));
    const isSupportStep = target === aboutSupportStepIndex;
    aboutFlowObserver?.disconnect();
    aboutFlowObserver = null;
    clearAboutFlowResultTimer();
    clearAboutFlowStepTimers();
    activeAboutProduct.value = isSupportStep
      ? activeAboutProduct.value || pickNextAboutProduct()
      : null;
    aboutFlowStepIndex.value = target;
    aboutFlowDisplayStepIndex.value = target;
    aboutFlowTargetStepIndex.value = target;
    aboutFlowPhase.value = isSupportStep ? "result" : "signal";
    aboutFlowNavigationKey.value += 1;
  }

  function setAboutFlowReachedStep(index: number) {
    aboutFlowStepIndex.value = Math.max(0, Math.min(aboutSupportStepIndex, index));
  }

  function setupAboutFlowObserver() {
    if (!aboutFlowRef.value) return;
    aboutFlowObserver?.disconnect();

    if (!("IntersectionObserver" in window)) {
      runAboutFlowCycle(false);
      return;
    }

    aboutFlowObserver = new IntersectionObserver((entries) => {
      if (aboutFlowTargetStepIndex.value !== null) {
        aboutFlowObserver?.disconnect();
        aboutFlowObserver = null;
        return;
      }
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runAboutFlowCycle(false);
      aboutFlowObserver?.disconnect();
      aboutFlowObserver = null;
    }, { threshold: 0.42 });
    aboutFlowObserver.observe(aboutFlowRef.value);
  }

  function stopAboutFlow() {
    aboutFlowObserver?.disconnect();
    aboutFlowObserver = null;
    clearAboutFlowResultTimer();
    clearAboutFlowStepTimers();
  }

  onMounted(() => {
    setupAboutFlowObserver();
  });

  onBeforeUnmount(() => {
    stopAboutFlow();
  });

  return {
    aboutFlowPhase,
    aboutFlowCycleKey,
    aboutFlowResumeKey,
    aboutFlowResumeElapsedMs,
    aboutFlowTargetStepIndex,
    aboutFlowNavigationKey,
    aboutFlowStepIndex,
    aboutFlowDisplayStepIndex,
    canContinueAboutFlow,
    aboutFlowSnakeSegments,
    activeAboutBusiness,
    activeAboutProduct,
    replayAboutFlow,
    continueAboutFlow,
    selectAboutFlowStep,
    setAboutFlowReachedStep,
    setAboutFlowHost,
  };
}
