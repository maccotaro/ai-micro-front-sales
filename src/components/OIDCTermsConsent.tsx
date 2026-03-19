import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OIDCTermsConsentProps {
  onAgree: () => Promise<void>;
  onDecline?: () => void;
  loading?: boolean;
}

export function OIDCTermsConsent({ onAgree, onDecline, loading = false }: OIDCTermsConsentProps) {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAgree = async () => {
    if (!termsAgreed) {
      setError('利用規約に同意してください');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onAgree();
    } catch (err: any) {
      setError(err.message || '処理に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            利用規約への同意
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            サービスをご利用いただくには、利用規約への同意が必要です
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
            <p className="text-sm text-muted-foreground">
              AI Micro Service をご利用いただくにあたり、以下の規約をご確認ください。
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
                  利用規約
                </Link>
                {' '}- サービスの利用条件について
              </li>
              <li>
                <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                  プライバシーポリシー
                </Link>
                {' '}- 個人情報の取り扱いについて
              </li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="oidc-terms"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="oidc-terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
              <Link href="/terms" className="text-primary hover:underline" target="_blank">利用規約</Link>
              {' '}および{' '}
              <Link href="/privacy" className="text-primary hover:underline" target="_blank">プライバシーポリシー</Link>
              {' '}に同意します
            </label>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleAgree}
              disabled={!termsAgreed || isLoading}
            >
              {isLoading ? '処理中...' : '同意して続行'}
            </Button>
            {onDecline && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={onDecline}
                disabled={isLoading}
              >
                キャンセル
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
