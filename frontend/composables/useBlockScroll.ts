export const useBlockScroll = () => {
    const lockScroll = () => {
        const scrollY = window.scrollY
        document.body.style.top = `-${scrollY}px`
        document.body.classList.add('modal-no-scroll')
        document.body.dataset.scrollY = String(scrollY)
    }

    const unlockScroll = () => {
        const scrollY = Number(document.body.dataset.scrollY || 0)
        document.body.classList.remove('modal-no-scroll')
        document.body.style.top = ''
        window.scrollTo(0, scrollY)
    }

    return {lockScroll, unlockScroll}
}