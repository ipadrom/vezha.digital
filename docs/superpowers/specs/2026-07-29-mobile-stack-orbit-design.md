# Mobile stack orbit

## Goal

Give the `Mobile` state in the stack section its own clear visual role. The current sphere metaphor remains:

- Frontend is the outer interface layer.
- Backend is the inner core.
- DevOps is the system of connections between layers.
- Mobile is the whole system delivered beyond the browser to a user's device.

Mobile must not look like a fourth nested infrastructure layer or a literal phone mockup.

## Visual design

When `Mobile` becomes active, the existing sphere stays visible and all three system layers remain present at reduced emphasis. A thin tilted orbit appears around the sphere.

The mobile technologies are distributed as follows:

- `React Native`, `Expo`, and `Flutter` sit on the orbit.
- `PWA` sits at the visual intersection between the orbit and the outer sphere, expressing its position between web and installed mobile experiences.

One restrained light pulse travels along the orbit to suggest synchronization between the mobile client and the system. The motion is continuous and slow enough not to compete with the stack copy.

The orbit uses the same monochrome wireframe language, line weights, label treatment, and theme behavior as the existing sphere. Technology brand colors remain limited to the small icon accents already used by the stack visualization.

## State transitions

- Entering `Mobile`: existing layers soften, the orbit and mobile labels fade in, and the pulse starts.
- Leaving `Mobile`: the orbit, pulse, and mobile labels fade out; the selected Frontend, Backend, or DevOps layer returns to its existing emphasis.
- Existing behavior for Frontend, Backend, and DevOps does not change.
- The stack counter, timeline, descriptions, manual selection, scroll behavior, and mobile autoplay remain unchanged.

## Responsive behavior

The orbit scales from the current sphere size and remains fully inside the sphere window on desktop and mobile layouts.

At widths up to `900px`, labels may move closer to the orbit to avoid clipping, but their semantic placement stays the same. The orbit cannot create horizontal page scrolling or overlap the active stack description.

With `prefers-reduced-motion: reduce`, the orbit and labels remain visible in the Mobile state, but the traveling pulse is static and the orbit does not rotate.

## Implementation boundaries

The visual belongs in the existing stack sphere module, `frontend/composables/landing/useLandingStackSphere.ts`. The active-layer mapping in `frontend/components/landing/LandingStack.vue` will expose a dedicated Mobile state instead of treating Mobile as the generic `all` state.

No new image assets, packages, content fields, or API changes are required. The Russian and English Mobile copy and technology lists remain unchanged.

## Acceptance criteria

- Selecting Mobile shows a distinct tilted orbit around the complete sphere.
- React Native, Expo, and Flutter are visually attached to the orbit.
- PWA is positioned at the orbit/surface intersection.
- Frontend, Backend, and DevOps layers remain visible but secondary while Mobile is active.
- A single restrained pulse communicates data flow without obscuring labels.
- Switching away from Mobile fully removes the orbit-specific presentation.
- Both light and dark themes retain sufficient contrast.
- The visualization fits at desktop and mobile widths without clipping, overlap, or horizontal overflow.
- Reduced-motion mode presents a clear static Mobile state.
- Existing stack interactions and the other three visual states do not regress.

## Verification

- Run the production build.
- Verify Frontend, Backend, DevOps, and Mobile transitions in the rendered desktop section.
- Verify Mobile at one viewport at or below `900px`.
- Check light and dark themes.
- Check reduced-motion behavior.
- Confirm there are no relevant browser console errors or framework overlays.
