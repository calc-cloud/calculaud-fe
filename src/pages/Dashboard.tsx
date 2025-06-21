
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { PurposeTable } from '@/components/tables/PurposeTable';
import { PurposeModal } from '@/components/modals/PurposeModal';
import { FilterBar } from '@/components/common/FilterBar';
import { Purpose, PurposeFilters, ModalMode } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Mock data for demonstration
const mockPurposes: Purpose[] = [
  {
    id: '1',
    description: 'פיתוח מערכת רכש',
    content: 'פיתוח מערכת ניהול רכש מקיפה עם React ו-TypeScript',
    supplier: 'TechCorp Solutions',
    hierarchy_id: 'H001',
    hierarchy_name: 'מחלקת IT',
    status: 'In Progress',
    expected_delivery: '2024-07-15',
    comments: 'הפרויקט מתקדם כמתוכנן',
    service_type: 'Software',
    creation_time: '2024-06-01T10:00:00Z',
    last_modified: '2024-06-15T14:30:00Z',
    currency: 'USD',
    emfs: [
      {
        id: 'emf-1',
        purpose_id: '1',
        creation_date: '2024-06-02',
        demand_id: 'D001',
        demand_date: '2024-06-03',
        order_id: 'O001',
        order_date: '2024-06-05',
        is_completed: false,
        costs: [
          {
            id: 'cost-1',
            emf_id: 'emf-1',
            amount: 25000,
            currency: 'USD',
            description: 'שלב פיתוח ראשון'
          }
        ]
      }
    ],
    files: []
  },
  {
    id: '2',
    description: 'רכש ציוד חומרה',
    content: 'רכישת שרתים וציוד רשת עבור שדרוג מרכז הנתונים',
    supplier: 'Hardware Plus Inc',
    hierarchy_id: 'H002',
    hierarchy_name: 'תשתיות',
    status: 'Pending',
    expected_delivery: '2024-08-01',
    service_type: 'Hardware',
    creation_time: '2024-06-10T09:15:00Z',
    last_modified: '2024-06-10T09:15:00Z',
    currency: 'USD',
    emfs: [],
    files: []
  },
  {
    id: '3',
    description: 'שירותי ייעוץ',
    content: 'ייעוץ לשיפור תהליכים עסקיים וטרנספורמציה דיגיטלית',
    supplier: 'Strategic Advisors LLC',
    hierarchy_id: 'H003',
    hierarchy_name: 'תפעול',
    status: 'Completed',
    expected_delivery: '2024-05-30',
    service_type: 'Consulting',
    creation_time: '2024-04-15T11:00:00Z',
    last_modified: '2024-05-30T16:45:00Z',
    currency: 'USD',
    emfs: [
      {
        id: 'emf-3',
        purpose_id: '3',
        creation_date: '2024-04-16',
        is_completed: true,
        costs: [
          {
            id: 'cost-3',
            emf_id: 'emf-3',
            amount: 15000,
            currency: 'USD',
            description: 'דמי ייעוץ'
          }
        ]
      }
    ],
    files: []
  }
];

const Dashboard: React.FC = () => {
  const [purposes, setPurposes] = useState<Purpose[]>(mockPurposes);
  const [filteredPurposes, setFilteredPurposes] = useState<Purpose[]>(mockPurposes);
  const [filters, setFilters] = useState<PurposeFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | undefined>();
  const { toast } = useToast();

  // Filter purposes based on current filters
  React.useEffect(() => {
    let filtered = purposes;

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(purpose => 
        purpose.description.toLowerCase().includes(query) ||
        purpose.content.toLowerCase().includes(query) ||
        purpose.supplier.toLowerCase().includes(query) ||
        purpose.emfs.some(emf => emf.id.toLowerCase().includes(query))
      );
    }

    if (filters.service_type) {
      filtered = filtered.filter(purpose => purpose.service_type === filters.service_type);
    }

    if (filters.status) {
      filtered = filtered.filter(purpose => purpose.status === filters.status);
    }

    if (filters.hierarchy_id) {
      filtered = filtered.filter(purpose => 
        purpose.hierarchy_id.toLowerCase().includes(filters.hierarchy_id!.toLowerCase())
      );
    }

    if (filters.supplier) {
      filtered = filtered.filter(purpose => 
        purpose.supplier.toLowerCase().includes(filters.supplier!.toLowerCase())
      );
    }

    if (filters.emf_id) {
      filtered = filtered.filter(purpose => 
        purpose.emfs.some(emf => emf.id.toLowerCase().includes(filters.emf_id!.toLowerCase()))
      );
    }

    setFilteredPurposes(filtered);
  }, [filters, purposes]);

  // Calculate dashboard statistics
  const stats = React.useMemo(() => {
    const total = purposes.length;
    const pending = purposes.filter(p => p.status === 'Pending').length;
    const inProgress = purposes.filter(p => p.status === 'In Progress').length;
    const completed = purposes.filter(p => p.status === 'Completed').length;
    const totalCost = purposes.reduce((sum, purpose) => {
      const purposeCost = purpose.emfs.reduce((emfSum, emf) => 
        emfSum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
      );
      return sum + purposeCost;
    }, 0);

    return { total, pending, inProgress, completed, totalCost };
  }, [purposes]);

  const handleCreatePurpose = () => {
    setSelectedPurpose(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPurpose = (purpose: Purpose) => {
    setSelectedPurpose(purpose);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeletePurpose = (purposeId: string) => {
    setPurposes(prev => prev.filter(p => p.id !== purposeId));
    toast({
      title: "תכלית נמחקה",
      description: "התכלית נמחקה בהצלחה.",
    });
  };

  const handleSavePurpose = (purposeData: Partial<Purpose>) => {
    if (modalMode === 'create') {
      const newPurpose: Purpose = {
        ...purposeData,
        id: `new-${Date.now()}`,
        creation_time: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        emfs: purposeData.emfs || [],
        files: purposeData.files || []
      } as Purpose;
      
      setPurposes(prev => [newPurpose, ...prev]);
      toast({
        title: "תכלית נוצרה",
        description: "תכלית חדשה נוצרה בהצלחה.",
      });
    } else if (modalMode === 'edit' && selectedPurpose) {
      setPurposes(prev => prev.map(p => 
        p.id === selectedPurpose.id 
          ? { ...p, ...purposeData, last_modified: new Date().toISOString() }
          : p
      ));
      toast({
        title: "תכלית עודכנה",
        description: "התכלית עודכנה בהצלחה.",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "יצוא התחיל",
      description: "הנתונים שלך יהיו מוכנים בקרוב.",
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">לוח בקרת רכש</h2>
          <p className="text-gray-600 mt-1">ניהול תכליות רכש ומעקב אחר התקדמות</p>
        </div>
        <Button onClick={handleCreatePurpose} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          צור תכלית
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה״כ תכליות</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתין</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">בתהליך</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הושלם</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ערך כולל</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            מציג {filteredPurposes.length} מתוך {purposes.length} תכליות
          </p>
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary">
              {Object.keys(filters).filter(key => filters[key as keyof PurposeFilters]).length} מסננים פעילים
            </Badge>
          )}
        </div>
      </div>

      {/* Purposes Table */}
      <PurposeTable
        purposes={filteredPurposes}
        onView={handleViewPurpose}
        onEdit={handleEditPurpose}
        onDelete={handleDeletePurpose}
        isLoading={false}
      />

      {/* Purpose Modal */}
      <PurposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        purpose={selectedPurpose}
        onSave={handleSavePurpose}
      />
    </div>
  );
};

export default Dashboard;
