
import { Purpose } from '@/types';

export const mockPurposes: Purpose[] = [
  {
    id: '1',
    description: 'Software Development Services',
    content: 'Development of procurement management system with React and TypeScript',
    supplier: 'TechCorp Solutions',
    hierarchy_id: 'H001',
    hierarchy_name: 'IT Department',
    status: 'IN_PROGRESS',
    expected_delivery: '2024-07-15',
    comments: 'Project is progressing well, on schedule',
    service_type: 'Software',
    creation_time: '2024-06-01T10:00:00Z',
    last_modified: '2024-06-15T14:30:00Z',
    emfs: [
      {
        id: 'emf-1',
        purpose_id: '1',
        creation_date: '2024-06-02',
        demand_id: 'D001',
        demand_creation_date: '2024-06-03',
        order_id: 'O001',
        order_creation_date: '2024-06-05',
        costs: [
          {
            id: 'cost-1',
            emf_id: 'emf-1',
            amount: 25000,
            currency: 'SUPPORT_USD'
          }
        ]
      }
    ],
    files: []
  },
  {
    id: '2',
    description: 'Hardware Procurement',
    content: 'Purchase of new servers and networking equipment for data center upgrade',
    supplier: 'Hardware Plus Inc',
    hierarchy_id: 'H002',
    hierarchy_name: 'Infrastructure',
    status: 'PENDING',
    expected_delivery: '2024-08-01',
    service_type: 'Hardware',
    creation_time: '2024-06-10T09:15:00Z',
    last_modified: '2024-06-10T09:15:00Z',
    emfs: [],
    files: []
  },
  {
    id: '3',
    description: 'Consulting Services',
    content: 'Business process optimization and digital transformation consulting',
    supplier: 'Strategic Advisors LLC',
    hierarchy_id: 'H003',
    hierarchy_name: 'Operations',
    status: 'COMPLETED',
    expected_delivery: '2024-05-30',
    service_type: 'Consulting',
    creation_time: '2024-04-15T11:00:00Z',
    last_modified: '2024-05-30T16:45:00Z',
    emfs: [
      {
        id: 'emf-3',
        purpose_id: '3',
        creation_date: '2024-04-16',
        costs: [
          {
            id: 'cost-3',
            emf_id: 'emf-3',
            amount: 15000,
            currency: 'SUPPORT_USD'
          }
        ]
      }
    ],
    files: []
  }
];
