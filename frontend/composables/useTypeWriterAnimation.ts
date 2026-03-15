export const useTypeWriterAnimation = (
    text: Ref<string> | ComputedRef<string>,
    speed = 50,
    startDelay = 0
) => {
    const displayedText = ref('')
    const isCompleted = ref(false)
    let index = 0
    let interval: ReturnType<typeof setInterval> | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null

    const startAnimation = () => {
        stopAnimation()
        const str = unref(text)
        displayedText.value = ''
        isCompleted.value = false
        index = 0

        timeout = setTimeout(() => {
            interval = setInterval(() => {
                if (index < str.length){
                    displayedText.value += str[index]
                    index++
                } else {
                    stopAnimation()
                    isCompleted.value = true
                }
            }, speed)
        }, startDelay)
    }

    const stopAnimation = () => {
        if (interval) clearInterval(interval)
        if (timeout) clearTimeout(timeout)
        interval = null
        timeout = null
    }

    onMounted(startAnimation)
    onUnmounted(stopAnimation)

    watch(text, () => {
        startAnimation()
    })

    return {
        displayedText,
        isCompleted,
        startAnimation,
        stopAnimation
    }
}