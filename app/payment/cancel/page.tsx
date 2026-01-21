'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="container max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">支付已取消</CardTitle>
          <CardDescription>您已取消支付流程</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            如有问题，请联系客服支持
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/payment">重试支付</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
