import React, { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { responsibleAuthorityService } from "@/services/responsibleAuthorityService";
import { ResponsibleAuthority } from "@/types/responsibleAuthorities";
import { StageType } from "@/types/stageTypes";

interface StageTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: StageType | null;
  onSave: (
    data: {
      name: string;
      display_name: string;
      description: string;
      responsible_authority_id: number;
    },
    editId?: number
  ) => Promise<void>;
}

const StageTypeModal: React.FC<StageTypeModalProps> = ({ open, onOpenChange, editItem, onSave }) => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleAuthorityId, setResponsibleAuthorityId] = useState<number | null>(null);
  const [responsibleAuthorities, setResponsibleAuthorities] = useState<ResponsibleAuthority[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAuthorities, setIsLoadingAuthorities] = useState(false);
  const { toast } = useToast();

  const loadResponsibleAuthorities = useCallback(async () => {
    setIsLoadingAuthorities(true);
    try {
      const response = await responsibleAuthorityService.getResponsibleAuthorities({
        page: 1,
        limit: 100,
      });
      setResponsibleAuthorities(response.items);
    } catch (_error) {
      toast({
        title: "Failed to load responsible authorities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAuthorities(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadResponsibleAuthorities();
    }
  }, [open, loadResponsibleAuthorities]);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDisplayName(editItem.display_name);
      setDescription(editItem.description);
      setResponsibleAuthorityId(editItem.responsible_authority_id);
    } else {
      setName("");
      setDisplayName("");
      setDescription("");
      setResponsibleAuthorityId(null);
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Please enter a stage type name",
        variant: "destructive",
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (!responsibleAuthorityId) {
      toast({
        title: "Please select a responsible authority",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 200) {
      toast({
        title: "Stage type name must be 200 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (displayName.length > 200) {
      toast({
        title: "Display name must be 200 characters or less",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(
        {
          name: name.trim(),
          display_name: displayName.trim(),
          description: description.trim(),
          responsible_authority_id: responsibleAuthorityId,
        },
        editItem?.id
      );
      onOpenChange(false);
    } catch (_error) {
      // Error handling could be added here if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      // When closing the modal, reset the form like Cancel button
      setName(editItem?.name || "");
      setDisplayName(editItem?.display_name || "");
      setDescription(editItem?.description || "");
      setResponsibleAuthorityId(editItem?.responsible_authority_id || null);
    }
    if (!isLoading) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Stage Type" : "Create New Stage Type"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-sm mb-2 block">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter stage type name"
              className="h-8"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="displayName" className="text-sm mb-2 block">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name (Hebrew)"
              className="h-8"
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{displayName.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter stage type description"
              className="min-h-[60px]"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="responsibleAuthority" className="text-sm mb-2 block">
              Responsible Authority
            </Label>
            <Select
              value={responsibleAuthorityId?.toString() || ""}
              onValueChange={(value) => setResponsibleAuthorityId(parseInt(value))}
              disabled={isLoading || isLoadingAuthorities}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={isLoadingAuthorities ? "Loading..." : "Select authority"} />
              </SelectTrigger>
              <SelectContent>
                {responsibleAuthorities.map((authority) => (
                  <SelectItem key={authority.id} value={authority.id.toString()}>
                    {authority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleClose} size="sm" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isLoading}>
              {isLoading ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StageTypeModal;
