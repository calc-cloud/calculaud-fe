import { purposeService, Purpose as ApiPurpose } from "@/services/purposeService";
import { Purpose } from "@/types";

interface ToastFunction {
  (props: { title: string; description?: string; variant?: "default" | "destructive" }): void;
}

export const togglePurposeFlag = async (
  purpose: Purpose,
  toast: ToastFunction,
  onSuccess?: (updatedPurpose: ApiPurpose) => void | Promise<any>
) => {
  const newFlaggedState = !purpose.is_flagged;

  try {
    const updatedPurpose = await purposeService.toggleFlag(purpose.id, newFlaggedState);
    toast({
      title: newFlaggedState ? "Purpose flagged" : "Purpose unflagged",
      description: newFlaggedState
        ? "The purpose has been flagged successfully."
        : "The purpose has been unflagged successfully.",
    });

    if (onSuccess) {
      await onSuccess(updatedPurpose);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to toggle purpose flag";
    toast({
      title: `Error ${newFlaggedState ? "flagging" : "unflagging"} purpose`,
      description: errorMessage,
      variant: "destructive",
    });
  }
};

export const deletePurposeAction = async (
  purpose: Purpose,
  toast: ToastFunction,
  onSuccess?: (deletedPurposeId: number) => void | Promise<any>
) => {
  try {
    await purposeService.deletePurpose(purpose.id);
    toast({
      title: "Purpose deleted",
      description: "The purpose has been deleted successfully.",
    });

    if (onSuccess) {
      await onSuccess(Number(purpose.id));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete purpose";
    toast({
      title: "Error deleting purpose",
      description: errorMessage,
      variant: "destructive",
    });
  }
};
