'use client'

import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function Counter({
    value,
    suffix = "",
    className = ""
}: {
    value: number,
    suffix?: string,
    className?: string
}) {
    const ref = useRef(null)
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    })
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [isInView, value, motionValue])

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                // @ts-ignore
                ref.current.textContent = Math.floor(latest).toLocaleString() + suffix
            }
        })
    }, [springValue, suffix])

    return <span ref={ref} className={className}>0{suffix}</span>
}
