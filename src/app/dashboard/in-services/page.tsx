
import { BookOpenCheck } from "lucide-react";

export default function InServicesPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <BookOpenCheck className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">In-Services</h3>
        <p className="text-sm text-muted-foreground">
          This page is under construction. In-service training and materials will be managed here.
        </p>
      </div>
    </div>
  );
}
