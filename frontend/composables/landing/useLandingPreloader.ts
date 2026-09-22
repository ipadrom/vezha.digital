import { nextTick, onBeforeUnmount, ref } from "vue";

export type InitialLoadTask = {
  label: string;
  promise: Promise<unknown>;
  weight: number;
};

function createInitialSceneGate() {
  let settled = false;
  let complete!: (rendered: boolean) => void;
  const promise = new Promise<boolean>((resolve) => {
    complete = (rendered: boolean) => {
      if (settled) return;
      settled = true;
      resolve(rendered);
    };
  });

  return { complete, promise };
}

const PRELOADER_MIN_VISIBLE_MS = 760;
const PRELOADER_TASK_TIMEOUT_MS = 6500;

function waitForDelay(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}

function waitForCommittedPaint() {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const fallbackTimer = window.setTimeout(finish, 220);
    requestAnimationFrame(() => requestAnimationFrame(finish));
  });
}

function settleInitialLoadTask(task: InitialLoadTask, onComplete: () => void) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = (status: "ready" | "fallback" | "timeout", error?: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutTimer);
      if (status !== "ready") {
        console.info(`VEZHA initial ${task.label} ${status} is active.`, error || "");
      }
      onComplete();
      resolve();
    };
    const timeoutTimer = window.setTimeout(
      () => finish("timeout"),
      PRELOADER_TASK_TIMEOUT_MS,
    );

    void task.promise.then((result) => {
      finish(result === false ? "fallback" : "ready");
    }).catch((error) => finish("fallback", error));
  });
}

type UseLandingPreloaderOptions = {
  /** Runs once the preloader has been removed from the DOM. */
  onExit: () => void;
};

export function useLandingPreloader(options: UseLandingPreloaderOptions) {
  const preloaderRef = ref<HTMLElement | null>(null);
  const showPreloader = ref(true);
  const preloaderFontReady = ref(false);
  const introProgress = ref(0);
  const aboutSceneGate = createInitialSceneGate();
  const stackSceneGate = createInitialSceneGate();
  let preloaderFrameId = 0;
  let preloaderExitTimer = 0;
  let preloaderRunToken = 0;

  function markAboutSceneReady(rendered: boolean) {
    aboutSceneGate.complete(rendered);
  }

  function markStackSceneReady(rendered: boolean) {
    stackSceneGate.complete(rendered);
  }

  async function waitForInitialFonts() {
    const fonts = document.fonts;
    if (!fonts) return false;

    const results = await Promise.allSettled([
      fonts.load('400 1em "Onest"', "VEZHA Digital"),
      fonts.load('600 1em "Onest"', "Проекты, которые работают"),
      fonts.load('500 1em "JetBrains Mono"', "0123456789% / Loading").then((faces) => {
        preloaderFontReady.value = faces.length > 0 && faces.every((face) => face.status === "loaded");
        return faces;
      }),
    ]);
    await fonts.ready;
    return results.every((result) => result.status === "fulfilled");
  }

  function beginPreloaderExit(runToken: number) {
    if (runToken !== preloaderRunToken || !showPreloader.value) return;
    sessionStorage.setItem("vz_loaded", "1");
    if (preloaderRef.value) {
      preloaderRef.value.style.transform = "translateY(-100%)";
      preloaderRef.value.style.pointerEvents = "none";
    }
    preloaderExitTimer = window.setTimeout(() => {
      if (runToken !== preloaderRunToken) return;
      showPreloader.value = false;
      void nextTick(() => options.onExit());
    }, 900);
  }

  function runPreloader(tasks: InitialLoadTask[]) {
    const runToken = ++preloaderRunToken;
    cancelAnimationFrame(preloaderFrameId);
    window.clearTimeout(preloaderExitTimer);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      sessionStorage.setItem("vz_loaded", "1");
      showPreloader.value = false;
      return;
    }

    const seen = sessionStorage.getItem("vz_loaded") === "1";
    const replayLoader = import.meta.dev && new URLSearchParams(window.location.search).get("loader") === "1";
    if (seen && !replayLoader) {
      showPreloader.value = false;
      return;
    }

    introProgress.value = 0;
    const started = performance.now();
    const totalWeight = Math.max(1, tasks.reduce((total, task) => total + task.weight, 0));
    let completedWeight = 0;
    let resourcesReady = false;
    let displayedProgress = 0;
    let previousFrame = started;

    const trackedTasks = tasks.map((task) => settleInitialLoadTask(task, () => {
      completedWeight += task.weight;
    }));

    void Promise.all([
      Promise.all(trackedTasks),
      waitForDelay(PRELOADER_MIN_VISIBLE_MS),
    ]).then(() => waitForCommittedPaint()).then(() => {
      if (runToken === preloaderRunToken) resourcesReady = true;
    });

    const step = (now: number) => {
      if (runToken !== preloaderRunToken) return;
      const delta = Math.max(0, Math.min(64, now - previousFrame));
      previousFrame = now;
      const completion = completedWeight / totalWeight;
      const target = resourcesReady ? 1 : Math.min(0.94, 0.04 + completion * 0.9);
      const easing = 1 - Math.exp(-delta / 135);
      displayedProgress += (target - displayedProgress) * easing;

      if (resourcesReady && displayedProgress >= 0.995) {
        introProgress.value = 100;
        preloaderFrameId = requestAnimationFrame(() => beginPreloaderExit(runToken));
        return;
      }

      const displayLimit = resourcesReady ? 99.9 : 94;
      introProgress.value = Math.max(
        introProgress.value,
        Math.min(displayLimit, displayedProgress * 100),
      );
      preloaderFrameId = requestAnimationFrame(step);
    };

    preloaderFrameId = requestAnimationFrame(step);
  }

  onBeforeUnmount(() => {
    preloaderRunToken += 1;
    cancelAnimationFrame(preloaderFrameId);
    window.clearTimeout(preloaderExitTimer);
    aboutSceneGate.complete(false);
    stackSceneGate.complete(false);
  });

  return {
    preloaderRef,
    showPreloader,
    preloaderFontReady,
    introProgress,
    aboutSceneGate,
    stackSceneGate,
    markAboutSceneReady,
    markStackSceneReady,
    waitForInitialFonts,
    runPreloader,
  };
}
