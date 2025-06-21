
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface HierarchyItem {
  id: string;
  unit: string;
  center: string;
  anaf: string;
  mador: string;
  team: string;
  name: string;
}

const HierarchyManagement = () => {
  const [hierarchies, setHierarchies] = useState<HierarchyItem[]>([
    {
      id: '1',
      unit: 'North Unit',
      center: 'Tech Center',
      anaf: 'Development Branch',
      mador: 'Software Department',
      team: 'Frontend Team',
      name: 'North Unit > Tech Center > Development Branch > Software Department > Frontend Team'
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHierarchy, setEditingHierarchy] = useState<HierarchyItem | null>(null);
  const [formData, setFormData] = useState({
    unit: '',
    center: '',
    anaf: '',
    mador: '',
    team: ''
  });

  const { toast } = useToast();

  const handleCreate = () => {
    setEditingHierarchy(null);
    setFormData({
      unit: '',
      center: '',
      anaf: '',
      mador: '',
      team: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (hierarchy: HierarchyItem) => {
    setEditingHierarchy(hierarchy);
    setFormData({
      unit: hierarchy.unit,
      center: hierarchy.center,
      anaf: hierarchy.anaf,
      mador: hierarchy.mador,
      team: hierarchy.team
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const name = `${formData.unit} > ${formData.center} > ${formData.anaf} > ${formData.mador} > ${formData.team}`;
    
    if (editingHierarchy) {
      setHierarchies(prev => prev.map(h => 
        h.id === editingHierarchy.id 
          ? { ...h, ...formData, name }
          : h
      ));
      toast({ title: "Hierarchy updated successfully" });
    } else {
      const newHierarchy: HierarchyItem = {
        id: Date.now().toString(),
        ...formData,
        name
      };
      setHierarchies(prev => [...prev, newHierarchy]);
      toast({ title: "Hierarchy created successfully" });
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setHierarchies(prev => prev.filter(h => h.id !== id));
    toast({ title: "Hierarchy deleted successfully" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hierarchy Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hierarchy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHierarchy ? 'Edit Hierarchy' : 'Create New Hierarchy'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Enter unit name"
                />
              </div>
              <div>
                <Label htmlFor="center">Center</Label>
                <Input
                  id="center"
                  value={formData.center}
                  onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                  placeholder="Enter center name"
                />
              </div>
              <div>
                <Label htmlFor="anaf">Anaf</Label>
                <Input
                  id="anaf"
                  value={formData.anaf}
                  onChange={(e) => setFormData({ ...formData, anaf: e.target.value })}
                  placeholder="Enter anaf name"
                />
              </div>
              <div>
                <Label htmlFor="mador">Mador</Label>
                <Input
                  id="mador"
                  value={formData.mador}
                  onChange={(e) => setFormData({ ...formData, mador: e.target.value })}
                  placeholder="Enter mador name"
                />
              </div>
              <div>
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingHierarchy ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hierarchies.map((hierarchy) => (
            <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{hierarchy.name}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(hierarchy)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Hierarchy</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this hierarchy? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(hierarchy.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HierarchyManagement;
