"use client";

import { useState } from "react";
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
import { fetchWithAuth } from "@/lib/client-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileJson, FileType } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Export format and fields
  const [exportFormat, setExportFormat] = useState("csv");
  const [selectedFields, setSelectedFields] = useState({
    date: true,
    jobLink: true,
    status: true,
    price: true,
    notes: true,
    createdAt: false,
    updatedAt: false,
  });

  const handleFieldChange = (field: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (status) queryParams.append("status", status);
      if (minPrice) queryParams.append("minPrice", minPrice);
      if (maxPrice) queryParams.append("maxPrice", maxPrice);
      if (searchQuery) queryParams.append("search", searchQuery);

      // Add format parameter
      queryParams.append("format", exportFormat);

      // Add fields parameter (only selected fields)
      const fields = Object.entries(selectedFields)
        .filter(([_, selected]) => selected)
        .map(([field]) => field);

      if (fields.length > 0) {
        queryParams.append("fields", fields.join(","));
      }

      // Fetch data with filters
      const response = await fetchWithAuth(
        `/api/proposals/export?${queryParams.toString()}`
      );

      if (!response || !response.ok) {
        throw new Error("Failed to export proposals");
      }

      if (exportFormat === "csv") {
        // Download CSV file
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `proposals_${new Date()
          .toISOString()
          .split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For JSON format, download as a JSON file
        const jsonData = await response.json();
        const blob = new Blob(
          [JSON.stringify(jsonData, null, 2)],
          { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `proposals_${new Date()
          .toISOString()
          .split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export successful",
        description: `Your proposals have been exported as a ${exportFormat.toUpperCase()} file.`,
      });
    } catch (error) {
      console.error("Error exporting proposals:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export proposals. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Proposals</h1>
        <p className="text-muted-foreground mt-2">
          Export your proposal data for backup or analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Configure your export preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="exportFormat">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center">
                        <FileType className="mr-2 h-4 w-4" />
                        <span>CSV (Excel, Sheets)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center">
                        <FileJson className="mr-2 h-4 w-4" />
                        <span>JSON (Data)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fields">
                <AccordionTrigger>Fields to Include</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-date"
                        checked={selectedFields.date}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("date", checked)
                        }
                      />
                      <label
                        htmlFor="field-date"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Date
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-jobLink"
                        checked={selectedFields.jobLink}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("jobLink", checked)
                        }
                      />
                      <label
                        htmlFor="field-jobLink"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Job Link
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-status"
                        checked={selectedFields.status}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("status", checked)
                        }
                      />
                      <label
                        htmlFor="field-status"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Status
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-price"
                        checked={selectedFields.price}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("price", checked)
                        }
                      />
                      <label
                        htmlFor="field-price"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Price
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-notes"
                        checked={selectedFields.notes}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("notes", checked)
                        }
                      />
                      <label
                        htmlFor="field-notes"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Notes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-createdAt"
                        checked={selectedFields.createdAt}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("createdAt", checked)
                        }
                      />
                      <label
                        htmlFor="field-createdAt"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Created At
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="field-updatedAt"
                        checked={selectedFields.updatedAt}
                        onCheckedChange={(checked: boolean) =>
                          handleFieldChange("updatedAt", checked)
                        }
                      />
                      <label
                        htmlFor="field-updatedAt"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Updated At
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filters">
                <AccordionTrigger>Filters</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="export-startDate">Start Date</Label>
                      <Input
                        id="export-startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-endDate">End Date</Label>
                      <Input
                        id="export-endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="export-status">
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any status</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="viewed">Viewed</SelectItem>
                          <SelectItem value="interviewed">Interviewed</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-search">Search</Label>
                      <Input
                        id="export-search"
                        type="text"
                        placeholder="Search in job links and notes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-minPrice">Minimum Price ($)</Label>
                      <Input
                        id="export-minPrice"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-maxPrice">Maximum Price ($)</Label>
                      <Input
                        id="export-maxPrice"
                        type="number"
                        placeholder="1000"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={isExporting}
                      size="sm"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting
                ? "Exporting..."
                : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
