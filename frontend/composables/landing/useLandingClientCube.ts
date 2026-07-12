import type { Ref } from "vue";

type ThreeModule = typeof import("three");

type UseLandingClientCubeOptions = {
  rootRef: Ref<HTMLElement | null>;
  hostRef: Ref<HTMLElement | null>;
  activeSegment: Ref<number>;
  segmentCount: number;
};

export function useLandingClientCube(options: UseLandingClientCubeOptions) {
  const rootRef = options.rootRef;
  const clientCubeRef = options.hostRef;
  const activeClientSegment = options.activeSegment;
  const clientSegments = { length: options.segmentCount };
  let clientCubeCleanup: (() => void) | null = null;
  let clientCubeSetupToken = 0;
  let updateClientCubeStage: ((index: number) => void) | null = null;

  function clampValue(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function createClientCubeEnvironment(THREE: ThreeModule) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, "#f8fafc");
    base.addColorStop(0.2, "#ffffff");
    base.addColorStop(0.38, "#05070b");
    base.addColorStop(0.48, "#2a2d33");
    base.addColorStop(0.58, "#f4f7fb");
    base.addColorStop(0.72, "#07090e");
    base.addColorStop(0.84, "#11141a");
    base.addColorStop(1, "#eef3f7");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bands = [
      { x: 44, width: 74, alpha: 0.86, color: "#ffffff" },
      { x: 154, width: 148, alpha: 0.86, color: "#02040a" },
      { x: 344, width: 54, alpha: 0.9, color: "#ffffff" },
      { x: 500, width: 168, alpha: 0.82, color: "#080b12" },
      { x: 704, width: 78, alpha: 0.78, color: "#ffffff" },
      { x: 850, width: 96, alpha: 0.38, color: "#dfe8ef" },
    ];

    bands.forEach((band) => {
      const gradient = ctx.createLinearGradient(band.x, 0, band.x + band.width, 0);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.28, band.color);
      gradient.addColorStop(0.72, band.color);
      gradient.addColorStop(1, "transparent");
      ctx.globalAlpha = band.alpha;
      ctx.fillStyle = gradient;
      ctx.fillRect(band.x - band.width * 0.4, 0, band.width * 1.8, canvas.height);
    });

    ctx.globalAlpha = 0.82;
    const horizon = ctx.createLinearGradient(0, 210, canvas.width, 300);
    horizon.addColorStop(0, "rgba(255,255,255,0)");
    horizon.addColorStop(0.22, "rgba(255,255,255,0.86)");
    horizon.addColorStop(0.42, "rgba(2,4,8,0.96)");
    horizon.addColorStop(0.62, "rgba(255,255,255,0.9)");
    horizon.addColorStop(0.82, "rgba(15,18,24,0.82)");
    horizon.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 218, canvas.width, 70);

    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.46;
    const glow = ctx.createRadialGradient(740, 118, 0, 740, 118, 280);
    glow.addColorStop(0, "rgba(232,242,248,0.88)");
    glow.addColorStop(0.36, "rgba(255,255,255,0.82)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(440, 0, 584, 300);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  async function setupClientCubeScene() {
    const host = clientCubeRef.value;
    if (!host || clientCubeCleanup) return;

    const setupToken = ++clientCubeSetupToken;
    let disposePartial: (() => void) | null = null;

    try {
      const THREE = await import("three");
      if (
        setupToken !== clientCubeSetupToken
        || clientCubeRef.value !== host
        || !host.isConnected
      ) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      let environment: import("three").CanvasTexture | null = null;
      let pmrem: import("three").PMREMGenerator | null = null;
      let envTarget: import("three").WebGLRenderTarget | null = null;
      let cubeGeometry: import("three").BoxGeometry | null = null;
      let edgeGeometry: import("three").EdgesGeometry | null = null;
      const cubeRecords: Array<{
        edgeMaterial: import("three").LineBasicMaterial;
        fly: import("three").Vector3;
        home: import("three").Vector3;
        materials: import("three").MeshPhysicalMaterial[];
        mesh: import("three").Mesh;
        order: number;
        scale: number;
        visibleStage: number;
      }> = [];
      let frameId = 0;
      let resizeObserver: ResizeObserver | null = null;
      let intersectionObserver: IntersectionObserver | null = null;
      let motionPreference: MediaQueryList | null = null;
      let motionPreferenceListener: ((event: MediaQueryListEvent) => void) | null = null;

      disposePartial = () => {
        if (frameId) cancelAnimationFrame(frameId);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        if (motionPreference && motionPreferenceListener) {
          motionPreference.removeEventListener("change", motionPreferenceListener);
        }
        cubeGeometry?.dispose();
        edgeGeometry?.dispose();
        cubeRecords.forEach(({ edgeMaterial, materials }) => {
          edgeMaterial.dispose();
          materials.forEach((material) => material.dispose());
        });
        environment?.dispose();
        envTarget?.dispose();
        pmrem?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        if (clientCubeCleanup === disposePartial) {
          clientCubeCleanup = null;
          updateClientCubeStage = null;
        }
      };
      clientCubeCleanup = disposePartial;

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.98;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const cameraViewHeight = 4.25;
      const camera = new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 100);
      camera.position.set(4.8, 4.1, 4.8);
      camera.lookAt(0, 0, 0);

      environment = createClientCubeEnvironment(THREE);
      pmrem = new THREE.PMREMGenerator(renderer);
      envTarget = environment ? pmrem.fromEquirectangular(environment) : null;
      const envMap = envTarget?.texture || null;
      if (envMap) scene.environment = envMap;

      const ambient = new THREE.AmbientLight(0xffffff, 0.42);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
      keyLight.position.set(3.8, 4.4, 5.2);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xe9f4f8, 1.15);
      rimLight.position.set(-4.4, 2.4, -3.2);
      scene.add(rimLight);

      const rootGroup = new THREE.Group();
      rootGroup.position.set(1.32, 0, 0);
      rootGroup.rotation.set(0, 0, 0);
      scene.add(rootGroup);

      cubeGeometry = new THREE.BoxGeometry(0.54, 0.54, 0.54);
      edgeGeometry = new THREE.EdgesGeometry(cubeGeometry, 18);
      const spacing = 0.66;
      const faceColors = [0xffffff, 0xffffff, 0x9ca0a6, 0xffffff, 0xffffff, 0xffffff];
      const mediumBusinessCubeMask = [
        [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        [
          [true, true, true],
          [true, true, false],
          [true, false, false],
        ],
        [
          [true, true, false],
          [true, false, false],
          [false, false, false],
        ],
      ];

      for (let layer = 0; layer < 3; layer += 1) {
        for (let row = 0; row < 3; row += 1) {
          for (let column = 0; column < 3; column += 1) {
            const visibleStage = layer === 0 ? 0 : mediumBusinessCubeMask[layer]?.[row]?.[column] ? 1 : 2;
            const materials = faceColors.map((color, faceIndex) => new THREE.MeshPhysicalMaterial({
              clearcoat: 0.92,
              clearcoatRoughness: faceIndex === 2 ? 0.08 : 0.045,
              color,
              envMap,
              envMapIntensity: faceIndex === 2 ? 1.35 : 1.7,
              metalness: 0.08,
              opacity: 0,
              reflectivity: 0.55,
              roughness: faceIndex === 2 ? 0.42 : 0.24,
              specularIntensity: faceIndex === 2 ? 0.72 : 0.95,
              transparent: true,
            }));
            const mesh = new THREE.Mesh(cubeGeometry, materials);
            const edgeMaterial = new THREE.LineBasicMaterial({
              color: 0x8c949d,
              opacity: 0,
              transparent: true,
            });
            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            edges.renderOrder = 2;
            mesh.add(edges);

            const home = new THREE.Vector3(
              (column - 1) * spacing,
              (layer - 1) * spacing,
              (row - 1) * spacing,
            );
            const fly = home.clone().add(new THREE.Vector3(
              3.1 + row * 0.24 + column * 0.08,
              0.34 + (column - 1) * 0.16 + layer * 0.08,
              0.64 - row * 0.12 + layer * 0.06,
            ));
            const order = column * 9 + row * 3 + layer;

            mesh.position.copy(fly);
            mesh.scale.setScalar(0.18);
            mesh.visible = false;
            rootGroup.add(mesh);
            cubeRecords.push({ edgeMaterial, fly, home, materials, mesh, order, scale: 0.18, visibleStage });
          }
        }
      }

      motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reduceMotion = motionPreference.matches;
      let isVisible = true;
      let lastFrame = performance.now();
      let currentStage = clampValue(activeClientSegment.value, 0, clientSegments.length - 1);
      let transitionFromStage = currentStage;
      let stageChangedAt = performance.now();

      const render = () => renderer.render(scene, camera);
      const setStage = (index: number, immediate = false) => {
        const nextStage = clampValue(index, 0, clientSegments.length - 1);
        transitionFromStage = immediate ? nextStage : currentStage;
        currentStage = nextStage;
        stageChangedAt = performance.now();
        cubeRecords.forEach((record) => {
          const shouldShow = record.visibleStage <= currentStage;
          if (immediate || reduceMotion) {
            record.mesh.position.copy(shouldShow ? record.home : record.fly);
            record.scale = shouldShow ? 1 : 0.18;
            record.mesh.scale.setScalar(record.scale);
            record.materials.forEach((material) => { material.opacity = shouldShow ? 1 : 0; });
            record.edgeMaterial.opacity = shouldShow ? 0.36 : 0;
            record.mesh.visible = shouldShow;
          } else if (shouldShow) {
            record.mesh.visible = true;
          }
        });
        if (immediate || reduceMotion) render();
      };
      updateClientCubeStage = setStage;

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.left = -(cameraViewHeight * aspect) / 2;
        camera.right = (cameraViewHeight * aspect) / 2;
        camera.top = cameraViewHeight / 2;
        camera.bottom = -cameraViewHeight / 2;
        camera.updateProjectionMatrix();
        render();
      };

      const tick = (now: number) => {
        const frame = clampValue((now - lastFrame) / 16.67, 0, 2.2);
        lastFrame = now;

        if (isVisible) {
          cubeRecords.forEach((record) => {
            const delay = record.order * 34;
            let shouldShow = record.visibleStage <= currentStage;
            if (shouldShow && currentStage > transitionFromStage && record.visibleStage > transitionFromStage) {
              shouldShow = now >= stageChangedAt + delay;
            }
            if (!shouldShow && currentStage < transitionFromStage && record.visibleStage <= transitionFromStage) {
              shouldShow = now < stageChangedAt + delay;
            }
            const target = shouldShow ? record.home : record.fly;
            const moveEase = (shouldShow ? 0.085 : 0.07) * frame;
            record.mesh.position.lerp(target, moveEase);
            record.scale += ((shouldShow ? 1 : 0.18) - record.scale) * 0.1 * frame;
            record.mesh.scale.setScalar(record.scale);
            record.materials.forEach((material) => {
              material.opacity += ((shouldShow ? 1 : 0) - material.opacity) * 0.12 * frame;
            });
            record.edgeMaterial.opacity += ((shouldShow ? 0.36 : 0) - record.edgeMaterial.opacity) * 0.12 * frame;
            record.mesh.visible = shouldShow || record.materials[0].opacity > 0.02;
          });

          render();
        }

        frameId = requestAnimationFrame(tick);
      };

      motionPreferenceListener = (event) => {
        reduceMotion = event.matches;
        if (reduceMotion) {
          if (frameId) cancelAnimationFrame(frameId);
          frameId = 0;
          setStage(currentStage, true);
          return;
        }

        if (!frameId) {
          lastFrame = performance.now();
          frameId = requestAnimationFrame(tick);
        }
      };
      motionPreference.addEventListener("change", motionPreferenceListener);

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
      });
      intersectionObserver.observe(host);
      resize();
      setStage(currentStage, true);
      if (!reduceMotion) frameId = requestAnimationFrame(tick);
    } catch (error) {
      if (setupToken !== clientCubeSetupToken || clientCubeRef.value !== host) return;
      disposePartial?.();
      console.info("VEZHA client cube 3D fallback is inactive:", error);
      host.hidden = true;
    }
  }

  function updateClientCubePosition() {
    const host = clientCubeRef.value;
    const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
    if (!host || !grid) return;

    if (window.innerWidth <= 900) {
      host.style.removeProperty("--client-cube-left");
      host.style.removeProperty("--client-cube-top");
      return;
    }

    const section = grid.closest<HTMLElement>("#clients");
    const connector = grid.querySelector<HTMLElement>(".vz-client-connector");
    const gridRect = grid.getBoundingClientRect();
    const sectionRect = section?.getBoundingClientRect() || gridRect;
    const connectorRect = connector?.getBoundingClientRect();
    const cubeRect = host.getBoundingClientRect();
    const cubeWidth = cubeRect.width || host.offsetWidth;
    const cubeHeight = cubeRect.height || host.offsetHeight;
    if (!cubeWidth || !cubeHeight) return;

    const upperLineY = connectorRect?.bottom || gridRect.top;
    const lowerLineY = sectionRect.bottom;
    const targetViewportY = (upperLineY + lowerLineY) / 2;
    const cubeVisualCenterRatio = 0.62;
    const nextLeft = `${Math.round(gridRect.width - cubeWidth)}px`;
    const nextTop = `${Math.round(targetViewportY - gridRect.top - cubeHeight * cubeVisualCenterRatio)}px`;

    if (host.style.getPropertyValue("--client-cube-left") !== nextLeft) {
      host.style.setProperty("--client-cube-left", nextLeft);
    }
    if (host.style.getPropertyValue("--client-cube-top") !== nextTop) {
      host.style.setProperty("--client-cube-top", nextTop);
    }
  }

  function setStage(index: number) {
    updateClientCubeStage?.(index);
  }

  function cleanup() {
    clientCubeSetupToken += 1;
    clientCubeCleanup?.();
    clientCubeCleanup = null;
    updateClientCubeStage = null;
  }

  return {
    setup: setupClientCubeScene,
    updatePosition: updateClientCubePosition,
    setStage,
    cleanup,
  };
}
