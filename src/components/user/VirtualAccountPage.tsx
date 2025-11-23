import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createVirtualAccount, getUserVirtualAccount } from '../../utils/flutterwave';
import { ArrowLeft, CreditCard, Copy, CheckCircle, AlertCircle, Info, Wallet, Building, Clock, Shield } from 'lucide-react';

interface VirtualAccountPageProps {
  onBack: () => void;
}

export const VirtualAccountPage: React.FC<VirtualAccountPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'account' | 'loading'>('loading');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bvn: ''
  });
  const [virtualAccount, setVirtualAccount] = useState<{
    id: string;
    accountNumber: string;
    bankName: string;
    reference: string;
    amount: number;
    status: string;
    currency: string;
    createdDate: string;
    expiryDate?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stuck, setStuck] = useState(false);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then((val) => { clearTimeout(t); resolve(val); })
        .catch((err) => { clearTimeout(t); reject(err); });
    });
  };

  useEffect(() => {
    if (user) {
      checkExistingAccount();
    }
  }, [user]);

  // Watchdog: if stuck on loading for >8s, fall back to form with a notice
  useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(() => {
      setStuck(true);
      setStep('form');
    }, 8000);
    return () => clearTimeout(t);
  }, [step]);

  const checkExistingAccount = async () => {
    if (!user) return;
    
    setStep('loading');
    let existingAccount: any = null;
    try {
      existingAccount = await withTimeout(getUserVirtualAccount(user.id), 6000);
    } catch (e) {
      existingAccount = null;
    }
    
    if (existingAccount) {
      setVirtualAccount({
        id: existingAccount.reference || '',
        accountNumber: existingAccount.accountNumber,
        bankName: existingAccount.bankName,
        reference: existingAccount.reference || '',
        amount: 0,
        status: 'active',
        currency: 'NGN',
        createdDate: new Date().toISOString()
      });
      setStep('account');
    } else {
      // Pre-fill form with user email info
      const emailParts = user.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        setFormData(prev => ({
          ...prev,
          firstName: emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1),
          lastName: emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1)
        }));
      }
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.bvn) {
      setError('Please fill in all required fields including BVN');
      return;
    }

    // Validate BVN length
    if (formData.bvn.length !== 11) {
      setError('BVN must be exactly 11 digits');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await createVirtualAccount({
        userId: user.id,
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        bvn: formData.bvn
      });

      if (response.status === 'success' && response.data) {
        setVirtualAccount({
          id: response.data.id,
          accountNumber: response.data.account_number,
          bankName: response.data.account_bank_name,
          reference: response.data.reference,
          amount: response.data.amount,
          status: response.data.status,
          currency: response.data.currency,
          createdDate: response.data.created_datetime,
          expiryDate: response.data.account_expiration_datetime
        });
        setStep('account');

        // Refresh from DB to ensure persistence is reflected
        const persisted = await getUserVirtualAccount(user.id);
        if (persisted) {
          setVirtualAccount({
            id: persisted.reference || '',
            accountNumber: persisted.accountNumber,
            bankName: persisted.bankName,
            reference: persisted.reference || '',
            amount: 0,
            status: 'active',
            currency: 'NGN',
            createdDate: new Date().toISOString()
          });
        }
      } else {
        setError(response.message || 'Failed to create virtual account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyAccountNumber = async () => {
    if (virtualAccount) {
      await navigator.clipboard.writeText(virtualAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fund Your Wallet</h1>
              <p className="text-sm text-gray-600">Create virtual account for instant funding</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {step === 'loading' && (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
              <p className="text-gray-600">Checking your account details</p>
            </div>
          </Card>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            {stuck && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 text-sm">
                We couldn't fetch your existing virtual account right now. You can continue and create one below.
              </div>
            )}
            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Get Your Virtual Account</h3>
                  <p className="text-orange-100 text-sm leading-relaxed">
                    We'll create a dedicated bank account number just for you. Transfer any amount to this account and your wallet will be funded instantly.
                  </p>
                </div>
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Instant</p>
                    <p className="text-xs text-gray-600">5-10 mins</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Secure</p>
                    <p className="text-xs text-gray-600">Bank Grade</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => setFormData({ ...formData, firstName: value })}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => setFormData({ ...formData, lastName: value })}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                  placeholder="08012345678"
                  type="tel"
                />

                <Input
                  label="BVN (Required by CBN)"
                  value={formData.bvn}
                  onChange={(value) => setFormData({ ...formData, bvn: value.replace(/\D/g, '') })}
                  placeholder="12345678901"
                  maxLength={11}
                  required
                />

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Info className="text-orange-600 mt-0.5" size={16} />
                    <div className="text-sm">
                      <p className="text-orange-800 font-medium mb-1">Why BVN is Required</p>
                      <p className="text-orange-700">
                        BVN (Bank Verification Number) is required by the Central Bank of Nigeria (CBN) for all virtual account creation. This ensures secure and compliant financial transactions.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle size={16} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Virtual Account'
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {step === 'account' && virtualAccount && (
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="p-6 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Account Created Successfully! 🎉</h3>
              <p className="text-orange-100">
                Your virtual account is ready. Transfer money to fund your wallet instantly.
              </p>
            </Card>

            {/* Account Details */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building size={24} className="text-orange-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Virtual Account Details</h4>
                  <p className="text-gray-600 text-sm">Use these details to fund your wallet</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 font-medium mb-1">Bank Name</p>
                    <p className="text-lg font-bold text-gray-900">{virtualAccount.bankName}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 font-medium mb-2">Account Number</p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                        {virtualAccount.accountNumber}
                      </p>
                      <button
                        onClick={copyAccountNumber}
                        className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                        <span className="text-sm font-medium">
                          {copied ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                   <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 font-medium mb-1">Account Name</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(virtualAccount?.id && user?.firstName && user?.lastName)
                        ? `${user.firstName} ${user.lastName}`
                        : `${formData.firstName} ${formData.lastName}`} - ConetSmart
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Currency</p>
                      <p className="text-sm font-bold text-gray-900">{virtualAccount.currency}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Status</p>
                      <p className="text-sm font-bold text-orange-600 capitalize">{virtualAccount.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-2">How to Fund Your Wallet</h4>
                  <ul className="text-yellow-700 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">1.</span>
                      <span>Open your banking app or visit any bank</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">2.</span>
                      <span>Transfer any amount to the account number above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">3.</span>
                      <span>Your wallet will be credited within 5-10 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">4.</span>
                      <span>You can transfer any amount (no minimum required)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={onBack} className="w-full h-12 text-base font-semibold">
                <Wallet size={20} className="mr-2" />
                Back to Wallet
              </Button>
              
              <Button 
                variant="outline" 
                onClick={copyAccountNumber}
                className="w-full h-12 text-base font-semibold"
              >
                <Copy size={20} className="mr-2" />
                {copied ? 'Account Number Copied!' : 'Copy Account Number'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};