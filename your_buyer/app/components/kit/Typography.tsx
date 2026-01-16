import { cn } from "@/lib/utils"

interface TypographyProps {
  className?: string
  children: React.ReactNode
}

export const H1 = ({ className, children }: TypographyProps) => (
  <h1
    className={cn(
      "text-[3.5rem] font-bold leading-[1.1] tracking-tight",
      className
    )}
  >
    {children}
  </h1>
)

export const H2 = ({ className, children }: TypographyProps) => (
  <h2
    className={cn(
      "text-[3rem] font-bold leading-[1.15] tracking-tight",
      className
    )}
  >
    {children}
  </h2>
)

export const H3 = ({ className, children }: TypographyProps) => (
  <h3
    className={cn(
      "text-[2.5rem] font-bold leading-[1.2] tracking-tight",
      className
    )}
  >
    {children}
  </h3>
)

export const H4 = ({ className, children }: TypographyProps) => (
  <h4
    className={cn(
      "text-[2rem] font-bold leading-[1.25] tracking-tight",
      className
    )}
  >
    {children}
  </h4>
)

export const H5 = ({ className, children }: TypographyProps) => (
  <h5
    className={cn(
      "text-[1.75rem] font-bold leading-[1.3] tracking-tight",
      className
    )}
  >
    {children}
  </h5>
)

export const H6 = ({ className, children }: TypographyProps) => (
  <h6
    className={cn(
      "text-[1.5rem] font-semibold leading-[1.35] tracking-tight",
      className
    )}
  >
    {children}
  </h6>
)

export const H7 = ({ className, children }: TypographyProps) => (
  <div
    className={cn(
      "text-[1.25rem] font-semibold leading-[1.4] tracking-tight",
      className
    )}
  >
    {children}
  </div>
)

export const H8 = ({ className, children }: TypographyProps) => (
  <div
    className={cn(
      "text-[1.125rem] font-medium leading-[1.45] tracking-tight",
      className
    )}
  >
    {children}
  </div>
)

export const Paragraph1 = ({ className, children }: TypographyProps) => (
  <p className={cn("text-base leading-[1.5]", className)}>{children}</p>
)

export const Paragraph2 = ({ className, children }: TypographyProps) => (
  <p className={cn("text-sm leading-[1.5]", className)}>{children}</p>
)

export const Caption = ({ className, children }: TypographyProps) => (
  <p className={cn("text-xs leading-[1.4]", className)}>{children}</p>
)

export const Small = ({ className, children }: TypographyProps) => (
  <p className={cn("text-[0.6875rem] leading-[1.3]", className)}>{children}</p>
)

export const Mini = ({ className, children }: TypographyProps) => (
  <p className={cn("text-[0.625rem] leading-[1.2]", className)}>{children}</p>
)
