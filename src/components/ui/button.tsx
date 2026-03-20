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
          "border border-emerald-300/80 bg-emerald-500 text-white shadow-[0_12px_35px_rgba(34,197,94,0.22)] hover:bg-emerald-600 hover:shadow-[0_16px_40px_rgba(34,197,94,0.28)] dark:border-violet-300/25 dark:bg-violet-300/85 dark:text-slate-950 dark:shadow-[0_14px_40px_rgba(196,181,253,0.24)] dark:hover:bg-violet-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:hover:bg-violet-200/20 dark:hover:text-violet-50",
        secondary:
          "border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:hover:bg-violet-200/20 dark:hover:text-violet-50",
        ghost:
          "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-violet-100 dark:hover:bg-violet-200/20 dark:hover:text-violet-50",
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
