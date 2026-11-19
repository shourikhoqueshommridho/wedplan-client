"use client"

import { useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff, type LucideIcon } from "lucide-react"

import {
  authErrorClass,
  authHintClass,
  authInputPlainClass,
  authInputWithActionClass,
  authLabelClass,
} from "@/components/auth/auth-styles"
import { cn } from "@/lib/utils"

interface SharedFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  icon: LucideIcon
  requiredMark?: boolean
}

type TextFieldProps = SharedFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "size">

export function AuthTextField({
  id,
  label,
  error,
  hint,
  icon: Icon,
  requiredMark,
  ...inputProps
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
        {requiredMark ? <span className="ml-0.5 text-wine-500">*</span> : null}
      </label>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-wine-400"
        />
        <input
          {...inputProps}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={authInputPlainClass}
        />
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={authErrorClass}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={authHintClass}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface PasswordFieldProps extends SharedFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  autoComplete?: string
}

export function AuthPasswordField({
  id,
  label,
  error,
  hint,
  icon: Icon,
  requiredMark,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
        {requiredMark ? <span className="ml-0.5 text-wine-500">*</span> : null}
      </label>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-[1.05rem] -translate-y-1/2 text-wine-400"
        />
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(authInputWithActionClass, "pr-12")}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-wine-500 transition-colors hover:bg-wine-50 hover:text-wine-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-200"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="size-[1.05rem]" />
          ) : (
            <Eye aria-hidden="true" className="size-[1.05rem]" />
          )}
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={authErrorClass}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={authHintClass}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
