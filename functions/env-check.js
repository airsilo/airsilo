export async function onRequest(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    hasClientId: !!env.GITHUB_CLIENT_ID,
    hasClientSecret: !!env.GITHUB_CLIENT_SECRET,
    clientIdPrefix: env.GITHUB_CLIENT_ID ? env.GITHUB_CLIENT_ID.slice(0, 4) + '...' : 'MISSING',
    envKeys: Object.keys(env).filter(k => k.includes('GITHUB') || k.includes('CLIENT'))
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
