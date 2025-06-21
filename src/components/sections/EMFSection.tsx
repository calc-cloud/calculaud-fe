
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
}

export const EMFSection: React.FC<EMFSectionProps> = ({
  emfs,
  onEMFsChange,
  isReadOnly
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
  };

  const updateEMF = (emfIndex: number, updates: Partial<EMF>) => {
    onEMFsChange(
      emfs.map((emf, index) => index === emfIndex ? { ...emf, ...updates } : emf)
    );
  };

  const deleteEMF = (emfIndex: number) => {
    onEMFsChange(emfs.filter((_, index) => index !== emfIndex));
  };

  const addCost = (emfIndex: number) => {
    const newCost: EMFCost = {
      id: `cost-${Date.now()}`,
      emf_id: emfs[emfIndex].id,
      amount: 0,
      currency: 'USD'
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

  const getTotalCost = (emf: EMF) => {
    return emf.costs.reduce((sum, cost) => sum + cost.amount, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">EMFs</h3>
        {!isReadOnly && (
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
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {emf.id || 'New EMF'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Total: ${getTotalCost(emf).toFixed(2)}
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EMF ID</Label>
                  <Input
                    value={emf.id}
                    onChange={(e) => updateEMF(index, { id: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Enter EMF ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Creation Date</Label>
                  <Input
                    type="date"
                    value={emf.creation_date}
                    onChange={(e) => updateEMF(index, { creation_date: e.target.value })}
                    disabled={isReadOnly}
                  />
                  <span className="text-xs text-muted-foreground">
                    {calculateDaysSince(emf.creation_date)} days ago
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Demand ID</Label>
                  <Input
                    value={emf.demand_id || ''}
                    onChange={(e) => updateEMF(index, { demand_id: e.target.value })}
                    disabled={isReadOnly}
                  />
                  {emf.demand_date && (
                    <span className="text-xs text-muted-foreground">
                      {calculateDaysSince(emf.demand_date)} days since demand
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Order ID</Label>
                  <Input
                    value={emf.order_id || ''}
                    onChange={(e) => updateEMF(index, { order_id: e.target.value })}
                    disabled={isReadOnly}
                  />
                  {emf.order_date && (
                    <span className="text-xs text-muted-foreground">
                      {calculateDaysSince(emf.order_date)} days since order
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Bikushit ID</Label>
                  <Input
                    value={emf.bikushit_id || ''}
                    onChange={(e) => updateEMF(index, { bikushit_id: e.target.value })}
                    disabled={isReadOnly}
                  />
                  {emf.bikushit_date && (
                    <span className="text-xs text-muted-foreground">
                      {calculateDaysSince(emf.bikushit_date)} days since bikushit
                    </span>
                  )}
                </div>
              </div>

              {/* Costs Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Costs</Label>
                  {!isReadOnly && (
                    <Button onClick={() => addCost(index)} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Cost
                    </Button>
                  )}
                </div>

                {emf.costs.map((cost) => (
                  <div key={cost.id} className="flex items-center gap-2 p-2 border rounded">
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
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  <p className="text-muted-foreground text-xs">No costs added yet.</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
