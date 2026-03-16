export const useSectionVisible = () => {
    const isSectionVisible = ref(false)
    const targetRef = ref<HTMLElement | null>(null)

    let observer: IntersectionObserver | null = null

    onMounted(() => {
        const isMobile = window.innerWidth <= 768
        const threshold = isMobile ? 0.5 : 0.3

        observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                isSectionVisible.value = true

                if(observer){
                    observer.disconnect()
                }
            }
        }, {threshold})

        if(targetRef.value) {
            observer.observe(targetRef.value)
        }
    })

    onUnmounted(() => {
        if (observer) observer.disconnect()
    })

    return {
        targetRef,
        isSectionVisible,
    }
}
