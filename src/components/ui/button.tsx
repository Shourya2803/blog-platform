import React from "react";

type Variant = "default" | "ghost" | "outline";
type Size = "default" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none";

    const variants: Record<Variant, string> = {
      default: "bg-purple-600 text-white hover:bg-purple-700",
      ghost: "bg-transparent",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    };

    const sizes: Record<Size, string> = {
      default: "h-10 px-4 py-2 text-sm",
      icon: "h-9 w-9 p-0",
    };

    const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
