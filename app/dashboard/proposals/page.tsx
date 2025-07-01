"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { IProposal } from "@/models/Proposal";
import ProposalForm from "@/components/proposal-form";
import ProposalList from "@/components/proposal-list";
import { Plus, Search, RefreshCw, Eye } from "lucide-react";
import { fetchWithAuth } from "@/lib/client-auth";
import { useAuth } from "@/components/auth-provider";

export default function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const { toast } = useToast();
  const router = useRouter();

  const fetchProposals = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetchWithAuth(`/api/proposals?${queryParams.toString()}`);
      if (!response || !response.ok) throw new Error("Failed to fetch proposals");

      const data = await response.json();
      setProposals(data.proposals);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProposals(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchProposals(page, searchQuery);
  };

  const handleAddProposal = async (proposal: Partial<IProposal>) => {
    try {
      const response = await fetchWithAuth("/api/proposals/create", {
        method: "POST",
        body: JSON.stringify(proposal),
      });

      if (!response || !response.ok) throw new Error("Failed to add proposal");

      toast({
        title: "Proposal added",
        description: "Your proposal has been added successfully.",
      });

      setShowForm(false);
      fetchProposals();
    } catch (error) {
      console.error("Error adding proposal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add proposal. Please try again.",
      });
    }
  };

  const handleEditProposal = async (id: string, updates: Partial<IProposal>) => {
    try {
      const response = await fetchWithAuth(`/api/proposals/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (!response || !response.ok) throw new Error("Failed to update proposal");

      toast({
        title: "Proposal updated",
        description: "Your proposal has been updated successfully.",
      });

      fetchProposals(pagination.page);
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update proposal. Please try again.",
      });
    }
  };

  const handleDeleteProposal = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/proposals/${id}`, {
        method: "DELETE",
      });

      if (!response || !response.ok) throw new Error("Failed to delete proposal");

      toast({
        title: "Proposal deleted",
        description: "Your proposal has been deleted successfully.",
      });

      fetchProposals(pagination.page);
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete proposal. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          {user?.role === 'viewer' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md mb-2 mt-2">
              <p className="font-semibold flex items-center">
                <Eye className="mr-2 h-4 w-4" /> Viewer Mode
              </p>
              <p className="text-sm">
                You are viewing the freelancer's proposal data in read-only mode.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Manage your Upwork proposals
            </p>
          )}
        </div>
        {user?.role !== 'viewer' && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Proposal
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposals List</CardTitle>
          <CardDescription>
            {user?.role === 'viewer' ? 
              "View all proposals submitted by the freelancer" : 
              "View and manage all your submitted proposals"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <form className="flex-1 flex gap-2" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search proposals..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <Button variant="outline" onClick={() => fetchProposals()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <ProposalList
            proposals={proposals}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onEdit={handleEditProposal}
            isViewer={user?.role === 'viewer'}
            onDelete={handleDeleteProposal}
          />
        </CardContent>
      </Card>

      <ProposalForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleAddProposal}
      />
    </div>
  );
}
