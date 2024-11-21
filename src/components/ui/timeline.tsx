import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-6", className)}
    {...props}
  />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative pb-6 pl-6", className)}
    {...props}
  />
))
TimelineItem.displayName = "TimelineItem"

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-0 flex w-6 h-6 items-center justify-center",
      "rounded-full border bg-background",
      className
    )}
    {...props}
  >
    <div className="h-2 w-2 rounded-full bg-primary" />
  </div>
))
TimelineIcon.displayName = "TimelineIcon"

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 text-sm font-medium",
      className
    )}
    {...props}
  />
))
TimelineHeader.displayName = "TimelineHeader"

const TimelineBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-2 text-muted-foreground", className)}
    {...props}
  />
))
TimelineBody.displayName = "TimelineBody"

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-2.5 top-6 -bottom-6 w-px bg-border",
      className
    )}
    {...props}
  />
))
TimelineConnector.displayName = "TimelineConnector"

export {
  Timeline,
  TimelineItem,
  TimelineIcon,
  TimelineHeader,
  TimelineBody,
  TimelineConnector,
}