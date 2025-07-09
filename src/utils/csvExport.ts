
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
    'Purchase Count',
    'Purchase Details',
    'Files Count'
  ];

  const csvRows = filteredPurposes.map(purpose => {
    const totalCost = purpose.purchases.reduce((sum, purchase) => 
      sum + purchase.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0
    );

    // Get currency from first cost entry, default to USD
    const currency = purpose.purchases[0]?.costs[0]?.currency || 'USD';

    // Create Purchase details string
    const purchaseDetails = purpose.purchases.map(purchase => {
      const purchaseCosts = purchase.costs.map(cost => `${cost.amount} ${cost.currency}`).join('; ');
      const stages = purchase.flow_stages.map(stage => `${stage.stage_type.name}: ${stage.value || 'Pending'}${stage.completion_date ? ` (${stage.completion_date})` : ''}`).join(', ');
      return `Purchase ${purchase.id}: Created ${purchase.creation_date}, Stages: ${stages}, Costs: ${purchaseCosts}`;
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
      purpose.purchases.length,
      purchaseDetails ? `"${purchaseDetails.replace(/"/g, '""')}"` : '',
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
