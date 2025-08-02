"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [finalPosition, setFinalPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate positions for all directions
    const positions = {
      top: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
        y: triggerRect.top - tooltipRect.height - 8,
      },
      bottom: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
        y: triggerRect.bottom + 8,
      },
      left: {
        x: triggerRect.left - tooltipRect.width - 8,
        y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
      },
      right: {
        x: triggerRect.right + 8,
        y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
      },
    };

    // Find the best position that fits within viewport
    let bestPosition: "top" | "bottom" | "left" | "right" = position;
    let bestCoords = positions[position as keyof typeof positions];

    // Check if preferred position fits
    if (
      bestCoords.x >= 8 &&
      bestCoords.x + tooltipRect.width <= viewportWidth - 8 &&
      bestCoords.y >= 8 &&
      bestCoords.y + tooltipRect.height <= viewportHeight - 8
    ) {
      // Preferred position works
    } else {
      // Try alternative positions
      const alternatives = ["top", "bottom", "left", "right"].filter(
        (p) => p !== position
      );

      for (const altPosition of alternatives) {
        const coords = positions[altPosition as keyof typeof positions];
        if (
          coords.x >= 8 &&
          coords.x + tooltipRect.width <= viewportWidth - 8 &&
          coords.y >= 8 &&
          coords.y + tooltipRect.height <= viewportHeight - 8
        ) {
          bestPosition = altPosition as "top" | "bottom" | "left" | "right";
          bestCoords = coords;
          break;
        }
      }

      // If no position fits perfectly, use the one with least overflow
      if (bestPosition === position) {
        let minOverflow = Infinity;
        for (const [pos, coords] of Object.entries(positions)) {
          const overflowX =
            Math.max(0, -coords.x) +
            Math.max(0, coords.x + tooltipRect.width - viewportWidth);
          const overflowY =
            Math.max(0, -coords.y) +
            Math.max(0, coords.y + tooltipRect.height - viewportHeight);
          const totalOverflow = overflowX + overflowY;

          if (totalOverflow < minOverflow) {
            minOverflow = totalOverflow;
            bestPosition = pos as "top" | "bottom" | "left" | "right";
            bestCoords = coords;
          }
        }
      }
    }

    // Clamp coordinates to viewport bounds
    const clampedX = Math.max(
      8,
      Math.min(bestCoords.x, viewportWidth - tooltipRect.width - 8)
    );
    const clampedY = Math.max(
      8,
      Math.min(bestCoords.y, viewportHeight - tooltipRect.height - 8)
    );

    setFinalPosition(bestPosition);
    setTooltipPosition({ x: clampedX, y: clampedY });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    switch (finalPosition) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-l-gray-900";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-r-gray-900";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900";
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs break-words animate-fade-in"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
            />
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

// Enhanced Tooltip with Icon
interface IconTooltipProps {
  children: React.ReactNode;
  content: string;
  icon?: React.ComponentType<{ className?: string }>;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "info" | "warning" | "success" | "danger";
  className?: string;
}

export const IconTooltip: React.FC<IconTooltipProps> = ({
  children,
  content,
  icon: Icon,
  position = "top",
  variant = "info",
  className = "",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "info":
        return "bg-blue-600 text-white";
      case "warning":
        return "bg-yellow-600 text-white";
      case "success":
        return "bg-green-600 text-white";
      case "danger":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-900 text-white";
    }
  };

  return (
    <Tooltip content={content} position={position} className={className}>
      <div className="inline-flex items-center">
        {children}
        {Icon && (
          <Icon className="h-4 w-4 ml-1 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </div>
    </Tooltip>
  );
};

// Action Tooltip for buttons
interface ActionTooltipProps {
  children: React.ReactNode;
  content: string;
  action?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  children,
  content,
  action,
  position = "top",
  className = "",
}) => {
  return (
    <Tooltip
      content={
        <div className="text-center">
          <div className="font-medium">{content}</div>
          {action && <div className="text-xs opacity-75 mt-1">{action}</div>}
        </div>
      }
      position={position}
      className={className}
    >
      {children}
    </Tooltip>
  );
};
