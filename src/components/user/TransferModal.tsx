import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { X, User, Mail, Phone, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TransferSettings {
  transfer_enabled: boolean;
  transfer_min_amount: number;
  transfer_max_amount: number;
  transfer_charge_enabled: boolean;
  transfer_charge_type: 'percentage' | 'fixed';
  transfer_charge_value: number;
}

interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  walletBalance: number;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshSession } = useAuth();
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm'>('recipient');
  const [recipient, setRecipient] = useState('');
  const [recipientUser, setRecipientUser] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferSettings, setTransferSettings] = useState<TransferSettings | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTransferSettings();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep('recipient');
    setRecipient('');
    setRecipientUser(null);
    setAmount('');
    setNote('');
    setError('');
    setShowConfirm(false);
  };

  const loadTransferSettings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_transfer_settings');
      if (error) throw error;
      
      if (data && data.transfer_enabled === 'true') {
        setTransferSettings({
          transfer_enabled: data.transfer_enabled === 'true',
          transfer_min_amount: parseFloat(data.transfer_min_amount || '100'),
          transfer_max_amount: parseFloat(data.transfer_max_amount || '10000'),
          transfer_charge_enabled: data.transfer_charge_enabled === 'true',
          transfer_charge_type: data.transfer_charge_type || 'percentage',
          transfer_charge_value: parseFloat(data.transfer_charge_value || '1'),
        });
      } else {
        setError('Transfer feature is currently disabled');
      }
    } catch (error) {
      console.error('Error loading transfer settings:', error);
      setError('Failed to load transfer settings');
    }
  };

  const findRecipient = async () => {
    if (!recipient.trim()) {
      setError('Please enter an email or phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to find user by email or phone
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, phone, first_name, last_name, wallet_balance')
        .or(`email.eq.${recipient.trim()},phone.eq.${recipient.trim()}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('User not found. Please check the email or phone number');
        } else {
          throw error;
        }
        return;
      }

      if (data.id === user?.id) {
        setError('You cannot transfer to yourself');
        return;
      }

      setRecipientUser({
        id: data.id,
        email: data.email,
        phone: data.phone,
        firstName: data.first_name,
        lastName: data.last_name,
        walletBalance: data.wallet_balance || 0,
      });

      setStep('amount');
    } catch (error) {
      console.error('Error finding recipient:', error);
      setError('Failed to find user. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const calculateCharge = (transferAmount: number): number => {
    if (!transferSettings?.transfer_charge_enabled) return 0;
    
    if (transferSettings.transfer_charge_type === 'percentage') {
      return (transferAmount * transferSettings.transfer_charge_value) / 100;
    } else {
      return transferSettings.transfer_charge_value;
    }
  };

  const validateAmount = (): boolean => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (transferAmount < transferSettings!.transfer_min_amount) {
      setError(`Minimum transfer amount is ₦${transferSettings!.transfer_min_amount}`);
      return false;
    }

    if (transferAmount > transferSettings!.transfer_max_amount) {
      setError(`Maximum transfer amount is ₦${transferSettings!.transfer_max_amount}`);
      return false;
    }

    const charge = calculateCharge(transferAmount);
    const totalDeduction = transferAmount + charge;

    if (totalDeduction > (user?.walletBalance || 0)) {
      setError(`Insufficient balance. You need ₦${totalDeduction.toLocaleString()} (including ₦${charge.toLocaleString()} charge)`);
      return false;
    }

    return true;
  };

  const proceedToConfirm = () => {
    if (validateAmount()) {
      setStep('confirm');
    }
  };

  const executeTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const transferAmount = parseFloat(amount);
      const charge = calculateCharge(transferAmount);

      const { data, error } = await supabase.rpc('transfer_funds', {
        p_from_user_id: user?.id,
        p_to_user_id: recipientUser?.id,
        p_amount: transferAmount,
        p_charge: charge,
        p_reference: `TRF-${Date.now()}-${user?.id?.substring(0, 8)}`
      });

      if (error) throw error;

      if (data.success) {
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh session to get updated wallet balance
        await refreshSession();
        
        // Call the success callback to refresh data
        onSuccess();
        
        // Close the modal
        onClose();
        
        // Show success message
        alert(`Transfer successful! ₦${transferAmount.toLocaleString()} sent to ${recipientUser?.email}`);
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setError(error.message || 'Transfer failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!transferSettings?.transfer_enabled) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Unavailable</h3>
            <p className="text-gray-600 mb-4">The transfer feature is currently disabled by administrators.</p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Funds</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 text-xs font-bold">i</span>
            </div>
            <div>
            <p className="text-orange-800 text-sm font-medium">ConetSmart Wallet Transfer</p>
              <p className="text-orange-700 text-xs mt-1">
                This feature allows you to transfer funds between ConetSmart wallets only. 
                You can send money to other users using their email or phone number.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {step === 'recipient' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email or Phone
              </label>
              <Input
                value={recipient}
                onChange={setRecipient}
                placeholder="Enter email or phone number"
                type="text"
              />
            </div>
            <Button
              onClick={findRecipient}
              disabled={loading || !recipient.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Finding User...
                </>
              ) : (
                <>
                  <User size={16} className="mr-2" />
                  Find Recipient
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'amount' && recipientUser && (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {recipientUser.firstName && recipientUser.lastName 
                      ? `${recipientUser.firstName} ${recipientUser.lastName}`
                      : recipientUser.email
                    }
                  </p>
                  <p className="text-sm text-gray-600">{recipientUser.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount (₦)
              </label>
              <Input
                value={amount}
                onChange={setAmount}
                placeholder={`Min: ₦${transferSettings.transfer_min_amount}, Max: ₦${transferSettings.transfer_max_amount}`}
                type="number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <Input
                value={note}
                onChange={setNote}
                placeholder="Add a note for this transfer"
                type="text"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transfer Amount:</span>
                  <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
                </div>
                {transferSettings.transfer_charge_enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transfer Charge:</span>
                    <span className="font-medium">₦{calculateCharge(parseFloat(amount)).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Deduction:</span>
                  <span>₦{(parseFloat(amount) + calculateCharge(parseFloat(amount))).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('recipient')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={proceedToConfirm}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && recipientUser && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Confirm Transfer</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{recipientUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₦{parseFloat(amount).toLocaleString()}</span>
              </div>
              {transferSettings.transfer_charge_enabled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Charge:</span>
                  <span className="font-medium">₦{calculateCharge(parseFloat(amount)).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Deduction:</span>
                <span>₦{(parseFloat(amount) + calculateCharge(parseFloat(amount))).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('amount')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={executeTransfer}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} className="mr-2" />
                    Send Transfer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};