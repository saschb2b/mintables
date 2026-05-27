"use client";

import { cloneElement, isValidElement, useCallback, useRef, useState } from "react";
import type {
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
} from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import type { TooltipProps } from "@mui/material/Tooltip";

interface OSTooltipProps
  extends Omit<TooltipProps, "title" | "children" | "open" | "onOpen" | "onClose"> {
  title: ReactNode;
  /** Suppress the tooltip entirely. Useful while a drag / resize gesture is
   *  in progress so the tooltip doesn't pop up over the moving chrome. */
  disabled?: boolean;
  children: ReactElement;
}

const ENTER_DELAY = 700;
const ENTER_NEXT_DELAY = 120;
const LEAVE_DELAY = 0;

const TOOLTIP_SX = {
  bgcolor: "rgba(24, 26, 38, 0.94)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: 0.2,
  px: 1.25,
  py: 0.5,
  [`& .${tooltipClasses.arrow}`]: {
    color: "rgba(24, 26, 38, 0.94)",
  },
} as const;

type TriggerProps = {
  onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void;
  onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  onPointerLeave?: (e: ReactPointerEvent<HTMLElement>) => void;
  onBlur?: (e: ReactFocusEvent<HTMLElement>) => void;
};

/**
 * OS-style tooltip wrapper.
 *
 * Why this exists: MUI's default Tooltip is tuned for web hover-help text and
 * has two behaviors that clash with desktop-app feel:
 *  · It pops up after ~100ms, so a tooltip flashes for every element the
 *    cursor sweeps over.
 *  · It does NOT dismiss on click — so after you click a button the tooltip
 *    sits over the action you just took.
 *
 * This component fixes both:
 *  · 700ms enterDelay rewards deliberate hovering, not cursor traversal.
 *  · enterNextDelay (120ms) keeps adjacent-element traversal snappy once
 *    you've seen one tooltip in the group (e.g. running along the dock).
 *  · leaveDelay: 0 means tooltips disappear the moment the cursor leaves.
 *  · pointerdown / click on the trigger dismisses the tooltip AND suppresses
 *    re-open until the cursor actually leaves and re-enters, so the tooltip
 *    can never linger over an action the user just took.
 *  · `disabled` prop lets callers suppress tooltips during drag / resize
 *    gestures.
 */
export function OSTooltip({
  title,
  disabled,
  children,
  placement = "top",
  slotProps,
  ...rest
}: OSTooltipProps) {
  const [open, setOpen] = useState(false);
  // Once the trigger is clicked, ignore further onOpen calls until the pointer
  // leaves the trigger. Prevents the tooltip from immediately re-appearing
  // while the user is still hovering on the button they just pressed.
  const suppressedRef = useRef(false);

  const handleOpen = useCallback(() => {
    if (suppressedRef.current || disabled) return;
    setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const dismissAndSuppress = useCallback(() => {
    suppressedRef.current = true;
    setOpen(false);
  }, []);

  const clearSuppression = useCallback(() => {
    suppressedRef.current = false;
  }, []);

  const wrapped = isValidElement<TriggerProps>(children)
    ? cloneElement(children, {
        onPointerDown: (e) => {
          dismissAndSuppress();
          children.props.onPointerDown?.(e);
        },
        onClick: (e) => {
          // Keyboard activations don't fire pointerdown; cover them here too.
          dismissAndSuppress();
          children.props.onClick?.(e);
        },
        onPointerLeave: (e) => {
          clearSuppression();
          children.props.onPointerLeave?.(e);
        },
        onBlur: (e) => {
          clearSuppression();
          children.props.onBlur?.(e);
        },
      })
    : children;

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow
      open={open && !disabled}
      onOpen={handleOpen}
      onClose={handleClose}
      enterDelay={ENTER_DELAY}
      enterNextDelay={ENTER_NEXT_DELAY}
      leaveDelay={LEAVE_DELAY}
      disableInteractive
      slotProps={{
        ...slotProps,
        tooltip: {
          ...slotProps?.tooltip,
          sx: {
            ...TOOLTIP_SX,
            // Caller overrides win
            ...(typeof slotProps?.tooltip === "object" &&
            slotProps.tooltip !== null &&
            "sx" in slotProps.tooltip
              ? (slotProps.tooltip as { sx?: Record<string, unknown> }).sx
              : {}),
          },
        },
      }}
      {...rest}
    >
      {wrapped}
    </Tooltip>
  );
}
