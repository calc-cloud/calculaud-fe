
import { Purpose } from '@/types';

export const exportPurposesToCSV = (filteredPurposes: Purpose[], toast: any) => {
  const csvHeaders = [
    'ID',
    'Description',
    'Contents',
    'Supplier',
    'Hierarchy ID',
    'Hierarchy Name',
    'Status',
    'Expected Delivery',
    'Service Type',
    'Creation Time',
    'Last Modified',
    'Comments',
    'Total Cost',
    'Currency',
    'EMF Count',
    'EMF Details',
    'Files Count'
  ];

  const csvRows = filteredPurposes.map(purpose => {
    const totalCost = purpose.emfs.reduce((sum, emf) => 
      sum + emf.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
    );

    // Get currency from first cost entry, default to USD
    const currency = purpose.emfs[0]?.costs[0]?.currency || 'USD';

    // Create EMF details string
    const emfDetails = purpose.emfs.map(emf => {
      const emfCosts = emf.costs.map(cost => `${cost.amount} ${cost.currency}`).join('; ');
      return `EMF ${emf.id}: Created ${emf.creation_date}${emf.demand_id ? `, Demand ${emf.demand_id} (${emf.demand_creation_date})` : ''}${emf.order_id ? `, Order ${emf.order_id} (${emf.order_creation_date})` : ''}${emf.bikushit_id ? `, Bikushit ${emf.bikushit_id} (${emf.bikushit_creation_date})` : ''}, Costs: ${emfCosts}`;
    }).join(' | ');

    // Format contents array as string for CSV
    const contentsString = purpose.contents.map(content => 
      `${content.quantity} × ${content.service_name || `Service ${content.service_id}`}`
    ).join('; ');

    return [
      purpose.id,
      `"${purpose.description.replace(/"/g, '""')}"`,
      `"${contentsString.replace(/"/g, '""')}"`,
      `"${purpose.supplier.replace(/"/g, '""')}"`,
      purpose.hierarchy_id,
      `"${purpose.hierarchy_name.replace(/"/g, '""')}"`,
      purpose.status,
      purpose.expected_delivery,
      purpose.service_type,
      purpose.creation_time,
      purpose.last_modified,
      purpose.comments ? `"${purpose.comments.replace(/"/g, '""')}"` : '',
      totalCost,
      currency,
      purpose.emfs.length,
      emfDetails ? `"${emfDetails.replace(/"/g, '""')}"` : '',
      purpose.files.length
    ];
  });

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `purposes_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({
    title: "Export completed",
    description: `Successfully exported ${filteredPurposes.length} purposes with full details to CSV.`,
  });
};
