"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IProposal } from "@/models/Proposal";

interface ProposalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<IProposal>) => Promise<void>;
  defaultValues?: Partial<IProposal>;
  title?: string;
}

export default function ProposalForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  title = "Add New Proposal"
}: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: {
      date: defaultValues.date ? new Date(defaultValues.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      jobLink: defaultValues.jobLink || "",
      status: defaultValues.status || "applied",
      price: defaultValues.price || 0,
      notes: defaultValues.notes || ""
    }
  });

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setValue('status', value as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: true })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">Date is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobLink">Job Link</Label>
            <Input
              id="jobLink"
              placeholder="https://www.upwork.com/jobs/..."
              {...register("jobLink", { required: true })}
            />
            {errors.jobLink && (
              <p className="text-sm text-destructive">Job link is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={defaultValues.status || "applied"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="50"
              {...register("price", { required: true, min: 0 })}
            />
            {errors.price && (
              <p className="text-sm text-destructive">
                Price is required and must be a positive number
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes about this proposal..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
