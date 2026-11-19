"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

import { EASE_OUT } from "@/lib/motion"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Small, reusable scroll reveal. Content remains visible when the visitor
 * prefers reduced motion, and every animation runs only once.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
