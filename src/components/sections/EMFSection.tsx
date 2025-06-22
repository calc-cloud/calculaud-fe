import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { EMF, EMFCost } from '@/types';
import { formatDate, calculateDaysSince, getTodayString } from '@/utils/dateUtils';
import { CURRENCIES } from '@/utils/constants';

interface EMFSectionProps {
  emfs: EMF[];
  onEMFsChange: (emfs: EMF[]) => void;
  isReadOnly: boolean;
  hideAddButton?: boolean;
}

export const EMFSection: React.FC<EMFSectionProps> = ({
  emfs,
  onEMFsChange,
  isReadOnly,
  hideAddButton = false
}) => {
  const [expandedEMF, setExpandedEMF] = useState<number | null>(null);

  const addEMF = () => {
    const newEMF: EMF = {
      id: '',
      purpose_id: '',
      creation_date: getTodayString(),
      costs: []
    };
    onEMFsChange([...emfs, newEMF]);
    setExpandedEMF(emfs.length); // Automatically expand the new EMF
  };

  const updateEMF = (emfIndex: number, updates: Partial<EMF>) => {
    onEMFsChange(
      emfs.map((emf, index) => index === emfIndex ? { ...emf, ...updates } : emf)
    );
  };

  const deleteEMF = (emfIndex: number) => {
    onEMFsChange(emfs.filter((_, index) => index !== emfIndex));
    if (expandedEMF === emfIndex) {
      setExpandedEMF(null);
    } else if (expandedEMF !== null && expandedEMF > emfIndex) {
      setExpandedEMF(expandedEMF - 1);
    }
  };

  const addCost = (emfIndex: number) => {
    const newCost: EMFCost = {
      id: `cost-${Date.now()}`,
      emf_id: emfs[emfIndex].id,
      amount: 0,
      currency: 'SUPPORT_USD'
    };
    
    updateEMF(emfIndex, {
      costs: [...(emfs[emfIndex]?.costs || []), newCost]
    });
  };

  const updateCost = (emfIndex: number, costId: string, updates: Partial<EMFCost>) => {
    const emf = emfs[emfIndex];
    if (emf) {
      updateEMF(emfIndex, {
        costs: emf.costs.map(cost => cost.id === costId ? { ...cost, ...updates } : cost)
      });
    }
  };

  const deleteCost = (emfIndex: number, costId: string) => {
    const emf = emfs[emfIndex];
    if (emf) {
      updateEMF(emfIndex, {
        costs: emf.costs.filter(cost => cost.id !== costId)
      });
    }
  };

  const getTotalCostWithCurrencies = (emf: EMF) => {
    const costsByCurrency: { [key: string]: number } = {};
    
    emf.costs.forEach(cost => {
      if (!costsByCurrency[cost.currency]) {
        costsByCurrency[cost.currency] = 0;
      }
      costsByCurrency[cost.currency] += cost.amount;
    });

    const formatAmount = (amount: number) => {
      const formattedNumber = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
      return parseFloat(formattedNumber).toLocaleString();
    };

    const getCurrencySymbol = (currency: string) => {
      switch (currency) {
        case 'SUPPORT_USD':
        case 'AVAILABLE_USD':
          return '$';
        case 'ILS':
          return '₪';
        default:
          return currency;
      }
    };

    const costStrings = Object.entries(costsByCurrency).map(
      ([currency, amount]) => `${getCurrencySymbol(currency)}${formatAmount(amount)}`
    );

    return costStrings.length > 0 ? costStrings.join(', ') : '0';
  };

  const hasValidationErrors = (emf: EMF) => {
    return !emf.id?.trim() || !emf.creation_date || emf.costs.length === 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {!isReadOnly && !hideAddButton && (
          <Button onClick={addEMF} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add EMF
          </Button>
        )}
      </div>

      {emfs.length === 0 && (
        <p className="text-muted-foreground text-sm">No EMFs added yet.</p>
      )}

      {emfs.map((emf, index) => (
        <Card key={index} className={hasValidationErrors(emf) && !isReadOnly ? 'border-red-300' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Show blocks when in view mode OR when in edit mode and collapsed */}
                {(isReadOnly || (!isReadOnly && expandedEMF !== index)) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">EMF</div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {emf.id || 'New EMF'}
                        {hasValidationErrors(emf) && !isReadOnly && (
                          <Badge variant="destructive" className="text-xs">
                            Incomplete
                          </Badge>
                        )}
                      </div>
                      {((isReadOnly && expandedEMF === index) || (!isReadOnly && expandedEMF !== index)) && emf.creation_date && (
                        <div className="text-gray-500 text-xs">
                          {formatDate(emf.creation_date)} ({calculateDaysSince(emf.creation_date)} days ago)
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">Bikushit</div>
                      <div className="font-medium text-gray-900">{emf.bikushit_id || 'No Bikushit ID'}</div>
                      {((isReadOnly && expandedEMF === index) || (!isReadOnly && expandedEMF !== index)) && emf.bikushit_creation_date && (
                        <div className="text-gray-500 text-xs">
                          {formatDate(emf.bikushit_creation_date)} ({calculateDaysSince(emf.bikushit_creation_date)} days ago)
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">Demand</div>
                      <div className="font-medium text-gray-900">{emf.demand_id || 'No Demand ID'}</div>
                      {((isReadOnly && expandedEMF === index) || (!isReadOnly && expandedEMF !== index)) && emf.demand_creation_date && (
                        <div className="text-gray-500 text-xs">
                          {formatDate(emf.demand_creation_date)} ({calculateDaysSince(emf.demand_creation_date)} days ago)
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">Order</div>
                      <div className="font-medium text-gray-900">{emf.order_id || 'No Order ID'}</div>
                      {((isReadOnly && expandedEMF === index) || (!isReadOnly && expandedEMF !== index)) && emf.order_creation_date && (
                        <div className="text-gray-500 text-xs">
                          {formatDate(emf.order_creation_date)} ({calculateDaysSince(emf.order_creation_date)} days ago)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">
                  Total: {getTotalCostWithCurrencies(emf)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedEMF(expandedEMF === index ? null : index)}
                >
                  {expandedEMF === index ? 'Collapse' : 'Expand'}
                </Button>
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEMF(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {expandedEMF === index && (
            <CardContent className="space-y-6">
              {/* ID Fields - only show in editing mode */}
              {!isReadOnly && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>EMF ID <span className="text-red-500">*</span></Label>
                    <Input
                      value={emf.id}
                      onChange={(e) => updateEMF(index, { id: e.target.value })}
                      placeholder="Enter EMF ID"
                      className={!emf.id?.trim() ? 'border-red-300' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bikushit ID</Label>
                    <Input
                      value={emf.bikushit_id || ''}
                      onChange={(e) => updateEMF(index, { bikushit_id: e.target.value })}
                      placeholder="Enter bikushit ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Demand ID</Label>
                    <Input
                      value={emf.demand_id || ''}
                      onChange={(e) => updateEMF(index, { demand_id: e.target.value })}
                      placeholder="Enter demand ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order ID</Label>
                    <Input
                      value={emf.order_id || ''}
                      onChange={(e) => updateEMF(index, { order_id: e.target.value })}
                      placeholder="Enter order ID"
                    />
                  </div>
                </div>
              )}

              {/* Creation Date Fields - only show in editing mode */}
              {!isReadOnly && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Creation Date <span className="text-red-500">*</span></Label>
                    <div>
                      <Input
                        type="date"
                        value={emf.creation_date}
                        onChange={(e) => updateEMF(index, { creation_date: e.target.value })}
                        className={!emf.creation_date ? 'border-red-300' : ''}
                      />
                      {emf.creation_date && (
                        <span className="text-xs text-muted-foreground">
                          {calculateDaysSince(emf.creation_date)} days ago
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bikushit Creation Date</Label>
                    <div>
                      <Input
                        type="date"
                        value={emf.bikushit_creation_date || ''}
                        onChange={(e) => updateEMF(index, { bikushit_creation_date: e.target.value })}
                      />
                      {emf.bikushit_creation_date && (
                        <span className="text-xs text-muted-foreground">
                          {calculateDaysSince(emf.bikushit_creation_date)} days since bikushit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Demand Creation Date</Label>
                    <div>
                      <Input
                        type="date"
                        value={emf.demand_creation_date || ''}
                        onChange={(e) => updateEMF(index, { demand_creation_date: e.target.value })}
                      />
                      {emf.demand_creation_date && (
                        <span className="text-xs text-muted-foreground">
                          {calculateDaysSince(emf.demand_creation_date)} days since demand
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Creation Date</Label>
                    <div>
                      <Input
                        type="date"
                        value={emf.order_creation_date || ''}
                        onChange={(e) => updateEMF(index, { order_creation_date: e.target.value })}
                      />
                      {emf.order_creation_date && (
                        <span className="text-xs text-muted-foreground">
                          {calculateDaysSince(emf.order_creation_date)} days since order
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Costs Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Costs <span className="text-red-500">*</span>
                    {emf.costs.length === 0 && !isReadOnly && (
                      <span className="text-red-500 text-xs ml-2">(At least one cost required)</span>
                    )}
                  </Label>
                  {!isReadOnly && (
                    <Button onClick={() => addCost(index)} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Cost
                    </Button>
                  )}
                </div>

                <div className={emf.costs.length === 0 && !isReadOnly ? 'border border-red-300 rounded p-2' : ''}>
                  {emf.costs.map((cost) => (
                    <div key={cost.id} className="flex items-center gap-2 p-2 border rounded mb-2 last:mb-0">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={cost.amount}
                        onChange={(e) => updateCost(index, cost.id, { amount: Number(e.target.value) })}
                        disabled={isReadOnly}
                        className="w-32"
                      />
                      <Select
                        value={cost.currency}
                        onValueChange={(value) => updateCost(index, cost.id, { currency: value as any })}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCost(index, cost.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {emf.costs.length === 0 && (
                    <p className="text-muted-foreground text-xs p-2">
                      {isReadOnly ? 'No costs added yet.' : 'Please add at least one cost.'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
