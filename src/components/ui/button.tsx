import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-emerald-600 bg-emerald-600 text-white shadow-[0_12px_35px_rgba(22,163,74,0.18)] hover:bg-emerald-700 hover:border-emerald-700 dark:border-orange-400 dark:bg-orange-400 dark:text-slate-950 dark:shadow-[0_14px_40px_rgba(251,146,60,0.22)] dark:hover:bg-orange-300 dark:hover:border-orange-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-orange-400/60 dark:bg-slate-950 dark:text-orange-200 dark:hover:bg-slate-900 dark:hover:text-orange-100",
        secondary:
          "border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:text-sky-900 dark:border-sky-400/60 dark:bg-slate-950 dark:text-sky-200 dark:hover:bg-slate-900 dark:hover:text-sky-100",
        ghost:
          "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-orange-100 dark:hover:bg-orange-400/10 dark:hover:text-orange-50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
