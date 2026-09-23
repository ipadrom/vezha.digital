export const contactPhone = "8 (993) 900-23-66";
export const contactTelegram = { handle: "@vezha_digital", url: "https://t.me/vezha_digital" } as const;
export const defaultContactEmail = "contact@vezha.digital";

export type ContactCopyKey = "email" | "phone";

async function writeClipboard(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Permission denied or an insecure context; fall through to the legacy path.
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

// Copies a contact value and briefly reports which one was copied.
export function useContactCopy() {
  const copiedKey = ref<ContactCopyKey | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | null = null;

  async function copyValue(key: ContactCopyKey, value: string) {
    if (!await writeClipboard(value)) return;

    copiedKey.value = key;
    if (copiedTimer) clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copiedKey.value = null;
      copiedTimer = null;
    }, 1600);
  }

  onBeforeUnmount(() => {
    if (copiedTimer) clearTimeout(copiedTimer);
  });

  return { copiedKey, copyValue };
}
