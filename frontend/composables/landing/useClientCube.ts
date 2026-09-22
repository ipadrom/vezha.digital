import { onBeforeUnmount, ref, type ComputedRef, type Ref } from "vue";
import { clampValue } from "~/utils/landingLayout";
import {
  getLandingPresentationScale,
  syncThreeRendererPixelRatio,
} from "~/utils/threeRenderQuality";

type ThreeModule = typeof import("three");

type UseClientCubeOptions = {
  rootRef: Ref<HTMLElement | null>;
  activeClientSegment: Ref<number>;
  clientSegments: ComputedRef<unknown[]>;
};

export function useClientCube(options: UseClientCubeOptions) {
  const { rootRef, activeClientSegment, clientSegments } = options;
  const clientCubeRef = ref<HTMLElement | null>(null);
  let clientCubeCleanup: (() => void) | null = null;
  let clientCubeSetupToken = 0;
  let updateClientCubeStage: ((index: number) => void) | null = null;
  let clientLayoutResizeObserver: ResizeObserver | null = null;
  let clientLayoutMotionCleanup: (() => void) | null = null;
  let clientLayoutMotionRaf = 0;

  function setClientCubeHost(element: HTMLElement | null) {
    clientCubeRef.value = element;
  }

  function setClientCubeStage(index: number) {
    updateClientCubeStage?.(index);
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

  async function setupClientCubeScene(): Promise<boolean> {
    const host = clientCubeRef.value;
    if (!host) return false;
    if (clientCubeCleanup) return true;
    const setupToken = ++clientCubeSetupToken;

    try {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
      if (
        setupToken !== clientCubeSetupToken
        || clientCubeRef.value !== host
        || !host.isConnected
      ) return false;
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      syncThreeRendererPixelRatio(renderer, host);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const cameraViewHeight = 4.25;
      const camera = new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 100);
      camera.position.set(4.8, 4.1, 4.8);
      camera.lookAt(0, 0, 0);

      const environment = createClientCubeEnvironment(THREE);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTarget = environment ? pmrem.fromEquirectangular(environment) : null;
      const envMap = envTarget?.texture || null;
      if (envMap) scene.environment = envMap;

      const ambient = new THREE.AmbientLight(0xffffff, 0.34);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
      keyLight.position.set(3.8, 4.4, 5.2);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -3.6;
      keyLight.shadow.camera.right = 3.6;
      keyLight.shadow.camera.top = 3.6;
      keyLight.shadow.camera.bottom = -3.6;
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 18;
      keyLight.shadow.bias = -0.00045;
      keyLight.shadow.normalBias = 0.024;
      keyLight.shadow.radius = 4;
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xe9f7ff, 2.05);
      rimLight.position.set(-4.4, 2.4, -3.2);
      scene.add(rimLight);
      const fillLight = new THREE.DirectionalLight(0xaedfff, 0.82);
      fillLight.position.set(-2.6, -1.2, 4.6);
      scene.add(fillLight);
      const glintLight = new THREE.PointLight(0xf7fbff, 11.5, 11, 2.1);
      glintLight.position.set(4.8, 5.4, 4.6);
      scene.add(glintLight);

      const rootGroup = new THREE.Group();
      rootGroup.position.set(1.32, 0, 0);
      rootGroup.rotation.set(0, 0, 0);
      scene.add(rootGroup);
      keyLight.target = rootGroup;
      rimLight.target = rootGroup;
      fillLight.target = rootGroup;

      const contactShadowCanvas = document.createElement("canvas");
      contactShadowCanvas.width = 384;
      contactShadowCanvas.height = 384;
      const contactShadowContext = contactShadowCanvas.getContext("2d");
      if (contactShadowContext) {
        const contactGradient = contactShadowContext.createRadialGradient(192, 192, 10, 192, 192, 178);
        contactGradient.addColorStop(0, "rgba(28, 39, 48, 0.3)");
        contactGradient.addColorStop(0.36, "rgba(39, 53, 64, 0.19)");
        contactGradient.addColorStop(0.72, "rgba(56, 72, 84, 0.07)");
        contactGradient.addColorStop(1, "rgba(56, 72, 84, 0)");
        contactShadowContext.fillStyle = contactGradient;
        contactShadowContext.fillRect(0, 0, 384, 384);
      }
      const contactShadowTexture = new THREE.CanvasTexture(contactShadowCanvas);
      contactShadowTexture.colorSpace = THREE.SRGBColorSpace;
      const contactShadowGeometry = new THREE.PlaneGeometry(3.2, 2.8);
      const contactShadowMaterial = new THREE.MeshBasicMaterial({
        depthWrite: false,
        map: contactShadowTexture,
        opacity: 0.78,
        transparent: true,
      });
      const contactShadow = new THREE.Mesh(contactShadowGeometry, contactShadowMaterial);
      contactShadow.position.set(-0.26, -0.965, -0.1);
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.renderOrder = -1;
      rootGroup.add(contactShadow);

      const shadowCatcherGeometry = new THREE.PlaneGeometry(4.2, 4.2);
      const shadowCatcherMaterial = new THREE.ShadowMaterial({
        color: 0x273743,
        opacity: 0.16,
        transparent: true,
      });
      const shadowCatcher = new THREE.Mesh(shadowCatcherGeometry, shadowCatcherMaterial);
      shadowCatcher.position.set(0, -0.975, 0);
      shadowCatcher.rotation.x = -Math.PI / 2;
      shadowCatcher.receiveShadow = true;
      shadowCatcher.renderOrder = -2;
      rootGroup.add(shadowCatcher);

      const cubeGeometry = new RoundedBoxGeometry(0.54, 0.54, 0.54, 5, 0.052);
      const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry, 32);
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
      const spacing = 0.66;
      const faceColors = [0xcbd0d5, 0xb8bec5, 0xe6e9ec, 0x9299a1, 0xd6dade, 0xbfc5cb];
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
              clearcoat: 1,
              clearcoatRoughness: faceIndex === 2 ? 0.035 : 0.055,
              color,
              dithering: true,
              envMap,
              envMapIntensity: faceIndex === 2 ? 3.1 : 2.65,
              metalness: 0.96,
              reflectivity: 1,
              roughness: faceIndex === 2 ? 0.1 : faceIndex === 3 ? 0.22 : 0.145,
              specularIntensity: 1,
              transparent: false,
            }));
            const mesh = new THREE.Mesh(cubeGeometry, materials);
            const edgeMaterial = new THREE.LineBasicMaterial({
              color: 0x343a41,
              opacity: 0.46,
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
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = false;
            rootGroup.add(mesh);
            cubeRecords.push({ edgeMaterial, fly, home, materials, mesh, order, scale: 0.18, visibleStage });
          }
        }
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let frameId = 0;
      let isVisible = true;
      let lastFrame = performance.now();
      let currentStage = clampValue(activeClientSegment.value, 0, clientSegments.value.length - 1);
      let transitionFromStage = currentStage;
      let stageChangedAt = performance.now();
      keyLight.position.set(4.8, 5.2, 5.6);
      glintLight.position.set(5.2, 5.7, 4.2);
      rimLight.position.set(-4.4, 2.4, -3.2);
      contactShadow.position.set(-0.26, -0.965, -0.1);
      scene.environmentRotation.y = -0.28;

      const render = () => renderer.render(scene, camera);
      const setStage = (index: number, immediate = false) => {
        const nextStage = clampValue(index, 0, clientSegments.value.length - 1);
        transitionFromStage = immediate ? nextStage : currentStage;
        currentStage = nextStage;
        stageChangedAt = performance.now();
        cubeRecords.forEach((record) => {
          const shouldShow = record.visibleStage <= currentStage;
          if (immediate || reduceMotion) {
            record.mesh.position.copy(shouldShow ? record.home : record.fly);
            record.scale = shouldShow ? 1 : 0.18;
            record.mesh.scale.setScalar(record.scale);
            record.mesh.visible = shouldShow;
          }
        });
        if (immediate || reduceMotion) render();
      };
      updateClientCubeStage = setStage;

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        syncThreeRendererPixelRatio(renderer, host);
        renderer.setSize(width, height, false);
        const aspect = width / height;
        const baseAspect = 1.08;
        camera.left = -(cameraViewHeight * baseAspect) / 2;
        camera.right = camera.left + cameraViewHeight * aspect;
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
            const isAtHiddenRest = record.scale <= 0.205
              && record.mesh.position.distanceToSquared(record.fly) <= 0.0025;
            record.mesh.visible = shouldShow || !isAtHiddenRest;
          });

          render();
        }

        frameId = requestAnimationFrame(tick);
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const viewport = window.visualViewport;
      window.addEventListener("resize", resize, { passive: true });
      viewport?.addEventListener("resize", resize, { passive: true });
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
      });
      intersectionObserver.observe(host);
      resize();
      setStage(currentStage, true);
      if (!reduceMotion) frameId = requestAnimationFrame(tick);

      clientCubeCleanup = () => {
        if (frameId) cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        window.removeEventListener("resize", resize);
        viewport?.removeEventListener("resize", resize);
        intersectionObserver.disconnect();
        if (updateClientCubeStage === setStage) updateClientCubeStage = null;
        cubeGeometry.dispose();
        edgeGeometry.dispose();
        contactShadowGeometry.dispose();
        contactShadowMaterial.dispose();
        contactShadowTexture.dispose();
        shadowCatcherGeometry.dispose();
        shadowCatcherMaterial.dispose();
        cubeRecords.forEach(({ edgeMaterial, materials }) => {
          edgeMaterial.dispose();
          materials.forEach((material) => material.dispose());
        });
        environment?.dispose();
        envTarget?.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        clientCubeCleanup = null;
      };
      return true;
    } catch (error) {
      if (setupToken !== clientCubeSetupToken || clientCubeRef.value !== host) return false;
      console.info("VEZHA client cube 3D fallback is inactive:", error);
      if (host.isConnected) host.hidden = true;
      return false;
    }
  }

  function updateClientCubePosition() {
    const host = clientCubeRef.value;
    const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
    if (!host || !grid) return;

    if (window.innerWidth <= 900) {
      host.style.removeProperty("--client-cube-left");
      host.style.removeProperty("--client-cube-top");
      grid.style.removeProperty("--client-content-height");
      grid.querySelector<HTMLElement>(".vz-clients__head")
        ?.style.removeProperty("--client-head-y");
      grid.querySelector<HTMLElement>(".vz-client-copy")
        ?.style.removeProperty("--client-copy-y");
      return;
    }

    const headingGroup = grid.querySelector<HTMLElement>(".vz-clients__head");
    const heading = headingGroup?.querySelector<HTMLElement>("h2");
    const activeTitle = grid.querySelector<HTMLElement>(".vz-client-copy h3");
    const activeCard = grid.querySelector<HTMLElement>(".vz-client-card-slot");
    const cardReserve = grid.querySelector<HTMLElement>(".vz-client-card-reserve");
    const capsules = grid.querySelector<HTMLElement>(".vz-client-capsules");
    const gridRect = grid.getBoundingClientRect();
    const headingRect = heading?.getBoundingClientRect();
    const titleRect = activeTitle?.getBoundingClientRect();
    const cardRect = activeCard?.getBoundingClientRect();
    const capsulesRect = capsules?.getBoundingClientRect();
    const cubeRect = host.getBoundingClientRect();
    const presentationScale = getLandingPresentationScale(host);
    const cubeWidth = cubeRect.width / presentationScale || host.offsetWidth;
    const cubeHeight = cubeRect.height / presentationScale || host.offsetHeight;
    const reservedCardBottom = cardReserve?.getBoundingClientRect().bottom
      ?? activeCard?.getBoundingClientRect().bottom
      ?? gridRect.top;
    const nextContentHeight = `${Math.ceil((reservedCardBottom - gridRect.top) / presentationScale)}px`;

    if (grid.style.getPropertyValue("--client-content-height") !== nextContentHeight) {
      grid.style.setProperty("--client-content-height", nextContentHeight);
    }
    if (!cubeWidth || !cubeHeight || !headingRect) return;

    const targetViewportY = titleRect && cardRect
      ? (titleRect.bottom + cardRect.top) / 2
      : headingRect.top + headingRect.height / 2;

    if (headingGroup) {
      const renderedHeadOffset = Number.parseFloat(
        getComputedStyle(headingGroup).getPropertyValue("--client-head-y"),
      ) || 0;
      const currentHeadingCenter = headingRect.top + headingRect.height / 2;
      const nextHeadOffset = `${Math.round(
        renderedHeadOffset + (targetViewportY - currentHeadingCenter) / presentationScale,
      )}px`;
      if (headingGroup.style.getPropertyValue("--client-head-y") !== nextHeadOffset) {
        headingGroup.style.setProperty("--client-head-y", nextHeadOffset);
      }
    }

    const cubeVisualCenterRatio = 0.62;
    const rightSceneRoom = Math.max(0, cubeWidth - cubeHeight * 1.08);
    const targetRightWithinGrid = (
      (capsulesRect?.right ?? gridRect.right) - gridRect.left
    ) / presentationScale;
    // The canvas reserves transparent space on the right, so align the visible cube edge.
    const nextLeft = `${Math.round(targetRightWithinGrid - cubeWidth + rightSceneRoom)}px`;
    const nextTop = `${Math.round(
      (targetViewportY - gridRect.top) / presentationScale - cubeHeight * cubeVisualCenterRatio,
    )}px`;

    if (host.style.getPropertyValue("--client-cube-left") !== nextLeft) {
      host.style.setProperty("--client-cube-left", nextLeft);
    }
    if (host.style.getPropertyValue("--client-cube-top") !== nextTop) {
      host.style.setProperty("--client-cube-top", nextTop);
    }
  }

  function setupClientLayoutObserver() {
    if (clientLayoutResizeObserver || !("ResizeObserver" in window)) return;
    const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
    const heading = grid?.querySelector<HTMLElement>(".vz-clients__head h2");
    if (!grid || !heading) return;

    clientLayoutResizeObserver = new ResizeObserver(updateClientCubePosition);
    clientLayoutResizeObserver.observe(grid);
    clientLayoutResizeObserver.observe(heading);

    const section = grid.closest<HTMLElement>(".vz-clients");
    if (section && !clientLayoutMotionCleanup) {
      const handleMotionEnd = () => {
        if (clientLayoutMotionRaf) cancelAnimationFrame(clientLayoutMotionRaf);
        clientLayoutMotionRaf = requestAnimationFrame(() => {
          clientLayoutMotionRaf = 0;
          updateClientCubePosition();
        });
      };

      section.addEventListener("animationend", handleMotionEnd);
      clientLayoutMotionCleanup = () => {
        section.removeEventListener("animationend", handleMotionEnd);
        if (clientLayoutMotionRaf) cancelAnimationFrame(clientLayoutMotionRaf);
        clientLayoutMotionRaf = 0;
        clientLayoutMotionCleanup = null;
      };
    }
  }

  onBeforeUnmount(() => {
    clientCubeSetupToken += 1;
    clientLayoutResizeObserver?.disconnect();
    clientLayoutMotionCleanup?.();
    clientCubeCleanup?.();
  });

  return {
    setClientCubeHost,
    setClientCubeStage,
    setupClientCubeScene,
    setupClientLayoutObserver,
    updateClientCubePosition,
  };
}
