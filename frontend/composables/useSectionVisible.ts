export const useSectionVisible = (threshold: 0.1) => {
    const isSectionVisible = ref(false)
    const targetRef = ref<HTMLElement | null>(null)

    let observer: IntersectionObserver | null = null

    onMounted(() => {
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