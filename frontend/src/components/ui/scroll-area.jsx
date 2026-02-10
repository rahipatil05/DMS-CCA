import * as React from "react"
import { cn } from "@/lib/utils"

function ScrollArea({ className, children, viewportRef, ...props }) {
    return (
        <div
            data-slot="scroll-area"
            className={cn("relative overflow-hidden", className)}
            {...props}
        >
            <div ref={viewportRef} className="h-full w-full overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

export { ScrollArea }
