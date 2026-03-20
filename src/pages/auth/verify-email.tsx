import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;

  if (!token || typeof token !== "string") {
    return { redirect: { destination: "/login?error=invalid_token", permanent: false } };
  }

  try {
    const authUrl = process.env.AUTH_SERVER_URL || "http://host.docker.internal:8002";
    const res = await fetch(
      `${authUrl}/auth/verify-email?token=${encodeURIComponent(token)}`,
      { redirect: "manual" }
    );

    if (res.status === 302 || res.status === 301 || res.ok) {
      return { redirect: { destination: "/login?verified=true", permanent: false } };
    }

    const data = await res.json().catch(() => ({}));
    return { redirect: { destination: `/login?error=${encodeURIComponent(data.detail || "verification_failed")}`, permanent: false } };
  } catch {
    return { redirect: { destination: "/login?error=verification_failed", permanent: false } };
  }
};

export default function VerifyEmailPage() { return null; }
