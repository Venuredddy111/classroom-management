import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function AppErrorComponent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Sorry, the page you visited does not exist.</p>
      <Button asChild>
        <Link to="/">Back home</Link>
      </Button>
    </div>
  );
}
