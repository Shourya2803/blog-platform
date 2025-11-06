"use client";

import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes";

type Props = NextThemeProviderProps & {
  disableTransitionOnChange?: boolean;
};

export const ThemeProvider = ({ children, disableTransitionOnChange, ...props }: React.PropsWithChildren<Props>) => {
  React.useEffect(() => {
    if (!disableTransitionOnChange) return;
    // temporarily disable CSS transitions to avoid flashes when theme changes
    const style = document.createElement("style");
    style.setAttribute("data-theme-provider", "true");
    style.innerHTML = `* { transition: none !important; }`;
    document.head.appendChild(style);
    // remove after a short delay so normal transitions restore
    const id = window.setTimeout(() => {
      style.remove();
    }, 50);
    return () => {
      clearTimeout(id);
      style.remove();
    };
  }, [disableTransitionOnChange]);

  return <NextThemeProvider {...(props as NextThemeProviderProps)}>{children}</NextThemeProvider>;
};

export default ThemeProvider;
