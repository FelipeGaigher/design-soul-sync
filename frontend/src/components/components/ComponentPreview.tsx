import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  ComponentDetail,
  ComponentProperties,
  ChildElement,
  FillStyle,
  StrokeStyle,
  EffectStyle,
} from "@/services/components.service";

interface ComponentPreviewProps {
  componentDetail: ComponentDetail;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeHover?: (nodeId: string | null) => void;
  activeVariantName?: string | null;
  activeVariantProps?: ComponentProperties | null;
}

// Convert Figma fills to CSS background
const fillsToBackground = (fills?: FillStyle[]): string | undefined => {
  if (!fills || fills.length === 0) return undefined;

  const visibleFills = fills.filter((f) => f.color || f.gradientStops);
  if (visibleFills.length === 0) return undefined;

  // For solid fill, use the first one
  const solidFill = visibleFills.find((f) => f.type === "SOLID" && f.color);
  if (solidFill?.color) return solidFill.color;

  // Handle gradients
  const gradient = visibleFills.find(
    (f) => f.type?.includes("GRADIENT") && f.gradientStops
  );
  if (gradient?.gradientStops) {
    const stops = gradient.gradientStops
      .map((s) => `${s.color} ${Math.round(s.position * 100)}%`)
      .join(", ");
    if (gradient.type === "GRADIENT_LINEAR") {
      return `linear-gradient(180deg, ${stops})`;
    }
    if (gradient.type === "GRADIENT_RADIAL") {
      return `radial-gradient(circle, ${stops})`;
    }
  }

  return undefined;
};

// Convert Figma strokes to CSS border
const strokesToBorder = (strokes?: StrokeStyle[]): string | undefined => {
  if (!strokes || strokes.length === 0) return undefined;

  const stroke = strokes[0];
  if (!stroke.color) return undefined;

  const weight = stroke.weight || 1;
  return `${weight}px solid ${stroke.color}`;
};

