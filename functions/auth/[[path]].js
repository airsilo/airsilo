export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/auth', '') || '/';

  if (path === '/' || path === '') {
    const clientId = env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response('GITHUB_CLIENT_ID is not set', { status: 500 });
    }
    const redirectUri = `${url.origin}/auth/callback`;
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'repo,user');
    return Response.redirect(authUrl.toString(), 302);
  }

  if (path === '/callback') {
    const code = url.searchParams.get('code');
    if (!code) return new Response('Missing code', { status: 400 });

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    const html = `<!doctype html><html><body><script>
      (function(){
        function recv(e){
          window.opener.postMessage('authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' }).replace(/"/g,'&quot;')}', e.origin);
          window.removeEventListener('message', recv, false);
        }
        window.addEventListener('message', recv, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script></body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }

  return new Response('Not found', { status: 404 });
}
