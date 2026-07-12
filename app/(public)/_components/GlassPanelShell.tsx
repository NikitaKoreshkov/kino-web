"use client";

import React, { useRef, forwardRef } from "react";
import { useGlassPanelElasticity } from "../_hooks/useGlassPanelElasticity";
import { useTheme } from "../../theme";

type GlassPanelShellProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** Elastic motion strength, 1 = default, lower = softer */
  elasticity?: number;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

function GlassPanelShellInner<T extends React.ElementType = "div">(
  {
    as,
    children,
    className = "",
    disabled = false,
    elasticity = 1,
    ...rest
  }: GlassPanelShellProps<T>,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const Tag = (as || "div") as React.ElementType;
  const shellRef = useRef<HTMLElement | null>(null);
  const rimRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useGlassPanelElasticity(shellRef, rimRef, disabled, theme === "light", elasticity);

  const setRef = (node: HTMLElement | null) => {
    shellRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <Tag ref={setRef} className={`glassPanel ${className}`.trim()} {...rest}>
      <div ref={rimRef} className="glassPanel__rim" aria-hidden="true" />
      {children}
    </Tag>
  );
}

const GlassPanelShell = forwardRef(GlassPanelShellInner) as <T extends React.ElementType = "div">(
  props: GlassPanelShellProps<T> & { ref?: React.ForwardedRef<HTMLElement> },
) => React.ReactElement | null;

export default GlassPanelShell;
