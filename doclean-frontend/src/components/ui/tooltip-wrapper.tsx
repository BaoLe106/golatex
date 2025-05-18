import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  tooltipContent: string;
  side?: "top" | "right" | "bottom" | "left" | undefined
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  tooltipContent,
  side
}) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { TooltipWrapper };