// Convert Figma effects to CSS box-shadow
const effectsToBoxShadow = (effects?: EffectStyle[]): string | undefined => {
  if (!effects || effects.length === 0) return undefined;

  const shadows = effects
    .filter((e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW")
    .map((e) => {
      const x = e.offset?.x || 0;
      const y = e.offset?.y || 0;
      const blur = e.radius || 0;
      const spread = e.spread || 0;
      const color = e.color || "rgba(0,0,0,0.25)";
      const inset = e.type === "INNER_SHADOW" ? "inset " : "";
      return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    });

  if (shadows.length === 0) return undefined;
  return shadows.join(", ");
};

// Build CSS styles from Figma properties
const buildStyles = (
  props: ComponentProperties | ChildElement
): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  // Dimensions
  if (props.width) styles.width = `${Math.round(props.width)}px`;
  if (props.height) styles.height = `${Math.round(props.height)}px`;

  // Background
  const bg = fillsToBackground(props.fills);
  if (bg) {
    if (bg.includes("gradient")) {
      styles.backgroundImage = bg;
    } else {
      styles.backgroundColor = bg;
    }
  }

  // Border
  const border = strokesToBorder(props.strokes);
  if (border) styles.border = border;

  // Border radius
  if (props.cornerRadius !== undefined) {
    if (Array.isArray(props.cornerRadius)) {
      styles.borderRadius = props.cornerRadius.map((v) => `${v}px`).join(" ");
    } else {
      styles.borderRadius = `${props.cornerRadius}px`;
    }
  }
  if ("cornerRadii" in props && props.cornerRadii) {
    const { topLeft, topRight, bottomRight, bottomLeft } = props.cornerRadii;
    styles.borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
  }

  // Box shadow
  const shadow = effectsToBoxShadow(props.effects);
  if (shadow) styles.boxShadow = shadow;

  // Opacity
  if (props.opacity !== undefined && props.opacity < 1) {
    styles.opacity = props.opacity;
  }

  // Layout (Auto Layout)
  if ("layoutMode" in props && props.layoutMode && props.layoutMode !== "NONE") {
    styles.display = "flex";
    styles.flexDirection = props.layoutMode === "HORIZONTAL" ? "row" : "column";
    styles.alignItems = "center";
    styles.justifyContent = "center";
  }
  if ("itemSpacing" in props && props.itemSpacing !== undefined) {
    styles.gap = `${props.itemSpacing}px`;
  }
  if (
    "paddingTop" in props ||
    "paddingRight" in props ||
    "paddingBottom" in props ||
    "paddingLeft" in props
  ) {
    const pt = (props as ComponentProperties).paddingTop || 0;
    const pr = (props as ComponentProperties).paddingRight || 0;
    const pb = (props as ComponentProperties).paddingBottom || 0;
    const pl = (props as ComponentProperties).paddingLeft || 0;
    styles.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  }

  // Typography (for text elements)
  if ("typography" in props && props.typography) {
    const typo = props.typography;
    if (typo.fontFamily) styles.fontFamily = typo.fontFamily;
    if (typo.fontSize) styles.fontSize = `${typo.fontSize}px`;
    if (typo.fontWeight) styles.fontWeight = typo.fontWeight;
    if (typo.letterSpacing) styles.letterSpacing = `${typo.letterSpacing}px`;
    if (typo.lineHeight && typo.lineHeight !== "AUTO") {
      styles.lineHeight =
        typeof typo.lineHeight === "number"
          ? `${typo.lineHeight}px`
          : typo.lineHeight;
    }
    if (typo.textAlignHorizontal) {
      styles.textAlign =
        typo.textAlignHorizontal.toLowerCase() as React.CSSProperties["textAlign"];
    }
  }

  return styles;
};

// Recursive component to render child elements
interface ChildRendererProps {
  element: ChildElement;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeHover?: (nodeId: string | null) => void;
  depth?: number;
}

const ChildRenderer: React.FC<ChildRendererProps> = ({
  element,
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
  depth = 0,
}) => {
  if (!element.visible) return null;
  if (depth > 15) return null; // Prevent infinite recursion

  const styles = buildStyles(element);
  const isSelected = element.nodeId === selectedNodeId;
  const isHovered = element.nodeId === hoveredNodeId;

  const highlightClass = isSelected
    ? "outline outline-2 outline-blue-500 outline-offset-1"
    : isHovered
      ? "outline outline-1 outline-blue-300 outline-offset-1"
      : "";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelect?.(element.nodeId);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeHover?.(element.nodeId);
  };

  // Render TEXT elements
  if (element.type === "TEXT" && element.text) {
    // Get text color from fills
    const textColor = element.fills?.[0]?.color || "inherit";
    return (
      <span
        data-node-id={element.nodeId}
        className={cn(
          "cursor-pointer transition-all whitespace-nowrap",
          highlightClass
        )}
        style={{
          ...styles,
          color: textColor,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        title={element.name}
      >
        {element.text}
      </span>
    );
  }

  // Render VECTOR/BOOLEAN_OPERATION (icons) as SVG placeholder
  if (element.type === "VECTOR" || element.type === "BOOLEAN_OPERATION") {
    const iconSize = Math.min(element.width || 24, element.height || 24);
    const iconColor = element.fills?.[0]?.color || "currentColor";
    return (
      <div
        data-node-id={element.nodeId}
        className={cn(
          "flex items-center justify-center cursor-pointer transition-all flex-shrink-0",
          highlightClass
        )}
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          color: iconColor,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        title={element.name}
      >
        <svg
          width={iconSize * 0.8}
          height={iconSize * 0.8}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
    );
  }

  // Render INSTANCE elements (component instances like icons)
  if (element.type === "INSTANCE") {
    const instanceSize = Math.min(element.width || 24, element.height || 24);
    const iconColor = element.fills?.[0]?.color || "currentColor";

    // Check if it's an icon instance (small size or name contains icon)
    const isIcon =
      element.name?.toLowerCase().includes("icon") ||
      element.name?.toLowerCase().includes("icone") ||
      instanceSize <= 32;

    if (isIcon) {
      return (
        <div
          data-node-id={element.nodeId}
          className={cn(
            "flex items-center justify-center cursor-pointer transition-all flex-shrink-0",
            highlightClass
          )}
          style={{
            width: instanceSize,
            height: instanceSize,
            minWidth: instanceSize,
            minHeight: instanceSize,
            color: iconColor,
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          title={element.name}
        >
          <svg
            width={instanceSize * 0.7}
            height={instanceSize * 0.7}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      );
    }
  }

  // Render container elements (FRAME, GROUP, INSTANCE, COMPONENT, RECTANGLE, etc.)
  const hasChildren = element.children && element.children.length > 0;

  // For FRAME with auto-layout
  if (element.layoutMode) {
    styles.display = "flex";
    styles.flexDirection = element.layoutMode === "HORIZONTAL" ? "row" : "column";
    styles.alignItems = "center";
    if (element.itemSpacing) styles.gap = `${element.itemSpacing}px`;
  }

  // For elements without explicit dimensions but with layout, add defaults
  if (!styles.width && !styles.minWidth && element.layoutMode) {
    styles.minWidth = "fit-content";
  }
  if (!styles.height && !styles.minHeight && element.layoutMode) {
    styles.minHeight = "fit-content";
  }

  return (
    <div
      data-node-id={element.nodeId}
      className={cn("relative cursor-pointer transition-all", highlightClass)}
      style={styles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      title={element.name}
    >
      {hasChildren
        ? element.children!.map((child, index) => (
            <ChildRenderer
              key={child.nodeId || index}
              element={child}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onNodeSelect={onNodeSelect}
              onNodeHover={onNodeHover}
              depth={depth + 1}
            />
          ))
        : null}
    </div>
  );
};

export function ComponentPreview({
  componentDetail,
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
  activeVariantName,
  activeVariantProps,
}: ComponentPreviewProps) {
  const [localInputValues, setLocalInputValues] = useState<
    Record<string, string>
  >({});

  const props = activeVariantProps || componentDetail.properties || {};
  const name = componentDetail.name.toLowerCase();
  const category = componentDetail.category;

  // Build root styles from component properties
  const rootStyles = useMemo(() => {
    const styles = buildStyles(props);

    // Ensure auto dimensions for flex containers
    if (styles.display === "flex") {
      if (!styles.width) styles.width = "auto";
      if (!styles.height) styles.height = "auto";
    }

    return styles;
  }, [props]);

  // Determine if component is interactive
  const isButton =
    name.includes("button") || name.includes("btn") || category === "BUTTONS";
  const isInput =
    name.includes("input") ||
    name.includes("field") ||
    (category === "FORM_CONTROLS" &&
      (name.includes("text") || name.includes("field")));
  const isCheckbox =
    name.includes("checkbox") ||
    name.includes("switch") ||
    name.includes("toggle");

  const handleRootClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onNodeSelect?.(componentDetail.nodeId);
    }
  };

  const handleMouseLeave = () => {
    onNodeHover?.(null);
  };

  // Get highlight classes for root
  const isRootSelected = selectedNodeId === componentDetail.nodeId;
  const isRootHovered = hoveredNodeId === componentDetail.nodeId;
  const rootHighlight = isRootSelected
    ? "outline outline-2 outline-blue-500 outline-offset-2"
    : isRootHovered
      ? "outline outline-1 outline-blue-300 outline-offset-2"
      : "";

  // Check if we have child elements to render
  const hasChildren = props.childElements && props.childElements.length > 0;

  // Render component with children structure (most common case)
  if (hasChildren) {
    // For buttons, make it interactive
    if (isButton) {
      return (
        <button
          data-node-id={componentDetail.nodeId}
          className={cn(
            "relative cursor-pointer hover:opacity-90 active:opacity-80 transition-all",
            rootHighlight
          )}
          style={rootStyles}
          onClick={(e) => {
            e.stopPropagation();
            onNodeSelect?.(componentDetail.nodeId);
          }}
          onMouseEnter={() => onNodeHover?.(componentDetail.nodeId)}
          onMouseLeave={handleMouseLeave}
        >
          {props.childElements!.map((child, index) => (
            <ChildRenderer
              key={child.nodeId || index}
              element={child}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onNodeSelect={onNodeSelect}
              onNodeHover={onNodeHover}
            />
          ))}
        </button>
      );
    }

    // Default container rendering
    return (
      <div
        data-node-id={componentDetail.nodeId}
        className={cn("relative transition-all", rootHighlight)}
        style={rootStyles}
        onClick={handleRootClick}
        onMouseLeave={handleMouseLeave}
      >
        {props.childElements!.map((child, index) => (
          <ChildRenderer
            key={child.nodeId || index}
            element={child}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            onNodeSelect={onNodeSelect}
            onNodeHover={onNodeHover}
          />
        ))}
      </div>
    );
  }

  // Render interactive input component (no children)
  if (isInput) {
    const inputId = `input-${componentDetail.id}`;
    return (
      <div
        data-node-id={componentDetail.nodeId}
        className={cn("transition-all", rootHighlight)}
        onClick={handleRootClick}
        onMouseLeave={handleMouseLeave}
      >
        <input
          type="text"
          value={localInputValues[inputId] || ""}
          onChange={(e) =>
            setLocalInputValues((prev) => ({
              ...prev,
              [inputId]: e.target.value,
            }))
          }
          placeholder={
            props.textContents?.[0]?.characters || "Digite aqui..."
          }
          className="outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            ...rootStyles,
            cursor: "text",
          }}
        />
      </div>
    );
  }

  // Render interactive button component (no children, use text contents)
  if (isButton) {
    const buttonText =
      props.textContents?.[0]?.characters ||
      activeVariantName ||
      componentDetail.name;
    const textColor = props.textContents?.[0]
      ? undefined
      : "#ffffff"; // Default to white if no text content info

    return (
      <button
        data-node-id={componentDetail.nodeId}
        className={cn(
          "cursor-pointer hover:opacity-90 active:opacity-80 transition-all",
          rootHighlight
        )}
        style={{
          ...rootStyles,
          color: textColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNodeSelect?.(componentDetail.nodeId);
        }}
        onMouseEnter={() => onNodeHover?.(componentDetail.nodeId)}
        onMouseLeave={handleMouseLeave}
      >
        {buttonText}
      </button>
    );
  }

  // Render checkbox/switch component (no children)
  if (isCheckbox) {
    const label =
      props.textContents?.[0]?.characters || componentDetail.name;
    return (
      <label
        data-node-id={componentDetail.nodeId}
        className={cn(
          "cursor-pointer flex items-center gap-2 transition-all",
          rootHighlight
        )}
        style={rootStyles}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => onNodeHover?.(componentDetail.nodeId)}
        onMouseLeave={handleMouseLeave}
      >
        <input type="checkbox" className="w-4 h-4 cursor-pointer" />
        <span>{label}</span>
      </label>
    );
  }

  // Render component with text contents only (no children structure)
  if (props.textContents && props.textContents.length > 0) {
    return (
      <div
        data-node-id={componentDetail.nodeId}
        className={cn("transition-all", rootHighlight)}
        style={rootStyles}
        onClick={handleRootClick}
        onMouseLeave={handleMouseLeave}
      >
        {props.textContents.map((text, index) => (
          <span
            key={text.nodeId || index}
            data-node-id={text.nodeId}
            className={cn(
              "cursor-pointer transition-all",
              text.nodeId === selectedNodeId
                ? "outline outline-2 outline-blue-500 outline-offset-1"
                : text.nodeId === hoveredNodeId
                  ? "outline outline-1 outline-blue-300 outline-offset-1"
                  : ""
            )}
            style={{
              fontFamily: text.style.fontFamily,
              fontSize: text.style.fontSize
                ? `${text.style.fontSize}px`
                : undefined,
              fontWeight: text.style.fontWeight,
              letterSpacing: text.style.letterSpacing
                ? `${text.style.letterSpacing}px`
                : undefined,
              lineHeight:
                text.style.lineHeight && text.style.lineHeight !== "AUTO"
                  ? typeof text.style.lineHeight === "number"
                    ? `${text.style.lineHeight}px`
                    : text.style.lineHeight
                  : undefined,
              display: "block",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNodeSelect?.(text.nodeId);
            }}
            onMouseEnter={() => onNodeHover?.(text.nodeId)}
          >
            {text.characters}
          </span>
        ))}
      </div>
    );
  }

  // Fallback: render basic component shape with visual properties
  return (
    <div
      data-node-id={componentDetail.nodeId}
      className={cn(
        "flex items-center justify-center text-sm transition-all",
        rootHighlight
      )}
      style={{
        ...rootStyles,
        minWidth: rootStyles.width || "120px",
        minHeight: rootStyles.height || "48px",
        backgroundColor: rootStyles.backgroundColor || "#f5f5f5",
        border: rootStyles.border || "1px dashed #ccc",
      }}
      onClick={handleRootClick}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-gray-600 px-4 py-2">{componentDetail.name}</span>
    </div>
  );
}
