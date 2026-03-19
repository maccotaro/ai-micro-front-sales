import React from 'react';
import { useRouter } from 'next/router';
import { OIDCTermsConsent } from '@/components/OIDCTermsConsent';

/**
 * Terms agreement page for OIDC first-login users.
 * Displayed when the user has logged in via OIDC but has not yet
 * agreed to the terms of service.
 */
export default function TermsAgreementPage() {
  const router = useRouter();

  const handleAgree = async () => {
    const response = await fetch('/api/auth/agree-terms', {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.detail || '利用規約の同意処理に失敗しました');
    }
    router.push('/dashboard');
  };

  const handleDecline = () => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      router.push('/login');
    });
  };

  return (
    <OIDCTermsConsent
      onAgree={handleAgree}
      onDecline={handleDecline}
    />
  );
}
