import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Purchase, Stage, Cost } from '@/types';
import { formatDate, calculateDaysSince, getTodayString } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';

interface PurchaseSectionProps {
  purchases: Purchase[];
  onPurchasesChange: (purchases: Purchase[]) => void;
  isReadOnly: boolean;
  hideAddButton?: boolean;
}

export const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  purchases,
  onPurchasesChange,
  isReadOnly,
  hideAddButton = false
}) => {
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);

  const addPurchase = () => {
    const newPurchase: Purchase = {
      id: '',
      purpose_id: '',
      creation_date: getTodayString(),
      costs: [],
      flow_stages: []
    };
    onPurchasesChange([...purchases, newPurchase]);
    setExpandedPurchase(purchases.length); // Automatically expand the new purchase
  };

  const updatePurchase = (purchaseIndex: number, updates: Partial<Purchase>) => {
    onPurchasesChange(
      purchases.map((purchase, index) => index === purchaseIndex ? { ...purchase, ...updates } : purchase)
    );
  };

  const deletePurchase = (purchaseIndex: number) => {
    onPurchasesChange(purchases.filter((_, index) => index !== purchaseIndex));
    if (expandedPurchase === purchaseIndex) {
      setExpandedPurchase(null);
    } else if (expandedPurchase !== null && expandedPurchase > purchaseIndex) {
      setExpandedPurchase(expandedPurchase - 1);
    }
  };

  const addCost = (purchaseIndex: number) => {
    const newCost: Cost = {
      id: `cost-${Date.now()}`,
      purchase_id: purchases[purchaseIndex].id,
      amount: 0,
      currency: 'USD',
      cost_type: 'SUPPORT'
    };
    
    updatePurchase(purchaseIndex, {
      costs: [...(purchases[purchaseIndex]?.costs || []), newCost]
    });
  };

  const updateCost = (purchaseIndex: number, costId: string, updates: Partial<Cost>) => {
    const purchase = purchases[purchaseIndex];
    if (purchase) {
      updatePurchase(purchaseIndex, {
        costs: purchase.costs.map(cost => cost.id === costId ? { ...cost, ...updates } : cost)
      });
    }
  };

  const deleteCost = (purchaseIndex: number, costId: string) => {
    const purchase = purchases[purchaseIndex];
    if (purchase) {
      updatePurchase(purchaseIndex, {
        costs: purchase.costs.filter(cost => cost.id !== costId)
      });
    }
  };

  const addStage = (purchaseIndex: number) => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      purchase_id: purchases[purchaseIndex].id,
      stage_type_id: '1',
      priority: purchases[purchaseIndex].flow_stages.length + 1,
      value: null,
      completion_date: null,
      stage_type: {
        id: '1',
        name: 'emf_id',
        value_required: true
      }
    };
    
    updatePurchase(purchaseIndex, {
      flow_stages: [...(purchases[purchaseIndex]?.flow_stages || []), newStage]
    });
  };

  const updateStage = (purchaseIndex: number, stageId: string, updates: Partial<Stage>) => {
    const purchase = purchases[purchaseIndex];
    if (purchase) {
      updatePurchase(purchaseIndex, {
        flow_stages: purchase.flow_stages.map(stage => 
          stage.id === stageId ? { ...stage, ...updates } : stage
        )
      });
    }
  };

  const deleteStage = (purchaseIndex: number, stageId: string) => {
    const purchase = purchases[purchaseIndex];
    if (purchase) {
      updatePurchase(purchaseIndex, {
        flow_stages: purchase.flow_stages.filter(stage => stage.id !== stageId)
      });
    }
  };

  const getTotalCostWithCurrencies = (purchase: Purchase) => {
    const costsByCurrency: { [key: string]: number } = {};
    
    purchase.costs.forEach(cost => {
      const key = `${cost.currency}_${cost.cost_type}`;
      if (!costsByCurrency[key]) {
        costsByCurrency[key] = 0;
      }
      costsByCurrency[key] += cost.amount;
    });

    const formatAmount = (amount: number) => {
      const formattedNumber = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
      return parseFloat(formattedNumber).toLocaleString();
    };

    const getCurrencySymbol = (currency: string) => {
      switch (currency) {
        case 'USD':
          return '$';
        case 'ILS':
          return '₪';
        default:
          return currency;
      }
    };

    const costStrings = Object.entries(costsByCurrency).map(
      ([key, amount]) => {
        const [currency, costType] = key.split('_');
        return `${getCurrencySymbol(currency)}${formatAmount(amount)} (${costType})`;
      }
    );

    return costStrings.length > 0 ? costStrings.join(', ') : '0';
  };

  const getStageProgress = (purchase: Purchase) => {
    const completedStages = purchase.flow_stages.filter(stage => stage.completion_date).length;
    const totalStages = purchase.flow_stages.length;
    return { completed: completedStages, total: totalStages };
  };

  const hasValidationErrors = (purchase: Purchase) => {
    return !purchase.creation_date || purchase.costs.length === 0;
  };

  const getStageIcon = (stage: Stage) => {
    return stage.completion_date ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {!isReadOnly && !hideAddButton && (
          <Button onClick={addPurchase} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        )}
      </div>

      {purchases.length === 0 && (
        <p className="text-muted-foreground text-sm">No purchases added yet.</p>
      )}

      {purchases.map((purchase, index) => {
        const progress = getStageProgress(purchase);
        
        return (
          <Card key={index} className={hasValidationErrors(purchase) && !isReadOnly ? 'border-red-300' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">Purchase</div>
                    <div className="font-medium text-gray-900">
                      Purchase #{index + 1}
                    </div>
                    {purchase.creation_date && (
                      <div className="text-gray-500 text-xs">
                        Created: {formatDate(purchase.creation_date)} ({calculateDaysSince(purchase.creation_date)} days ago)
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">Workflow Progress</div>
                    <Badge variant={progress.completed === progress.total && progress.total > 0 ? 'default' : 'secondary'}>
                      {progress.completed}/{progress.total} stages complete
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">Total Cost</div>
                    <div className="font-medium text-gray-900">
                      {getTotalCostWithCurrencies(purchase)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedPurchase(expandedPurchase === index ? null : index)}
                  >
                    {expandedPurchase === index ? 'Collapse' : 'Expand'}
                  </Button>
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePurchase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedPurchase === index && (
              <CardContent className="space-y-6">
                {/* Creation Date */}
                {!isReadOnly && (
                  <div className="space-y-2">
                    <Label>Creation Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={purchase.creation_date}
                      onChange={(e) => updatePurchase(index, { creation_date: e.target.value })}
                      className={!purchase.creation_date ? 'border-red-300' : ''}
                    />
                    {purchase.creation_date && (
                      <span className="text-xs text-muted-foreground">
                        {calculateDaysSince(purchase.creation_date)} days ago
                      </span>
                    )}
                  </div>
                )}

                {/* Workflow Stages */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Workflow Stages</Label>
                    {!isReadOnly && (
                      <Button onClick={() => addStage(index)} size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Stage
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {purchase.flow_stages
                      .sort((a, b) => a.priority - b.priority)
                      .map((stage) => (
                        <div key={stage.id} className="flex items-center gap-2 p-3 border rounded">
                          {getStageIcon(stage)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{stage.stage_type.name}</div>
                            {stage.value && (
                              <div className="text-xs text-gray-600">{stage.value}</div>
                            )}
                            {stage.completion_date && (
                              <div className="text-xs text-green-600">
                                Completed: {formatDate(stage.completion_date)}
                              </div>
                            )}
                          </div>
                          {!isReadOnly && (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Stage value"
                                value={stage.value || ''}
                                onChange={(e) => updateStage(index, stage.id, { value: e.target.value })}
                                className="w-32"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStage(index, stage.id, { 
                                  completion_date: stage.completion_date ? null : getTodayString()
                                })}
                              >
                                {stage.completion_date ? 'Mark Incomplete' : 'Mark Complete'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteStage(index, stage.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Costs Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Costs <span className="text-red-500">*</span>
                      {purchase.costs.length === 0 && !isReadOnly && (
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

                  <div className={purchase.costs.length === 0 && !isReadOnly ? 'border border-red-300 rounded p-2' : ''}>
                    {purchase.costs.map((cost) => (
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
                          onValueChange={(value) => updateCost(index, cost.id, { currency: value })}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="ILS">ILS</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={cost.cost_type}
                          onValueChange={(value) => updateCost(index, cost.id, { cost_type: value as 'SUPPORT' | 'AVAILABLE' })}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="SUPPORT">Support</SelectItem>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
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

                    {purchase.costs.length === 0 && (
                      <p className="text-muted-foreground text-xs p-2">
                        {isReadOnly ? 'No costs added yet.' : 'Please add at least one cost.'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}; 