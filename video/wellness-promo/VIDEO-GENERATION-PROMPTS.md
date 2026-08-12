# Wellness App — image-to-video

Используй три изображения из `public/assets` именно как **first frame / image-to-video input**, а не как style reference. Интерфейс приложения, логотипы и текст добавлять генератором не нужно: они уже накладываются чисто и стабильно при финальном монтаже.

## Общие настройки

- Формат: 16:9 landscape.
- Разрешение: 1920×1080 или 1280×720.
- Длина каждого исходника: 5 секунд.
- Частота: 24 или 30 fps.
- Экспорт: H.264 MP4, без звука.
- Motion strength: low или medium-low.
- Камера: slow stabilized motion, один непрерывный дубль.
- Сохраняй исходные позиции людей и свободное тёмное место под графику.
- Не задавай end frame: нужен естественный пятисекундный исходник.
- Сделай по 2 варианта каждой сцены и выбери не самый эффектный, а самый стабильный по лицам, рукам и геометрии.

Если есть negative prompt, вставь один и тот же во все три генерации:

```text
face morphing, identity change, extra fingers, extra limbs, rubber arms, changing clothes, floating weights, warped food, duplicated objects, camera cuts, jump cuts, zoom bursts, slow motion, text, logos, app UI, phones, watermark
```

## 01 — Бег

Стартовый кадр: `public/assets/lifestyle-run.png`

```text
Animate this exact image into a natural five-second cinematic shot. The woman runs steadily from left toward right at a realistic jogging pace. Create a believable full running stride: natural arm swing, subtle ponytail bounce, fabric and breathing motion, stable facial identity and anatomy. Use a very slow stabilized lateral tracking camera while keeping her in the left third and preserving the dark negative space on the right. Trees, shadows and sunrise reflections move subtly and consistently. Preserve the original person, outfit, architecture, lighting, color palette and composition. One continuous take. No cuts, no slow motion, no added people, no phone, no interface, no text, no logo.
```

Если есть motion brush: руки, ноги и волосы — основное движение; фон — минимальное. Камера 5–10%.

Сохрани результат как `public/clips/run.mp4`.

## 02 — Тренировка

Стартовый кадр: `public/assets/lifestyle-train.png`

```text
Animate this exact image into a natural five-second cinematic shot. The man performs one controlled dumbbell shoulder-press repetition: from the overhead position he lowers both dumbbells smoothly to shoulder level, then presses them back overhead. Keep the dumbbells rigid and consistent, wrists aligned, elbows and shoulders anatomically correct, muscles moving naturally, face and identity stable. Use only a very subtle stabilized camera push-in while keeping him in the right third and preserving the dark negative space on the left. Preserve the gym, equipment, outfit, cyan lighting and original composition. One continuous take. No cuts, no extra equipment, no floating weights, no warped hands, no phone, no interface, no text, no logo.
```

Если есть motion brush: руки, гантели и плечи — основное движение; корпус — слабое дыхание. Камера 5–10%.

Сохрани результат как `public/clips/train.mp4`.

## 03 — Питание

Стартовый кадр: `public/assets/lifestyle-nutrition.png`

```text
Animate this exact image into a natural five-second cinematic shot. The couple continues preparing the meal: the man makes two calm realistic chopping motions, while the woman sprinkles herbs over the salmon bowl and gently rotates the bowl toward the camera. Add subtle breathing, small natural smiles and restrained eye movement. Keep hands, utensils, ingredients and food physically consistent; preserve both identities, clothes, kitchen, lighting and composition. Use a very slow stabilized camera push-in and preserve the darker negative space on the right. One continuous take. No cuts, no new people, no extra fingers, no morphing food, no phone, no interface, no text, no logo.
```

Если есть motion brush: кисти рук, нож, зелень и миска — основное движение; лица почти не трогать. Камера 5–10%.

Сохрани результат как `public/clips/nutrition.mp4`.

## Передача в монтаж

В папке `public/clips` должны оказаться ровно три файла:

```text
run.mp4
train.mp4
nutrition.mp4
```

Имена менять не нужно. После этого финальный ролик собирается командой `npm run render:final`; первые нестабильные 0,2 секунды каждого исходника автоматически срезаются.
