import { watch, type ComputedRef, type Ref } from "vue";
import {
  BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE,
  BACKEND_STACK_LABEL_REVEAL_DISTANCE_PX,
  DESKTOP_STACK_LABEL_ROUTE_DURATION_MS,
  MOBILE_ORBIT_TECH,
  MOBILE_ORBIT_TRACKS,
  getCompactMobileRootRotation,
  getBackendStackLabelClearanceFactor,
  getDesktopStackLabelRouteState,
  getMobileLabelDepthStyle,
  getMobileOrbitPoint,
  getMobileTechnologyPoint,
  getStackGroupScale,
  getStackLayerTargets,
  resolveMobileOrbitMode,
  type MobileOrbitId,
  type StackVisualLayer,
} from "~/utils/landingStackOrbit";

type ThreeModule = typeof import("three");

type UseLandingStackSphereOptions = {
  hostRef: Ref<HTMLElement | null>;
  activeLayer: ComputedRef<StackVisualLayer> | Ref<StackVisualLayer>;
};

export function useLandingStackSphere(options: UseLandingStackSphereOptions) {
  const stackSphereRef = options.hostRef;
  const activeStackLayer = options.activeLayer;
  let stackSphereCleanup: (() => void) | null = null;
  let stackSphereSetupToken = 0;
  let renderStaticLayer: (() => void) | null = null;

  watch(activeStackLayer, () => renderStaticLayer?.());

  function clampValue(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function createStackSpherePoints(THREE: ThreeModule, count: number, radius: number, yScale = 1) {
    const points: import("three").Vector3[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < count; index += 1) {
      const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = index * goldenAngle;
      points.push(new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius * yScale,
        Math.sin(theta) * r * radius,
      ));
    }

    return points;
  }

  function createStackSpherePairs(points: import("three").Vector3[], neighbors: number, maxDistance: number) {
    const pairs: Array<[number, number]> = [];
    const seen = new Set<string>();

    points.forEach((point, index) => {
      const nearest = points
        .map((target, targetIndex) => ({
          distance: point.distanceTo(target),
          targetIndex,
        }))
        .filter((item) => item.targetIndex !== index && item.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, neighbors);

      nearest.forEach(({ targetIndex }) => {
        const a = Math.min(index, targetIndex);
        const b = Math.max(index, targetIndex);
        const key = `${a}:${b}`;
        if (seen.has(key)) return;
        seen.add(key);
        pairs.push([a, b]);
      });
    });

    return pairs;
  }

  function createStackLineGeometry(THREE: ThreeModule, points: import("three").Vector3[], pairs: Array<[number, number]>) {
    const positions: number[] = [];

    pairs.forEach(([a, b]) => {
      positions.push(points[a].x, points[a].y, points[a].z, points[b].x, points[b].y, points[b].z);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }

  function createStackBridgeGeometry(THREE: ThreeModule, corePoints: import("three").Vector3[], surfacePoints: import("three").Vector3[]) {
    const positions: number[] = [];
    const surfaceRadiusX = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.x)), 0);
    const surfaceRadiusY = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.y)), 0);
    const surfaceRadiusZ = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.z)), 0);
    const inset = 0.92;

    corePoints.forEach((point, index) => {
      if (index % 2 !== 0) return;

      const direction = point.clone().normalize();
      const distanceToSurface = 1 / Math.sqrt(
        (direction.x * direction.x) / (surfaceRadiusX * surfaceRadiusX)
        + (direction.y * direction.y) / (surfaceRadiusY * surfaceRadiusY)
        + (direction.z * direction.z) / (surfaceRadiusZ * surfaceRadiusZ),
      );
      const surface = direction.multiplyScalar(distanceToSurface * inset);
      positions.push(point.x, point.y, point.z, surface.x, surface.y, surface.z);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }

  async function setupStackSphereScene() {
    const host = stackSphereRef.value;
    if (!host || stackSphereCleanup) return;

    const setupToken = ++stackSphereSetupToken;
    let disposePartial: (() => void) | null = null;

    try {
      const THREE = await import("three");
      if (
        setupToken !== stackSphereSetupToken
        || stackSphereRef.value !== host
        || !host.isConnected
      ) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      const labelLayer = document.createElement("div");
      const geometries: import("three").BufferGeometry[] = [];
      const trackedMaterials: Array<{
        baseOpacity: number;
        layer: "surface" | "core" | "bridge";
        material: import("three").Material & { opacity: number };
      }> = [];
      const orbitMaterials: Array<import("three").Material> = [];
      let frameId = 0;
      let positionInterval = 0;
      let resizeObserver: ResizeObserver | null = null;
      let layoutObserver: ResizeObserver | null = null;
      let viewport: VisualViewport | null = null;
      let intersectionObserver: IntersectionObserver | null = null;
      let motionPreference: MediaQueryList | null = null;
      let motionPreferenceListener: ((event: MediaQueryListEvent) => void) | null = null;
      const backendLabelRevealStates = new Map<
        HTMLElement,
        { factor: number; lastX: number }
      >();

      disposePartial = () => {
        if (frameId) cancelAnimationFrame(frameId);
        if (positionInterval) window.clearInterval(positionInterval);
        resizeObserver?.disconnect();
        layoutObserver?.disconnect();
        viewport?.removeEventListener("resize", updateStackSpherePosition);
        viewport?.removeEventListener("scroll", updateStackSpherePosition);
        intersectionObserver?.disconnect();
        if (motionPreference && motionPreferenceListener) {
          motionPreference.removeEventListener("change", motionPreferenceListener);
        }
        geometries.forEach((geometry) => geometry.dispose());
        trackedMaterials.forEach(({ material }) => material.dispose());
        orbitMaterials.forEach((material) => material.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        labelLayer.remove();
        renderStaticLayer = null;
        if (stackSphereCleanup === disposePartial) stackSphereCleanup = null;
      };
      stackSphereCleanup = disposePartial;

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      labelLayer.className = "vz-stack__sphere-labels";
      labelLayer.setAttribute("aria-hidden", "true");
      host.replaceChildren(renderer.domElement, labelLayer);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 5.7);

      const rootGroup = new THREE.Group();
      rootGroup.rotation.set(-0.16, -0.4, 0.08);
      const desktopLabelRoutesGroup = new THREE.Group();
      scene.add(rootGroup, desktopLabelRoutesGroup);

      const surfaceGroup = new THREE.Group();
      const bridgeGroup = new THREE.Group();
      const coreGroup = new THREE.Group();
      const desktopOrbitGroup = new THREE.Group();
      desktopOrbitGroup.rotation.set(1.02, 0.28, -0.22);
      const compactOrbitGroups: Record<MobileOrbitId, import("three").Group> = {
        outer: new THREE.Group(),
        inner: new THREE.Group(),
      };
      (Object.keys(compactOrbitGroups) as MobileOrbitId[]).forEach((orbit) => {
        compactOrbitGroups[orbit].rotation.set(...MOBILE_ORBIT_TRACKS[orbit].rotation);
      });
      rootGroup.add(
        bridgeGroup,
        surfaceGroup,
        coreGroup,
        desktopOrbitGroup,
        compactOrbitGroups.outer,
        compactOrbitGroups.inner,
      );

      const trackedGroups = [
        { group: surfaceGroup, layer: "surface" as const, scale: 1 },
        { group: coreGroup, layer: "core" as const, scale: 1 },
        { group: bridgeGroup, layer: "bridge" as const, scale: 1 },
      ];

      const trackMaterial = <T extends import("three").Material & { opacity: number }>(
        material: T,
        layer: "surface" | "core" | "bridge",
        baseOpacity: number,
      ) => {
        material.transparent = true;
        material.depthWrite = false;
        material.opacity = baseOpacity * 0.16;
        trackedMaterials.push({ baseOpacity, layer, material });
        return material;
      };

      const surfacePoints = createStackSpherePoints(THREE, 118, 1.62, 0.98);
      const corePoints = createStackSpherePoints(THREE, 72, 0.62, 1);
      const frontendTechIcons = [
        {
          color: "#61DAFB",
          label: "React",
          path: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z",
        },
        {
          color: "#4FC08D",
          label: "Vue 3",
          path: "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z",
        },
        {
          color: "#111318",
          label: "Next.js",
          path: "M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z",
        },
        {
          color: "#3178C6",
          label: "TypeScript",
          path: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
        },
        {
          color: "#06B6D4",
          label: "Tailwind",
          path: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z",
        },
      ];
      const frontendLabelSpecs = frontendTechIcons.map((icon, index) => ({
        ...icon,
        angle: 2.75 - index * 0.56,
        element: document.createElement("span"),
        y: [0.66, 0.28, -0.08, 0.46, -0.48][index] || 0,
      }));
      const frontendLabelPoints = frontendLabelSpecs.flatMap((spec, index) => {
        const icon = document.createElement("span");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const text = document.createElement("span");

        spec.element.className = "vz-stack__sphere-label";
        icon.className = "vz-stack__sphere-label-icon";
        icon.style.setProperty("--stack-tech-color", spec.color);
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("viewBox", "0 0 24 24");
        path.setAttribute("d", spec.path);
        svg.appendChild(path);
        icon.appendChild(svg);
        text.className = "vz-stack__sphere-label-text";
        text.textContent = spec.label;
        spec.element.append(icon, text);
        labelLayer.appendChild(spec.element);
        const point = new THREE.Vector3(Math.cos(spec.angle) * 1.72, spec.y, Math.sin(spec.angle) * 1.62);
        const loopElement = spec.element.cloneNode(true) as HTMLSpanElement;
        labelLayer.appendChild(loopElement);

        return [{
          ...spec,
          desktopRouteCount: frontendLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: true,
          point,
          layer: "surface" as const,
          projectionGroup: rootGroup,
        }, {
          ...spec,
          desktopRouteCount: frontendLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: false,
          element: loopElement,
          point: new THREE.Vector3(-point.x, point.y, -point.z),
          layer: "surface" as const,
          projectionGroup: rootGroup,
        }];
      });
      const coreLabelSpecs = [
        { color: "#00ADD8", slug: "go", label: "Go", angle: 2.55, y: 0.28 },
        { color: "#008ECF", slug: "gin", label: "Gin", angle: 1.25, y: -0.18 },
        { color: "#4169E1", slug: "postgresql", label: "PostgreSQL", angle: -0.15, y: 0.16 },
        { color: "#DC382D", slug: "redis", label: "Redis", angle: -1.55, y: -0.3 },
      ];
      const coreLabelPoints = coreLabelSpecs.flatMap((spec, index) => {
        const element = document.createElement("span");
        const icon = document.createElement("span");
        const image = document.createElement("img");
        const text = document.createElement("span");
        element.className = "vz-stack__sphere-label vz-stack__sphere-label--core";
        icon.className = "vz-stack__sphere-label-icon vz-stack__sphere-label-icon--text";
        icon.style.setProperty("--stack-tech-color", spec.color);
        image.src = `https://cdn.simpleicons.org/${spec.slug}/ffffff`;
        image.alt = "";
        icon.appendChild(image);
        text.className = "vz-stack__sphere-label-text";
        text.textContent = spec.label;
        element.append(icon, text);
        labelLayer.appendChild(element);
        const point = new THREE.Vector3(Math.cos(spec.angle) * 0.82, spec.y, Math.sin(spec.angle) * 0.76);
        const loopElement = element.cloneNode(true) as HTMLSpanElement;
        labelLayer.appendChild(loopElement);

        return [{
          desktopRouteCount: coreLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: true,
          element,
          point,
          layer: "core" as const,
          projectionGroup: coreGroup,
        }, {
          desktopRouteCount: coreLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: false,
          element: loopElement,
          point: new THREE.Vector3(-point.x, point.y, -point.z),
          layer: "core" as const,
          projectionGroup: coreGroup,
        }];
      });
      const bridgeLabelSpecs = [
        { color: "#2496ED", slug: "docker", label: "Docker", angle: 2.8, y: 0.48 },
        { color: "#009639", slug: "nginx", label: "Nginx", angle: 1.25, y: -0.34 },
        { color: "#7C3AED", slug: "githubactions", label: "CI/CD", angle: -0.2, y: 0.32 },
        { color: "#F5B800", slug: "linux", label: "Linux", angle: -1.7, y: -0.46 },
      ];
      const bridgeStickPositions: number[] = [];
      const bridgeLabelPoints = bridgeLabelSpecs.flatMap((spec, index) => {
        const element = document.createElement("span");
        const icon = document.createElement("span");
        const image = document.createElement("img");
        const text = document.createElement("span");
        element.className = "vz-stack__sphere-label vz-stack__sphere-label--bridge";
        icon.className = "vz-stack__sphere-label-icon vz-stack__sphere-label-icon--text";
        icon.style.setProperty("--stack-tech-color", spec.color);
        image.src = `https://cdn.simpleicons.org/${spec.slug}/ffffff`;
        image.alt = "";
        icon.appendChild(image);
        text.className = "vz-stack__sphere-label-text";
        text.textContent = spec.label;
        element.append(icon, text);
        labelLayer.appendChild(element);

        const directionX = Math.cos(spec.angle);
        const directionZ = Math.sin(spec.angle);
        const point = new THREE.Vector3(directionX * 1.28, spec.y, directionZ * 1.2);
        const anchor = new THREE.Vector3(directionX * 0.82, spec.y * 0.72, directionZ * 0.78);
        bridgeStickPositions.push(anchor.x, anchor.y, anchor.z, point.x, point.y, point.z);
        bridgeStickPositions.push(-anchor.x, anchor.y, -anchor.z, -point.x, point.y, -point.z);

        const loopElement = element.cloneNode(true) as HTMLSpanElement;
        labelLayer.appendChild(loopElement);
        return [{
          desktopRouteCount: bridgeLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: true,
          element,
          point,
          layer: "bridge" as const,
          projectionGroup: bridgeGroup,
        }, {
          desktopRouteCount: bridgeLabelSpecs.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: false,
          element: loopElement,
          point: new THREE.Vector3(-point.x, point.y, -point.z),
          layer: "bridge" as const,
          projectionGroup: bridgeGroup,
        }];
      });
      const bridgeStickGeometry = new THREE.BufferGeometry();
      bridgeStickGeometry.setAttribute("position", new THREE.Float32BufferAttribute(bridgeStickPositions, 3));
      const mobileLabelPoints = MOBILE_ORBIT_TECH.map((spec, index) => {
        const element = document.createElement("span");
        const icon = document.createElement("span");
        const image = document.createElement("img");
        const text = document.createElement("span");
        const orbitPoint = getMobileTechnologyPoint(spec, 0, "desktop");

        element.className = "vz-stack__sphere-label vz-stack__sphere-label--mobile";
        element.dataset.orbit = spec.orbit;
        icon.className = "vz-stack__sphere-label-icon vz-stack__sphere-label-icon--text";
        icon.style.setProperty("--stack-tech-color", spec.color);
        image.src = `https://cdn.simpleicons.org/${spec.slug}/ffffff`;
        image.alt = "";
        icon.appendChild(image);
        text.className = "vz-stack__sphere-label-text";
        text.textContent = spec.label;
        element.append(icon, text);
        labelLayer.appendChild(element);

        return {
          desktopRouteCount: MOBILE_ORBIT_TECH.length,
          desktopRouteIndex: index,
          desktopRoutePrimary: true,
          element,
          point: new THREE.Vector3(orbitPoint.x, orbitPoint.y, orbitPoint.z),
          layer: "mobile" as const,
          orbit: spec.orbit,
          phase: spec.phase,
          desktopPhase: spec.desktopPhase,
          radiusScale: spec.radiusScale,
          projectionGroup: desktopOrbitGroup,
        };
      });
      const stackLabelPoints = [
        ...frontendLabelPoints,
        ...coreLabelPoints,
        ...bridgeLabelPoints,
        ...mobileLabelPoints,
      ];
      const surfacePointGeometry = new THREE.BufferGeometry().setFromPoints(surfacePoints);
      const corePointGeometry = new THREE.BufferGeometry().setFromPoints(corePoints);
      const surfaceLineGeometry = createStackLineGeometry(THREE, surfacePoints, createStackSpherePairs(surfacePoints, 5, 0.72));
      const coreLineGeometry = createStackLineGeometry(THREE, corePoints, createStackSpherePairs(corePoints, 4, 0.52));
      const bridgeGeometry = createStackBridgeGeometry(THREE, corePoints, surfacePoints);
      const coreShellGeometry = new THREE.IcosahedronGeometry(0.68, 3);
      const coreInnerGeometry = new THREE.IcosahedronGeometry(0.34, 2);
      const desktopOrbitPoints = Array.from({ length: 97 }, (_, index) => {
        const point = getMobileOrbitPoint((index / 96) * Math.PI * 2);
        return new THREE.Vector3(point.x, point.y, point.z);
      });
      const desktopOrbitGeometry = new THREE.BufferGeometry().setFromPoints(desktopOrbitPoints);
      const desktopOrbitPulseGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
      ]);
      const desktopOrbitMaterial = new THREE.LineBasicMaterial({
        color: 0x6f7683,
        depthWrite: false,
        opacity: 0,
        transparent: true,
      });
      const desktopOrbitPulseMaterial = new THREE.PointsMaterial({
        color: 0x6fe7ff,
        depthWrite: false,
        opacity: 0,
        size: 0.078,
        sizeAttenuation: true,
        transparent: true,
      });
      const desktopOrbitLine = new THREE.Line(desktopOrbitGeometry, desktopOrbitMaterial);
      const desktopOrbitPulse = new THREE.Points(desktopOrbitPulseGeometry, desktopOrbitPulseMaterial);
      desktopOrbitGroup.add(desktopOrbitLine, desktopOrbitPulse);
      orbitMaterials.push(desktopOrbitMaterial, desktopOrbitPulseMaterial);
      const compactOrbitOpacity: Record<MobileOrbitId, number> = {
        outer: 0.74,
        inner: 0.62,
      };
      const compactOrbitMaterials = {} as Record<MobileOrbitId, import("three").LineBasicMaterial>;
      const compactOrbitGeometries: import("three").BufferGeometry[] = [];
      (Object.keys(compactOrbitGroups) as MobileOrbitId[]).forEach((orbit) => {
        const points = Array.from({ length: 97 }, (_, index) => {
          const point = getMobileOrbitPoint((index / 96) * Math.PI * 2, orbit);
          return new THREE.Vector3(point.x, point.y, point.z);
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: orbit === "outer" ? 0x788392 : 0x5f8c9d,
          depthWrite: false,
          opacity: 0,
          transparent: true,
        });
        compactOrbitGroups[orbit].add(new THREE.Line(geometry, material));
        compactOrbitGeometries.push(geometry);
        compactOrbitMaterials[orbit] = material;
        orbitMaterials.push(material);
      });
      geometries.push(
        surfacePointGeometry,
        corePointGeometry,
        surfaceLineGeometry,
        coreLineGeometry,
        bridgeGeometry,
        coreShellGeometry,
        coreInnerGeometry,
        bridgeStickGeometry,
        desktopOrbitGeometry,
        desktopOrbitPulseGeometry,
        ...compactOrbitGeometries,
      );

      surfaceGroup.add(
        new THREE.LineSegments(
          surfaceLineGeometry,
          trackMaterial(new THREE.LineBasicMaterial({ color: 0x1b1d22 }), "surface", 0.22),
        ),
        new THREE.Points(
          surfacePointGeometry,
          trackMaterial(new THREE.PointsMaterial({ color: 0x17191e, size: 0.036, sizeAttenuation: true }), "surface", 0.8),
        ),
      );

      coreGroup.add(
        new THREE.Mesh(
          coreInnerGeometry,
          trackMaterial(new THREE.MeshBasicMaterial({ color: 0x111318 }), "core", 0.18),
        ),
        new THREE.Mesh(
          coreShellGeometry,
          trackMaterial(new THREE.MeshBasicMaterial({ color: 0x111318, wireframe: true }), "core", 0.28),
        ),
        new THREE.LineSegments(
          coreLineGeometry,
          trackMaterial(new THREE.LineBasicMaterial({ color: 0x111318 }), "core", 0.46),
        ),
        new THREE.Points(
          corePointGeometry,
          trackMaterial(new THREE.PointsMaterial({ color: 0x111318, size: 0.058, sizeAttenuation: true }), "core", 0.96),
        ),
      );

      bridgeGroup.add(
        new THREE.LineSegments(
          bridgeGeometry,
          trackMaterial(new THREE.LineBasicMaterial({ color: 0x5d6470 }), "bridge", 0.34),
        ),
        new THREE.LineSegments(
          bridgeStickGeometry,
          trackMaterial(new THREE.LineBasicMaterial({ color: 0x5d6470 }), "bridge", 0.34),
        ),
      );

      motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reduceMotion = motionPreference.matches;
      let lastFrame = performance.now();
      let lastPositionCheck = 0;
      let isVisible = true;
      positionInterval = window.setInterval(updateStackSpherePosition, 300);

      const resize = () => {
        updateStackSpherePosition();
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (reduceMotion) renderStaticLayer?.();
        else renderer.render(scene, camera);
      };

      const getMobileOrbitMode = () => (
        resolveMobileOrbitMode(activeStackLayer.value, window.innerWidth)
      );
      const isCompactMobile = () => getMobileOrbitMode() === "compact";
      const getLayerTargets = () => (
        getStackLayerTargets(activeStackLayer.value, isCompactMobile())
      );
      const getGroupScale = (layer: "surface" | "core" | "bridge") => (
        getStackGroupScale(layer, activeStackLayer.value, isCompactMobile())
      );
      const updateMobileLabelPoints = (elapsedMs: number) => {
        const mode = getMobileOrbitMode();
        const visibleMode = mode === "compact" ? "compact" : "desktop";
        mobileLabelPoints.forEach((item) => {
          const point = getMobileTechnologyPoint(item, elapsedMs, visibleMode);
          item.point.set(point.x, point.y, point.z);
          item.projectionGroup = mode === "compact"
            ? compactOrbitGroups[item.orbit]
            : desktopOrbitGroup;
        });
      };

      const fadeRange = (value: number, from: number, to: number) => clampValue((value - from) / (to - from), 0, 1);
      const updateStackLabels = (elapsedMs = 0) => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        const compactMobile = isCompactMobile();
        rootGroup.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);

        if (window.innerWidth > 900) {
          desktopLabelRoutesGroup.updateMatrixWorld(true);
          const desktopLayouts = stackLabelPoints.flatMap((item) => {
            const isActive = activeStackLayer.value === item.layer;
            if (!isActive || !item.desktopRoutePrimary) {
              item.element.style.opacity = "0";
              backendLabelRevealStates.delete(item.element);
              return [];
            }

            const route = getDesktopStackLabelRouteState(
              elapsedMs,
              item.desktopRouteIndex,
              item.desktopRouteCount,
              item.layer === "core"
                ? BACKEND_DESKTOP_STACK_LABEL_ROUTE_PROFILE
                : 1,
            );
            const world = new THREE.Vector3(
              route.point.x,
              route.point.y,
              route.point.z,
            );
            desktopLabelRoutesGroup.localToWorld(world);
            const projected = world.clone().project(camera);
            const x = (projected.x * 0.5 + 0.5) * width;
            const y = (-projected.y * 0.5 + 0.5) * height + route.jitterPx;

            return [{
              centerX: x,
              item,
              laneIndex: route.laneIndex,
              route,
              width: item.element.offsetWidth || 84,
              world,
              x,
              y,
            }];
          });
          const backendLayouts = desktopLayouts.filter(({ item }) => (
            item.layer === "core"
          ));

          desktopLayouts.forEach((layout) => {
            const { item, route, world, x, y } = layout;
            let collisionFactor = 1;

            if (item.layer === "core") {
              const targetFactor = getBackendStackLabelClearanceFactor(
                layout,
                backendLayouts,
              );
              const previous = backendLabelRevealStates.get(item.element);

              if (!previous) {
                collisionFactor = targetFactor;
              } else if (targetFactor <= previous.factor) {
                collisionFactor = targetFactor;
              } else {
                const travelledPx = Math.max(0, x - previous.lastX);
                collisionFactor = Math.min(
                  targetFactor,
                  previous.factor
                    + travelledPx / BACKEND_STACK_LABEL_REVEAL_DISTANCE_PX,
                );
              }

              backendLabelRevealStates.set(item.element, {
                factor: collisionFactor,
                lastX: x,
              });
            }

            item.element.style.opacity = (
              route.opacity * collisionFactor
            ).toFixed(3);
            item.element.style.zIndex = String(Math.round(100 + world.z * 20));
            item.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(0.96)`;
          });
          return;
        }

        const projectedLabels = stackLabelPoints.map((item, index) => {
          const world = item.point.clone();
          item.projectionGroup.localToWorld(world);
          const counterpart = item.layer === "mobile"
            ? null
            : stackLabelPoints[index % 2 === 0 ? index + 1 : index - 1];
          const counterpartWorld = counterpart?.point.clone() || null;
          if (counterpart && counterpartWorld) {
            counterpart.projectionGroup.localToWorld(counterpartWorld);
          }
          const projected = world.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;
          const isSurfaceLabel = item.layer === "surface";
          const leftFade = isSurfaceLabel
            ? fadeRange(projected.x, -0.96, -0.89)
            : fadeRange(projected.x, -0.96, -0.84);
          const rightFade = isSurfaceLabel
            ? 1 - fadeRange(projected.x, 0.79, 0.86)
            : 1 - fadeRange(projected.x, 0.72, 0.86);
          const mobileDepthStyle = item.layer === "mobile" && compactMobile
            ? getMobileLabelDepthStyle(world.z)
            : null;
          const frontFade = item.layer === "mobile"
            ? mobileDepthStyle?.opacity ?? 1
            : isSurfaceLabel
              ? fadeRange(world.z, -0.06, 0.08)
              : fadeRange(world.z, -0.12, 0.12);
          const layerVisibility = item.layer === "mobile"
            ? Number(activeStackLayer.value === "mobile")
            : Number(activeStackLayer.value === item.layer);
          const pairVisibility = item.layer === "mobile"
            || (counterpartWorld && (
              world.z > counterpartWorld.z
              || (world.z === counterpartWorld.z && index % 2 === 0)
            ))
            ? 1
            : 0;
          const opacity = clampValue(layerVisibility * pairVisibility * leftFade * rightFade * frontFade, 0, 1);
          const scale = mobileDepthStyle?.scale ?? 0.78 + frontFade * 0.18;

          return {
            item,
            opacity,
            scale,
            worldZ: world.z,
            x,
            y,
            layoutY: y,
          };
        });

        const labelGap = 8;
        const labelEdge = 24;
        const visible = projectedLabels
          .filter((label) => label.opacity > 0.02)
          .sort((a, b) => a.y - b.y);

        for (let index = 1; index < visible.length; index += 1) {
          const current = visible[index];
          for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
            const previous = visible[previousIndex];
            const currentWidth = current.item.element.offsetWidth * current.scale;
            const previousWidth = previous.item.element.offsetWidth * previous.scale;
            const horizontalGap = Math.abs(current.x - previous.x);
            const canOverlapHorizontally = horizontalGap < (currentWidth + previousWidth) / 2 + labelGap;
            if (!canOverlapHorizontally) continue;

            const currentHeight = current.item.element.offsetHeight * current.scale;
            const previousHeight = previous.item.element.offsetHeight * previous.scale;
            current.layoutY = Math.max(
              current.layoutY,
              previous.layoutY + (currentHeight + previousHeight) / 2 + labelGap,
            );
          }
        }

        const overflow = visible.length
          ? Math.max(0, visible[visible.length - 1].layoutY - (height - labelEdge))
          : 0;
        if (overflow) visible.forEach((label) => { label.layoutY -= overflow; });

        const underflow = visible.length ? Math.max(0, labelEdge - visible[0].layoutY) : 0;
        if (underflow) visible.forEach((label) => { label.layoutY += underflow; });

        projectedLabels.forEach(({ item, opacity, scale, worldZ, x, layoutY }) => {
          item.element.style.opacity = opacity.toFixed(3);
          item.element.style.zIndex = String(Math.round(100 + worldZ * 20));
          item.element.style.transform = `translate3d(${x}px, ${layoutY}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        });
      };

      const setDesktopOrbitPulsePoint = (angle: number) => {
        const pulsePoint = getMobileOrbitPoint(angle);
        desktopOrbitPulse.position.set(pulsePoint.x, pulsePoint.y, pulsePoint.z);
      };

      const renderStaticState = () => {
        const targets = getLayerTargets();
        const orbitMode = getMobileOrbitMode();
        const desktopOrbitVisibility = Number(orbitMode === "desktop");
        const compactOrbitVisibility = Number(orbitMode === "compact");
        trackedMaterials.forEach(({ baseOpacity, layer, material }) => {
          material.opacity = baseOpacity * targets[layer];
        });
        trackedGroups.forEach((item) => {
          item.scale = getGroupScale(item.layer);
          item.group.scale.setScalar(item.scale);
        });
        desktopOrbitGroup.rotation.set(1.02, 0.28, -0.22);
        desktopOrbitMaterial.opacity = 0.42 * desktopOrbitVisibility;
        desktopOrbitPulseMaterial.opacity = 0.96 * desktopOrbitVisibility;
        (Object.keys(compactOrbitMaterials) as MobileOrbitId[]).forEach((orbit) => {
          compactOrbitMaterials[orbit].opacity = compactOrbitOpacity[orbit] * compactOrbitVisibility;
        });
        updateMobileLabelPoints(0);
        setDesktopOrbitPulsePoint(-0.2);
        renderer.render(scene, camera);
        updateStackLabels(DESKTOP_STACK_LABEL_ROUTE_DURATION_MS * 0.18);
      };
      renderStaticLayer = () => {
        if (reduceMotion) renderStaticState();
      };

      const tick = (now: number) => {
        const frame = clampValue((now - lastFrame) / 16.67, 0, 2.2);
        lastFrame = now;

        if (isVisible) {
          if (now - lastPositionCheck > 250) {
            lastPositionCheck = now;
            updateStackSpherePosition();
          }

          const targets = getLayerTargets();
          const orbitMode = getMobileOrbitMode();
          const desktopOrbitVisibility = Number(orbitMode === "desktop");
          const compactOrbitVisibility = Number(orbitMode === "compact");
          trackedMaterials.forEach(({ baseOpacity, layer, material }) => {
            const targetOpacity = baseOpacity * targets[layer];
            material.opacity += (targetOpacity - material.opacity) * 0.08 * frame;
          });

          trackedGroups.forEach((item) => {
            const targetScale = getGroupScale(item.layer);
            item.scale += (targetScale - item.scale) * 0.06 * frame;
            item.group.scale.setScalar(item.scale);
          });
          desktopOrbitMaterial.opacity += (
            0.42 * desktopOrbitVisibility - desktopOrbitMaterial.opacity
          ) * 0.08 * frame;
          desktopOrbitPulseMaterial.opacity += (
            0.96 * desktopOrbitVisibility - desktopOrbitPulseMaterial.opacity
          ) * 0.1 * frame;
          (Object.keys(compactOrbitMaterials) as MobileOrbitId[]).forEach((orbit) => {
            const material = compactOrbitMaterials[orbit];
            const targetOpacity = compactOrbitOpacity[orbit] * compactOrbitVisibility;
            material.opacity += (targetOpacity - material.opacity) * 0.1 * frame;
          });
          if (orbitMode === "desktop") {
            updateMobileLabelPoints(0);
            desktopOrbitGroup.rotation.z += 0.0012 * frame;
            const pulseAngle = (now * 0.00034) % (Math.PI * 2);
            setDesktopOrbitPulsePoint(pulseAngle);
          } else if (orbitMode === "compact") {
            updateMobileLabelPoints(now);
          }

          if (orbitMode === "compact") {
            const targetRotation = getCompactMobileRootRotation(now);
            const driftEase = 0.035 * frame;
            rootGroup.rotation.x += (targetRotation.x - rootGroup.rotation.x) * driftEase;
            rootGroup.rotation.y += (targetRotation.y - rootGroup.rotation.y) * driftEase;
            rootGroup.rotation.z += (targetRotation.z - rootGroup.rotation.z) * driftEase;
          } else {
            rootGroup.rotation.y += 0.0022 * frame;
            rootGroup.rotation.x = -0.16 + Math.sin(now * 0.00022) * 0.08;
            rootGroup.rotation.z = 0.08 + Math.sin(now * 0.00018 + 1.2) * 0.045;
          }
          renderer.render(scene, camera);
          updateStackLabels(now);
        }

        frameId = requestAnimationFrame(tick);
      };

      motionPreferenceListener = (event) => {
        reduceMotion = event.matches;
        if (reduceMotion) {
          if (frameId) cancelAnimationFrame(frameId);
          frameId = 0;
          renderStaticState();
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
      layoutObserver = new ResizeObserver(updateStackSpherePosition);
      const inner = host.closest<HTMLElement>(".vz-sticky__inner");
      const timeline = inner?.querySelector<HTMLElement>(".vz-stack__timeline");
      if (inner) layoutObserver.observe(inner);
      if (timeline) layoutObserver.observe(timeline);
      viewport = window.visualViewport;
      viewport?.addEventListener("resize", updateStackSpherePosition, { passive: true });
      viewport?.addEventListener("scroll", updateStackSpherePosition, { passive: true });
      intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
      });
      intersectionObserver.observe(host);
      resize();
      if (reduceMotion) renderStaticState();
      else frameId = requestAnimationFrame(tick);
    } catch (error) {
      if (setupToken !== stackSphereSetupToken || stackSphereRef.value !== host) return;
      disposePartial?.();
      console.info("VEZHA stack 3D fallback is inactive:", error);
      host.hidden = true;
    }
  }

  function updateStackSpherePosition() {
    const host = stackSphereRef.value;
    if (!host || window.innerWidth <= 900) return;

    const inner = host.closest<HTMLElement>(".vz-sticky__inner");
    const timeline = inner?.querySelector<HTMLElement>(".vz-stack__timeline");
    const meta = inner?.querySelector<HTMLElement>(".vz-sec-meta");
    const items = timeline ? Array.from(timeline.querySelectorAll<HTMLElement>("[data-stack-item]")) : [];
    const backendItem = items[1];
    const devopsItem = items[2];
    if (!inner || !meta || !backendItem || !devopsItem) return;

    const innerRect = inner.getBoundingClientRect();
    const metaRect = meta.getBoundingClientRect();
    const backendRect = backendItem.getBoundingClientRect();
    const devopsRect = devopsItem.getBoundingClientRect();
    const sphereRect = host.getBoundingClientRect();
    const sphereSize = sphereRect.height || host.offsetHeight;
    const sphereWidth = sphereRect.width || host.offsetWidth;
    if (!sphereSize || !sphereWidth) return;

    const backendCenter = backendRect.top + backendRect.height / 2;
    const devopsCenter = devopsRect.top + devopsRect.height / 2;
    const targetY = (backendCenter + devopsCenter) / 2 - innerRect.top;
    const targetX = metaRect.left + metaRect.width / 2 - innerRect.left;
    const nextTop = `${Math.round(targetY - sphereSize / 2)}px`;
    const nextLeft = `${Math.round(targetX - sphereWidth / 2)}px`;
    if (host.style.getPropertyValue("--stack-sphere-top") !== nextTop) {
      host.style.setProperty("--stack-sphere-top", nextTop);
    }
    if (host.style.getPropertyValue("--stack-sphere-left") !== nextLeft) {
      host.style.setProperty("--stack-sphere-left", nextLeft);
    }
  }

  function cleanup() {
    stackSphereSetupToken += 1;
    stackSphereCleanup?.();
    stackSphereCleanup = null;
  }

  return {
    setup: setupStackSphereScene,
    updatePosition: updateStackSpherePosition,
    cleanup,
  };
}
