
'use client';

import { UserSearch } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
        <UserSearch className="h-12 w-12 text-muted-foreground animate-pulse" />
    </div>
  );
}
