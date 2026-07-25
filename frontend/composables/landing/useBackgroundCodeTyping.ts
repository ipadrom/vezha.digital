import type { Ref } from "vue";

export function useBackgroundCodeTyping(snippets: readonly [string, string]) {
  const typedCode: Ref<[string, string]> = ref(["", ""]);
  let timer: ReturnType<typeof window.setInterval> | null = null;
  let started = false;
  let cursor = 0;
  const totalLength = snippets[0].length + snippets[1].length;

  function render() {
    const firstLength = Math.min(cursor, snippets[0].length);
    const secondLength = Math.max(0, cursor - snippets[0].length);
    typedCode.value = [
      snippets[0].slice(0, firstLength),
      snippets[1].slice(0, secondLength),
    ];

    if (cursor >= totalLength && timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    if (started) return;
    started = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cursor = totalLength;
      render();
      return;
    }

    timer = window.setInterval(() => {
      cursor = Math.min(totalLength, cursor + 2);
      render();
    }, 22);
  }

  onBeforeUnmount(() => {
    if (timer) window.clearInterval(timer);
  });

  return { typedCode, start };
}
