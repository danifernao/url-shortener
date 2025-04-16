import { useEffect, useRef } from "react";

interface TooltipProps {
  children: React.ReactNode;
  isVisible: boolean;
  sourceId: string;
}

function Tooltip({ children, isVisible, sourceId }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = (): void => {
    const tooltip = tooltipRef.current;
    const sourceElem = document.querySelector<HTMLElement>(`#${sourceId}`);
    const top = sourceElem!.offsetTop - tooltip!.offsetHeight;
    const left =
      sourceElem!.offsetLeft +
      (sourceElem!.offsetWidth - tooltip!.offsetWidth) / 2;

    tooltip!.style.top = `calc(${top}px - 0.5rem)`;
    tooltip!.style.left = `${left}px`;

    tooltip!.classList.add("visible");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      tooltip!.classList.remove("visible");
    }, 3000);
  };

  const hideTooltip = (): void => {
    tooltipRef!.current!.classList.remove("visible");
  };

  useEffect(() => {
    if (isVisible) {
      showTooltip();
    } else {
      hideTooltip();
    }
  }, [isVisible]);

  return (
    <div
      id={`${sourceId}-tooltip`}
      className="tooltip"
      ref={tooltipRef}
      role="tooltip"
    >
      {children}
    </div>
  );
}

export default Tooltip;
