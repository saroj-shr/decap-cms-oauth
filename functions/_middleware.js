export async function onRequest({ request, env, next }) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
  
    // Debug logging
    console.log('Request path:', url.pathname);
    console.log('Search params:', Object.fromEntries(searchParams));
  
    // Configuration
    const config = {
      github_client_id: env.GITHUB_CLIENT_ID,
      github_client_secret: env.GITHUB_CLIENT_SECRET,
      oauth_host: "https://github.com",
      oauth_token_path: "/login/oauth/access_token",
      oauth_authorize_path: "/login/oauth/authorize",
    };
  
    // Handle the callback from GitHub
    if (url.pathname === "/admin/callback") {
      console.log("Handling callback...");
      const code = searchParams.get("code");
      
      if (!code) {
        return new Response("No code provided", { status: 400 });
      }
  
      try {
        // Exchange the code for an access token
        const tokenResponse = await fetch(`${config.oauth_host}${config.oauth_token_path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            client_id: config.github_client_id,
            client_secret: config.github_client_secret,
            code: code,
          }),
        });
  
        if (!tokenResponse.ok) {
          throw new Error(`GitHub responded with ${tokenResponse.status}`);
        }
  
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
          throw new Error("No access token received from GitHub");
        }
  
        // Important: Redirect to your main site's admin page, not the OAuth handler
        const mainSiteUrl = "https://shuttespace.pages.dev";
        const redirectUrl = new URL("/admin/", mainSiteUrl);
        redirectUrl.hash = `access_token=${tokenData.access_token}`;
  
        console.log("Redirecting to:", redirectUrl.toString());
        return Response.redirect(redirectUrl.toString());
      } catch (error) {
        console.error("OAuth error:", error);
        return new Response(`Authentication error: ${error.message}`, { 
          status: 500,
          headers: {
            "Content-Type": "text/plain"
          }
        });
      }
    }
  
    // For non-callback requests, continue normally
    return next();
  }