import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search as SearchIcon, Filter } from "lucide-react";

const results = [
  { title: "Customer success playbook", context: "Task in Q4 launch", type: "Task" },
  { title: "Implementation checklist", context: "Document in Files", type: "Document" },
  { title: "Emma Davis", context: "Recruiter · People", type: "Person" },
];

const Search = () => {
  const [query, setQuery] = useState("customer");
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const state = location.state as { query?: string } | null;
    if (state?.query) {
      setQuery(state.query);
    }
  }, [location.state]);

  const handleFilter = () => {
    toast({
      title: "Filters",
      description: "Apply tags, owners, or activity type to narrow results.",
    });
  };

  const handleSearch = () => {
    toast({
      title: "Search submitted",
      description: `Showing results for "${query}" across your workspace.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col bg-gradient-subtle">
        <PageHeader
          title="Search"
          description="Find tasks, files, people, and updates across your workspace."
          actions={(
            <Button variant="outline" size="sm" onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          )}
        />

        <div className="p-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Search workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." />
                </div>
                <Button onClick={handleSearch} className="bg-gradient-primary text-white shadow-glow">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.title} className="rounded-lg border border-border/60 bg-card/80 p-4">
                    <p className="text-sm font-semibold text-foreground">{result.title}</p>
                    <p className="text-xs text-muted-foreground">{result.context}</p>
                    <p className="text-xs text-muted-foreground/70">{result.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Search;
