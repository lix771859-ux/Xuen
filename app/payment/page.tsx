'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CheckoutPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // 这里可以使用 clientSecret 集成 Stripe Elements
      console.log('Payment intent created:', data.clientSecret);
      alert('支付意图已创建！请查看控制台');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Stripe 支付示例</CardTitle>
          <CardDescription>输入金额创建支付意图</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">金额 (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button 
            onClick={handleCheckout} 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? '处理中...' : '创建支付'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
