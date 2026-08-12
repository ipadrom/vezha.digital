# Training product film

An 18-second, silent, 1600×900 Remotion edit built only from real Training product screenshots and the existing exercise illustration.

The unequal scene lengths are deliberate: connected day (96f), gated plan (68f), active movement (82f), contextual technique (104f), recovery (62f), and nutrition (128f).

```powershell
npm install
npm run dev
npm run render
npm run poster
```

Context animations are registered separately at 960×720:

- `WorkoutFlow` — plan to active exercise, 4.4 seconds.
- `TechniqueFlow` — contextual bottom sheet, 3.6 seconds.
- `NutritionFlow` — daily menu to recipe, 4.8 seconds.

The six compact process animations use separate editorial treatments:

- `SystemFlow` → `system-flow.gif`
- `SequenceFlow` → `sequence-flow.gif`
- `TechniqueFlow` → `technique-flow.gif`
- `RecoveryFlow` → `recovery-flow.gif`
- `ProgressionFlow` → `progression-flow.gif`
- `NutritionProcessFlow` → `nutrition-process-flow.gif`
