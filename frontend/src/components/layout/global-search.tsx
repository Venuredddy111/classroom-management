import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useCustom } from "@refinedev/core";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { SearchResults } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { result } = useCustom<SearchResults>({
    url: `${API_URL}/search`,
    method: "get",
    config: { query: { q: debouncedQuery } },
    queryOptions: { enabled: debouncedQuery.trim().length >= 2 },
  });

  const results = result?.data ?? {};
  const hasResults = Object.values(results).some((arr) => arr && arr.length > 0);

  function go(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open && query.trim().length >= 2}>
      <Command shouldFilter={false} className="w-72 overflow-visible bg-transparent">
        <PopoverAnchor asChild>
          <CommandInput
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setOpen(true);
            }}
            placeholder="Search..."
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-72 p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={() => setOpen(false)}
        >
          <CommandList>
            {hasResults ? (
              <>
                {results.departments?.length ? (
                  <CommandGroup heading="Departments">
                    {results.departments.map((d) => (
                      <CommandItem key={`d-${d.id}`} onSelect={() => go(`/departments/show/${d.id}`)}>
                        {d.name} ({d.code})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {results.subjects?.length ? (
                  <CommandGroup heading="Subjects">
                    {results.subjects.map((s) => (
                      <CommandItem key={`s-${s.id}`} onSelect={() => go(`/subjects/show/${s.id}`)}>
                        {s.name} ({s.code})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {results.classes?.length ? (
                  <CommandGroup heading="Classes">
                    {results.classes.map((c) => (
                      <CommandItem key={`c-${c.id}`} onSelect={() => go(`/classes/show/${c.id}`)}>
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {results.users?.length ? (
                  <CommandGroup heading="Users">
                    {results.users.map((u) => (
                      <CommandItem key={`u-${u.id}`} onSelect={() => go(`/users/show/${u.id}`)}>
                        {u.name} ({u.email})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </>
            ) : (
              <CommandEmpty>No results.</CommandEmpty>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
