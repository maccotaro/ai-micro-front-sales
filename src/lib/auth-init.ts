import { initAuth } from '@maccotaro/ai-micro-lib-frontend/auth'

initAuth({
  cookiePrefix: 'sales',
  gatewayUrl: process.env.API_GATEWAY_URL || 'http://host.docker.internal:8888',
})
