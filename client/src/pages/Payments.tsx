import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Shield, University, Clock, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { initializeFlutterwave } from "@/lib/payment";
import type { VirtualAccount, Payment } from "@shared/schema";
import FloatingNav from "@/components/FloatingNav";
import NeonCard from "@/components/ui/neon-card";

export default function Payments() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [kycData, setKycData] = useState({
    nin: '',
    bvn: '',
    phoneNumber: ''
  });

  const { data: virtualAccount, isLoading: accountLoading } = useQuery({
    queryKey: ['/api/virtual-account'],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  const fundWalletMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await initializeFlutterwave({
        amount,
        email: user?.email || '',
        name: `${user?.firstName} ${user?.lastName}`,
        phone: '08012345678', // Should come from user profile
        tx_ref: `wallet_fund_${Date.now()}`,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Funding initiated",
        description: "Complete the payment to fund your wallet",
      });
      setIsFundModalOpen(false);
      setFundAmount('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate funding",
        variant: "destructive",
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; bankCode: string; accountNumber: string }) => {
      return apiRequest('POST', '/api/payments/withdraw', data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal initiated",
        description: "Your withdrawal request is being processed",
      });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-account'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    }
  });

  const kycMutation = useMutation({
    mutationFn: async (data: typeof kycData) => {
      return apiRequest('POST', '/api/kyc/verify', data);
    },
    onSuccess: () => {
      toast({
        title: "KYC submitted",
        description: "Your verification documents are being reviewed",
      });
      setIsKycModalOpen(false);
      setKycData({ nin: '', bvn: '', phoneNumber: '' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit KYC verification",
        variant: "destructive",
      });
    }
  });

  const handleFundWallet = () => {
    const amount = parseFloat(fundAmount);
    if (amount < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum funding amount is ₦100",
        variant: "destructive",
      });
      return;
    }
    fundWalletMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    const currentBalance = parseFloat(virtualAccount?.balance || '0');
    
    if (amount < 500) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is ₦500",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > currentBalance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, using dummy bank details
    withdrawMutation.mutate({
      amount,
      bankCode: '044',
      accountNumber: '0123456789'
    });
  };

  const handleKycSubmit = () => {
    if (!kycData.nin || !kycData.bvn || !kycData.phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    kycMutation.mutate(kycData);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionIcon = (type: 'credit' | 'debit', status: string) => {
    if (status === 'pending') return Clock;
    return type === 'credit' ? ArrowDown : ArrowUp;
  };

  const getTransactionColor = (type: 'credit' | 'debit', status: string) => {
    if (status === 'pending') return 'text-cyber-amber';
    return type === 'credit' ? 'text-cyber-green' : 'text-neon-pink';
  };

  return (
    <div className="min-h-screen bg-dark-purple">
      {/* Header */}
      <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-white">Payments</h1>
          </div>
          <Dialog open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 bg-gradient-to-r from-cyber-green to-neon-cyan text-white rounded-lg font-medium">
                <Shield className="h-4 w-4 mr-2" />
                KYC Verify
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-deep-navy border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-cyber-green" />
                  KYC Verification
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nin">National Identification Number (NIN)</Label>
                  <Input
                    id="nin"
                    value={kycData.nin}
                    onChange={(e) => setKycData({...kycData, nin: e.target.value})}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Enter your 11-digit NIN"
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
                  <Input
                    id="bvn"
                    value={kycData.bvn}
                    onChange={(e) => setKycData({...kycData, bvn: e.target.value})}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Enter your 11-digit BVN"
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={kycData.phoneNumber}
                    onChange={(e) => setKycData({...kycData, phoneNumber: e.target.value})}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                <Button 
                  onClick={handleKycSubmit} 
                  disabled={kycMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyber-green to-neon-cyan"
                >
                  {kycMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Virtual Account Card */}
        <NeonCard className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <University className="h-5 w-5 text-neon-pink mr-2" />
              Virtual Account
            </h3>
            {accountLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-28"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-36"></div>
                  <div className="h-4 bg-gray-700 rounded w-40"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            ) : virtualAccount ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Number</span>
                  <span className="text-white font-mono text-sm">{virtualAccount.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bank Name</span>
                  <span className="text-white">{virtualAccount.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Name</span>
                  <span className="text-white text-sm">{virtualAccount.accountName}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <span className="text-gray-400">Balance</span>
                  <span className="text-neon-cyan font-bold text-xl">
                    {formatCurrency(virtualAccount.balance)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-400 mb-4">
                  <University className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-400">Virtual account will be created automatically</p>
              </div>
            )}
          </CardContent>
        </NeonCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Dialog open={isFundModalOpen} onOpenChange={setIsFundModalOpen}>
            <DialogTrigger asChild>
              <NeonCard className="p-4 text-center cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl text-cyber-green mb-2">
                  <Plus className="h-8 w-8 mx-auto" />
                </div>
                <span className="text-white font-medium">Fund Wallet</span>
              </NeonCard>
            </DialogTrigger>
            <DialogContent className="bg-deep-navy border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-cyber-green" />
                  Fund Wallet
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Enter amount (min ₦100)"
                    min="100"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p>• Minimum funding amount: ₦100</p>
                  <p>• Powered by Flutterwave</p>
                  <p>• Instant credit to your wallet</p>
                </div>
                <Button 
                  onClick={handleFundWallet} 
                  disabled={fundWalletMutation.isPending || !fundAmount}
                  className="w-full bg-gradient-to-r from-cyber-green to-neon-cyan"
                >
                  {fundWalletMutation.isPending ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
            <DialogTrigger asChild>
              <NeonCard className="p-4 text-center cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl text-neon-pink mb-2">
                  <Minus className="h-8 w-8 mx-auto" />
                </div>
                <span className="text-white font-medium">Withdraw</span>
              </NeonCard>
            </DialogTrigger>
            <DialogContent className="bg-deep-navy border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Minus className="h-5 w-5 mr-2 text-neon-pink" />
                  Withdraw Funds
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdrawAmount">Amount (₦)</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Enter amount (min ₦500)"
                    min="500"
                    max={virtualAccount ? parseFloat(virtualAccount.balance) : 0}
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p>• Minimum withdrawal: ₦500</p>
                  <p>• Available balance: {virtualAccount ? formatCurrency(virtualAccount.balance) : '₦0.00'}</p>
                  <p>• Processing time: 1-3 business days</p>
                </div>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={withdrawMutation.isPending || !withdrawAmount}
                  className="w-full bg-gradient-to-r from-neon-pink to-electric-purple"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KYC Status */}
        <NeonCard className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyber-green rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">KYC Verification</h4>
                  <p className="text-gray-400 text-sm">Identity verified with NIN & BVN</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-cyber-green/20 text-cyber-green text-xs rounded-full">
                Verified
              </span>
            </div>
          </CardContent>
        </NeonCard>

        {/* Transaction History */}
        <NeonCard>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 text-cyber-amber mr-2" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-midnight-blue rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-40"></div>
                        <div className="h-3 bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-400 mb-4">
                  <DollarSign className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
                <p className="text-gray-400">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment: Payment) => {
                  const isCredit = payment.receiverId === user?.id;
                  const type = isCredit ? 'credit' : 'debit';
                  const Icon = getTransactionIcon(type, payment.status);
                  const colorClass = getTransactionColor(type, payment.status);
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-midnight-blue rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${payment.status === 'completed' ? (isCredit ? 'bg-cyber-green' : 'bg-neon-pink') : 'bg-cyber-amber'} rounded-full flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {payment.description || (isCredit ? 'Payment received' : 'Payment sent')}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatDate(payment.createdAt!)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${colorClass}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(payment.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'completed' ? 'text-cyber-green bg-cyber-green/20' :
                          payment.status === 'pending' ? 'text-cyber-amber bg-cyber-amber/20' :
                          'text-cyber-red bg-cyber-red/20'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                <Button 
                  variant="ghost"
                  className="w-full mt-4 text-neon-cyan hover:text-white transition-colors"
                >
                  View All Transactions
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            )}
          </CardContent>
        </NeonCard>
      </main>

      <FloatingNav />
    </div>
  );
}
