import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Purchase } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, Download, Wifi, Calendar, MapPin, User, CreditCard } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface PurchaseReceiptModalProps {
  purchase: Purchase;
  onClose: () => void;
}

export const PurchaseReceiptModal: React.FC<PurchaseReceiptModalProps> = ({ purchase, onClose }) => {
  const { plans, locations } = useData();
  const { user } = useAuth();
  
  const plan = plans.find(p => p.id === purchase.planId);
  const location = locations.find(l => l.id === purchase.locationId);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    // Use A4 portrait, small margins, and compact scaling so content fits on one page
    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `ConetSmart-Receipt-${purchase.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] as const }
    };

    // Temporarily scale down the content for PDF rendering to fit a single page
    const el = element as HTMLElement;
    const prev = {
      transform: el.style.transform,
      transformOrigin: el.style.transformOrigin,
      width: el.style.width,
      margin: el.style.margin,
    };
    // Center on page and set content width to A4 content width, then scale
    el.style.width = '794px';
    el.style.margin = '0 auto';
    el.style.transform = 'scale(0.9)';
    el.style.transformOrigin = 'top center';

    try {
      await (html2pdf() as any).set(opt).from(element).save();
    } finally {
      // Restore original styles
      el.style.transform = prev.transform;
      el.style.transformOrigin = prev.transformOrigin;
      el.style.width = prev.width;
      el.style.margin = prev.margin;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]">
      <Card className="w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col print:w-[794px]">
        <div className="sticky top-0 bg-white p-3 sm:p-4 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Purchase Receipt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div id="receipt-content" className="p-4 sm:p-6 text-xs sm:text-sm leading-tight space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">ConetSmart</h1>
            <p className="text-gray-600 text-xs sm:text-base">Internet Service Receipt</p>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mt-3 sm:mt-4 mb-1 sm:mb-2">
              <span className="text-orange-600 text-xl sm:text-2xl">✓</span>
            </div>
            <p className="text-orange-600 font-semibold text-xs sm:text-base">Payment Successful</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wifi size={16} />
                Plan Details
              </h3>
               <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{plan?.name || 'Unknown Plan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {plan?.dataAmount || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{plan?.duration || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{plan?.type || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-900">
                <MapPin size={16} />
                Location & Access
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-orange-700">Location:</span>
                  <span className="font-medium text-orange-900">{location?.name || 'Unknown Location'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">WiFi Network:</span>
                  <span className="font-medium text-orange-900">{location?.wifiName || 'N/A'}</span>
                </div>
                {purchase.status === 'active' || purchase.status === 'used' || purchase.status === 'expired' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Username:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded text-orange-900">
                        {purchase.mikrotikCredentials.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Password:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded text-orange-900">
                        {purchase.mikrotikCredentials.password}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-100 p-2 rounded">
                    <p className="text-yellow-800 text-xs">
                      Credentials will be available once the plan is activated.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar size={16} />
                Transaction Details
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt ID:</span>
                  <span className="font-mono">{purchase.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Date:</span>
                  <span className="font-medium">
                    {new Date(purchase.purchaseDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium">
                    {new Date(purchase.expiryDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.status === 'active' 
                      ? 'bg-orange-100 text-orange-700' 
                      : purchase.status === 'expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-900">
                <CreditCard size={16} />
                Payment Summary
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-orange-700">Customer:</span>
                  <span className="font-medium text-orange-900">{user?.email}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-orange-700 font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg text-orange-900">₦{purchase.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> 
                {purchase.status === 'pending' 
                  ? ` Connect to WiFi network "${location?.wifiName}" and activate your plan from the home screen.`
                  : ` Make sure you're connected to the WiFi network "${location?.wifiName}" before using your credentials.`
                } Keep this receipt for your records.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-3 border-t flex gap-2 sm:gap-3 print:hidden flex-shrink-0">
          <Button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 text-xs sm:text-sm py-2 sm:py-3">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};