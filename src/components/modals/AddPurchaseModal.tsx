import { Plus, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBudgetSources } from "@/hooks/useBudgetSources";
import { Currency, getCurrencyDisplayName, CreatePurchaseRequest } from "@/types";

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchaseData: CreatePurchaseRequest) => void;
  purposeId: number;
  isLoading?: boolean;
}

interface CostFormData {
  amount: number;
  currency: Currency;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  purposeId,
  isLoading = false,
}) => {
  const [costs, setCosts] = useState<CostFormData[]>([{ amount: 0, currency: Currency.ILS }]);
  const [selectedBudgetSourceId, setSelectedBudgetSourceId] = useState<string>("");
  const { data: budgetSourcesData } = useBudgetSources();

  const addCost = () => {
    // Determine the appropriate default currency for the new cost
    let defaultCurrency = Currency.ILS;

    if (costs.length === 1) {
      const firstCurrency = costs[0].currency;
      if (firstCurrency === Currency.SUPPORT_USD) {
        defaultCurrency = Currency.AVAILABLE_USD;
      } else if (firstCurrency === Currency.AVAILABLE_USD) {
        defaultCurrency = Currency.SUPPORT_USD;
      }
    }

    setCosts([...costs, { amount: 0, currency: defaultCurrency }]);
  };

  const removeCost = (index: number) => {
    if (costs.length > 1) {
      setCosts(costs.filter((_, i) => i !== index));
    }
  };

  // Check if we can add more costs based on currency mixing rules
  const canAddMoreCosts = () => {
    if (costs.length >= 2) return false; // Max 2 costs

    if (costs.length === 1) {
      const firstCurrency = costs[0].currency;
      // If first cost is ILS, can't add more
      if (firstCurrency === Currency.ILS) return false;
      // If first cost is USD, can add one more
      return firstCurrency === Currency.SUPPORT_USD || firstCurrency === Currency.AVAILABLE_USD;
    }

    return true; // Can always add first cost
  };

  // Get available currencies based on existing costs
  const getAvailableCurrencies = (currentIndex: number) => {
    // First cost can always be any currency
    if (currentIndex === 0) {
      return Object.values(Currency);
    }

    // For second cost, check what the first cost currency is
    if (costs.length >= 2 && currentIndex === 1) {
      const firstCurrency = costs[0].currency;

      if (firstCurrency === Currency.ILS) {
        // This shouldn't happen due to our validation, but return empty array to prevent selection
        return [];
      }

      if (firstCurrency === Currency.SUPPORT_USD) {
        return [Currency.AVAILABLE_USD];
      }

      if (firstCurrency === Currency.AVAILABLE_USD) {
        return [Currency.SUPPORT_USD];
      }

      // Fallback: allow USD types only
      return [Currency.SUPPORT_USD, Currency.AVAILABLE_USD];
    }

    return Object.values(Currency);
  };

  const updateCost = (index: number, field: keyof CostFormData, value: number | Currency) => {
    const updatedCosts = [...costs];
    updatedCosts[index] = { ...updatedCosts[index], [field]: value };

    // Special handling for currency changes on the first cost
    if (field === "currency" && index === 0 && costs.length > 1) {
      const newFirstCurrency = value as Currency;

      // If changing to ILS, remove all other costs (ILS can't be mixed)
      if (newFirstCurrency === Currency.ILS) {
        setCosts([updatedCosts[0]]);
        return;
      }

      // If changing between USD types, automatically update the second cost to the complementary type
      const currentSecondCurrency = costs[1].currency;

      if (newFirstCurrency === Currency.SUPPORT_USD) {
        // First cost is now USD Support, second should be USD Available
        if (currentSecondCurrency !== Currency.AVAILABLE_USD) {
          updatedCosts[1] = {
            ...updatedCosts[1],
            currency: Currency.AVAILABLE_USD,
          };
        }
      } else if (newFirstCurrency === Currency.AVAILABLE_USD) {
        // First cost is now USD Available, second should be USD Support
        if (currentSecondCurrency !== Currency.SUPPORT_USD) {
          updatedCosts[1] = {
            ...updatedCosts[1],
            currency: Currency.SUPPORT_USD,
          };
        }
      }
    }

    setCosts(updatedCosts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate costs
    const validCosts = costs.filter((cost) => cost.amount > 0);
    if (validCosts.length === 0) {
      return;
    }

    // Validate budget source
    if (!selectedBudgetSourceId) {
      return;
    }

    const purchaseData: CreatePurchaseRequest = {
      purpose_id: purposeId,
      budget_source_id: parseInt(selectedBudgetSourceId),
      costs: validCosts.map((cost) => ({
        amount: cost.amount,
        currency: cost.currency,
      })),
    };

    onSubmit(purchaseData);
  };

  const handleClose = () => {
    // Reset to initial state
    setCosts([{ amount: 0, currency: Currency.ILS }]);
    setSelectedBudgetSourceId("");
    onClose();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCosts([{ amount: 0, currency: Currency.ILS }]);
      setSelectedBudgetSourceId("");
    }
  }, [isOpen]);

  const isFormValid = costs.some((cost) => cost.amount > 0) && selectedBudgetSourceId !== "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Purchase</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Budget Source <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedBudgetSourceId} onValueChange={setSelectedBudgetSourceId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a budget source" />
                </SelectTrigger>
                <SelectContent>
                  {budgetSourcesData?.items?.map((budgetSource) => (
                    <SelectItem key={budgetSource.id} value={budgetSource.id.toString()}>
                      {budgetSource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Costs <span className="text-red-500">*</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addCost} disabled={!canAddMoreCosts()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cost
              </Button>
            </div>

            <div className="space-y-3">
              {costs.map((cost, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cost.amount || ""}
                      onChange={(e) => updateCost(index, "amount", Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Currency</Label>
                    <Select
                      key={`cost-${index}-currency-${costs.map((c) => c.currency).join("-")}`}
                      value={cost.currency}
                      onValueChange={(value) => updateCost(index, "currency", value as Currency)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCurrencies(index).map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {getCurrencyDisplayName(currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {costs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCost(index)}
                      className="mt-6"
                      title="Remove this cost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {!costs.some((cost) => cost.amount > 0) && (
              <p className="text-sm text-red-500">Please add at least one cost with an amount greater than 0.</p>
            )}
            
            {!selectedBudgetSourceId && costs.some((cost) => cost.amount > 0) && (
              <p className="text-sm text-red-500">Please select a budget source.</p>
            )}

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Currency Rules:</p>
              <ul className="text-xs space-y-1">
                <li>
                  • <strong>ILS:</strong> Only one cost allowed
                </li>
                <li>
                  • <strong>USD:</strong> You can add both USD Support and USD Available (max 2 costs)
                </li>
                <li>• You cannot mix ILS with USD currencies</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? "Creating..." : "Create Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
