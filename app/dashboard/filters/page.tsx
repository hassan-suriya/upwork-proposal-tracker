"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FiltersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiltering(true);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (status && status !== "any") queryParams.append("status", status);
      if (minPrice) queryParams.append("minPrice", minPrice);
      if (maxPrice) queryParams.append("maxPrice", maxPrice);
      if (searchQuery) queryParams.append("search", searchQuery);
      
      // Navigate to proposals page with filters
      const queryString = queryParams.toString();
      router.push(`/dashboard/proposals${queryString ? `?${queryString}` : ""}`);
      
      toast({
        title: "Filters applied",
        description: "Your filters have been applied to the proposals list.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply filters. Please try again.",
      });
    } finally {
      setIsFiltering(false);
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setStatus("any");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Filter Proposals</h1>
        <p className="text-muted-foreground mt-2">
          Narrow down proposals using various criteria
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>
            Apply filters to find specific proposals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilter} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search in job links and notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Price ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Price ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isFiltering}
              >
                Clear Filters
              </Button>
              <Button type="submit" disabled={isFiltering}>
                {isFiltering ? "Applying Filters..." : "Apply Filters"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
