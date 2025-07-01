"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IProposal } from "@/models/Proposal";
import ProposalForm from "@/components/proposal-form";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ProposalListProps {
  proposals: IProposal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (id: string, data: Partial<IProposal>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isViewer?: boolean;
}

export default function ProposalList({
  proposals,
  pagination,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  isViewer = false
}: ProposalListProps) {
  const [editingProposal, setEditingProposal] = useState<IProposal | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (proposal: IProposal) => {
    setEditingProposal(proposal);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: Partial<IProposal>) => {
    if (editingProposal) {
      await onEdit(editingProposal._id.toString(), data);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingProposalId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProposalId) {
      await onDelete(deletingProposalId);
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-500";
      case "viewed":
        return "bg-amber-500";
      case "interviewed":
        return "bg-purple-500";
      case "hired":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-lg">Loading proposals...</div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <p className="text-lg">No proposals found</p>
          {isViewer ? (
            <p className="text-sm text-muted-foreground">
              No proposals have been submitted by the freelancer yet
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add your first proposal to get started
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Job Link</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Price ($)</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                  {!isViewer && (
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr
                    key={proposal._id.toString()}
                    className="border-b hover:bg-accent/50"
                  >
                    <td className="px-4 py-3">
                      {new Date(proposal.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={proposal.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {proposal.jobLink.length > 30
                          ? `${proposal.jobLink.slice(0, 30)}...`
                          : proposal.jobLink}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`${getStatusColor(proposal.status)} text-white capitalize`}
                      >
                        {proposal.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">${proposal.price}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {proposal.notes}
                    </td>
                    {!isViewer && (
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(proposal)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(proposal._id.toString())
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingProposal && (
        <ProposalForm
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditSubmit}
          defaultValues={editingProposal}
          title="Edit Proposal"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              proposal from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
