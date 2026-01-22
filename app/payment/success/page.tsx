'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里可以验证支付状态
    if (sessionId) {
      console.log('Payment successful! Session ID:', sessionId);
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            正在验证支付...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✓ 支付成功!</CardTitle>
          <CardDescription>您的支付已成功处理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            订单号: {sessionId}
          </p>
          <Button asChild className="w-full">
            <Link href="/">返回首页</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            加载中...
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
