
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { EMF, EMFCost } from '@/types';
import { formatDate, calculateDaysSince, getTodayString } from '@/utils/dateUtils';

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
  const [expandedEMF, setExpandedEMF] = useState<string | null>(null);

  const addEMF = () => {
    const newEMF: EMF = {
      id: `emf-${Date.now()}`,
      purpose_id: '',
      creation_date: getTodayString(),
      costs: []
    };
    onEMFsChange([...emfs, newEMF]);
  };

  const updateEMF = (emfId: string, updates: Partial<EMF>) => {
    onEMFsChange(
      emfs.map(emf => emf.id === emfId ? { ...emf, ...updates } : emf)
    );
  };

  const deleteEMF = (emfId: string) => {
    onEMFsChange(emfs.filter(emf => emf.id !== emfId));
  };

  const addCost = (emfId: string) => {
    const newCost: EMFCost = {
      id: `cost-${Date.now()}`,
      emf_id: emfId,
      amount: 0,
      currency: 'USD'
    };
    
    updateEMF(emfId, {
      costs: [...(emfs.find(emf => emf.id === emfId)?.costs || []), newCost]
    });
  };

  const updateCost = (emfId: string, costId: string, updates: Partial<EMFCost>) => {
    const emf = emfs.find(e => e.id === emfId);
    if (emf) {
      updateEMF(emfId, {
        costs: emf.costs.map(cost => cost.id === costId ? { ...cost, ...updates } : cost)
      });
    }
  };

  const deleteCost = (emfId: string, costId: string) => {
    const emf = emfs.find(e => e.id === emfId);
    if (emf) {
      updateEMF(emfId, {
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

      {emfs.map((emf) => (
        <Card key={emf.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                EMF {emf.id}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Total: ${getTotalCost(emf).toFixed(2)}
                </span>
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedEMF(expandedEMF === emf.id ? null : emf.id)}
                  >
                    {expandedEMF === emf.id ? 'Collapse' : 'Expand'}
                  </Button>
                )}
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEMF(emf.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {(expandedEMF === emf.id || isReadOnly) && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Creation Date</Label>
                  <Input
                    type="date"
                    value={emf.creation_date}
                    onChange={(e) => updateEMF(emf.id, { creation_date: e.target.value })}
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
                    onChange={(e) => updateEMF(emf.id, { demand_id: e.target.value })}
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
                    onChange={(e) => updateEMF(emf.id, { order_id: e.target.value })}
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
                    onChange={(e) => updateEMF(emf.id, { bikushit_id: e.target.value })}
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
                    <Button onClick={() => addCost(emf.id)} size="sm" variant="outline">
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
                      onChange={(e) => updateCost(emf.id, cost.id, { amount: Number(e.target.value) })}
                      disabled={isReadOnly}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground w-8">{cost.currency}</span>
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCost(emf.id, cost.id)}
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
