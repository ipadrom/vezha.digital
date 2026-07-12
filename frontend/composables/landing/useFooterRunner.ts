import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  type ComputedRef,
  type Ref,
} from "vue";

export type FooterRunnerStatus = "READY" | "RUNNING" | "CRASH";

export type FooterRunnerGame = {
  crashed: boolean;
  dinoY: number;
  running: boolean;
  score: number;
  speed: number;
  status: FooterRunnerStatus;
  velocityY: number;
};

export type FooterRunnerObstacle = {
  id: number;
  letter: string;
  passed: boolean;
  width: number;
  x: number;
};

export type UseFooterRunnerReturn = {
  game: Ref<FooterRunnerGame>;
  score: ComputedRef<string>;
  status: ComputedRef<FooterRunnerStatus>;
  obstacles: Ref<FooterRunnerObstacle[]>;
  setHost: (element: HTMLElement | null) => void;
  jump: () => void;
  updateFromScroll: () => void;
};

const GAME_LETTERS = ["V", "E", "Z", "H", "A"];

export function useFooterRunner(
  hostRef?: Ref<HTMLElement | null>,
): UseFooterRunnerReturn {
  const host = hostRef ?? ref<HTMLElement | null>(null);
  const obstacles = ref<FooterRunnerObstacle[]>([]);
  const game = ref<FooterRunnerGame>({
    crashed: false,
    dinoY: 0,
    running: false,
    score: 0,
    speed: 3.6,
    status: "READY",
    velocityY: 0,
  });

  const score = computed(() => Math.floor(game.value.score).toString().padStart(4, "0"));
  const status = computed<FooterRunnerStatus>(() => {
    if (game.value.crashed) return "CRASH";
    if (game.value.running) return "RUNNING";
    return game.value.status;
  });

  let gameRaf = 0;
  let gameLastFrame = 0;
  let gameLastScrollY = 0;
  let gameNextId = 0;
  let gameSpawnIn = 0;
  let gameStartBlockedUntil = 0;
  let gameNeedsReentry = false;

  function clampValue(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function setHost(element: HTMLElement | null) {
    host.value = element;
  }

  function getTrack() {
    return host.value?.querySelector<HTMLElement>("[data-footer-game-track]") || null;
  }

  function isVisible() {
    const element = getTrack();
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.94 && rect.bottom > window.innerHeight * 0.08;
  }

  function resetGame() {
    game.value.crashed = false;
    game.value.dinoY = 0;
    game.value.running = false;
    game.value.score = 0;
    game.value.speed = 3.6;
    game.value.status = "READY";
    game.value.velocityY = 0;
    obstacles.value = [];
    gameSpawnIn = 420;
  }

  function stopGameLoop() {
    if (gameRaf) cancelAnimationFrame(gameRaf);
    gameRaf = 0;
    gameLastFrame = 0;
  }

  function startGameLoop() {
    if (gameRaf) return;

    gameLastFrame = performance.now();
    gameRaf = requestAnimationFrame(tickGame);
  }

  function endGame() {
    if (!game.value.running && !gameRaf && !obstacles.value.length && game.value.score === 0) return;

    stopGameLoop();
    resetGame();
  }

  function endGameFromScrollUp() {
    gameStartBlockedUntil = performance.now() + 1100;
    endGame();
  }

  function startGame() {
    if (!host.value || !isVisible()) return;

    if (game.value.crashed) resetGame();
    if (!obstacles.value.length) gameSpawnIn = Math.max(gameSpawnIn, 420);

    game.value.running = true;
    game.value.status = "RUNNING";
    startGameLoop();
  }

  function crashGame() {
    game.value.running = false;
    game.value.crashed = true;
    game.value.status = "CRASH";
    stopGameLoop();
  }

  function spawnObstacle(trackWidth: number) {
    const letter = GAME_LETTERS[gameNextId % GAME_LETTERS.length];

    obstacles.value.push({
      id: gameNextId,
      letter,
      passed: false,
      width: letter === "I" ? 34 : 58,
      x: trackWidth + 54,
    });

    gameNextId += 1;
    gameSpawnIn = 460 + Math.random() * 380;
  }

  function tickGame(now: number) {
    gameRaf = 0;
    if (!game.value.running) return;
    if (!isVisible()) {
      endGame();
      return;
    }

    const track = getTrack();
    const trackWidth = track?.clientWidth || 900;
    const delta = clampValue(now - gameLastFrame, 0, 34);
    const frame = delta / 16.67;
    gameLastFrame = now;

    game.value.speed = Math.min(8.6, game.value.speed + 0.0019 * frame);
    game.value.score += 0.07 * frame;
    game.value.velocityY -= 0.82 * frame;
    game.value.dinoY += game.value.velocityY * frame;

    if (game.value.dinoY <= 0) {
      game.value.dinoY = 0;
      if (game.value.velocityY < 0) game.value.velocityY = 0;
    }

    gameSpawnIn -= game.value.speed * frame;
    if (gameSpawnIn <= 0) spawnObstacle(trackWidth);

    const dinoLeft = 74;
    const dinoRight = 118;
    const collisionHeight = 50;

    obstacles.value.forEach((obstacle) => {
      obstacle.x -= game.value.speed * frame;

      if (!obstacle.passed && obstacle.x + obstacle.width < dinoLeft) {
        obstacle.passed = true;
        game.value.score += 8;
      }

      const overlapsX = obstacle.x < dinoRight && obstacle.x + obstacle.width > dinoLeft;
      if (overlapsX && game.value.dinoY < collisionHeight) crashGame();
    });

    obstacles.value = obstacles.value.filter((obstacle) => obstacle.x > -96);

    if (game.value.running) gameRaf = requestAnimationFrame(tickGame);
  }

  function jump() {
    if (!isVisible()) return;

    if (game.value.crashed) {
      resetGame();
      startGame();
    } else if (!game.value.running) {
      startGame();
    }

    if (game.value.dinoY <= 1) game.value.velocityY = 15.8;
  }

  function updateFromScroll() {
    const currentY = window.scrollY;
    const delta = currentY - gameLastScrollY;
    const visible = isVisible();

    if (!visible) {
      endGame();
      gameNeedsReentry = false;
      gameLastScrollY = currentY;
      return;
    }

    if (delta < -1) {
      gameNeedsReentry = true;
      endGameFromScrollUp();
      gameLastScrollY = currentY;
      return;
    }

    if (delta > 1 && !gameNeedsReentry && performance.now() > gameStartBlockedUntil) startGame();

    gameLastScrollY = currentY;
  }

  function cleanup() {
    stopGameLoop();
  }

  onMounted(() => {
    gameLastScrollY = window.scrollY;
  });
  onBeforeUnmount(cleanup);

  return {
    game,
    score,
    status,
    obstacles,
    setHost,
    jump,
    updateFromScroll,
  };
}
