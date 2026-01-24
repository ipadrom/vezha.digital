export const useTypeWriterAnimation = (
    text: string,
    speed = 50,
    startDelay = 0
) => {
    const displayedText = ref('')
    let index = 0
    let interval: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null

    const startAnimation = () => {
        timeout = setTimeout(() => {
            interval = setInterval(() => {
                displayedText.value += text[index]
                index++

                if(index >= text.length) {
                    stopAnimation()
                }
            }, speed)
        }, startDelay)
    }

    const stopAnimation = () => {
        if (interval) clearInterval(interval)
        if (timeout) clearTimeout(timeout)
    }

    onMounted(startAnimation)
    onUnmounted(stopAnimation)

    return {
        displayedText,
        startAnimation,
        stopAnimation
    }
}