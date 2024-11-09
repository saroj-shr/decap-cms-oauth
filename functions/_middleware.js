export async function onRequest({ request, env, next }) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    
    // Debug logging
    console.log('Request path:', url.pathname);
    console.log('Search params:', Object.fromEntries(searchParams));
  
    const config = {
      github_client_id: env.GITHUB_CLIENT_ID,
      github_client_secret: env.GITHUB_CLIENT_SECRET,
      oauth_host: "https://github.com",
      oauth_token_path: "/login/oauth/access_token",
      oauth_authorize_path: "/login/oauth/authorize",
      redirect_uri: "https://decap-cms-oauth.pages.dev/admin/callback",
      main_site_url: "https://shuttespace.pages.dev"
    };
  
    // Handle the initial authorization request
    if (url.pathname === "/admin/callback" && !searchParams.get("code")) {
      console.log("Starting authorization...");
      
      // Construct GitHub OAuth authorization URL
      const authorizationUrl = new URL(config.oauth_host + config.oauth_authorize_path);
      authorizationUrl.searchParams.set("client_id", config.github_client_id);
      authorizationUrl.searchParams.set("redirect_uri", config.redirect_uri);
      authorizationUrl.searchParams.set("scope", "repo user");
      authorizationUrl.searchParams.set("state", crypto.randomUUID());
  
      console.log("Redirecting to GitHub:", authorizationUrl.toString());
      return Response.redirect(authorizationUrl.toString());
    }
  
    // Handle the callback from GitHub
    if (url.pathname === "/admin/callback" && searchParams.get("code")) {
      console.log("Handling callback with code...");
      const code = searchParams.get("code");
  
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
            redirect_uri: config.redirect_uri
          }),
        });
  
        if (!tokenResponse.ok) {
          throw new Error(`GitHub responded with ${tokenResponse.status}`);
        }
  
        const tokenData = await tokenResponse.json();
        console.log("Token received:", !!tokenData.access_token);
  
        if (!tokenData.access_token) {
          throw new Error("No access token received from GitHub");
        }
  
        // Redirect back to the main site's admin page
        const redirectUrl = new URL("/admin/", config.main_site_url);
        redirectUrl.hash = `access_token=${tokenData.access_token}`;
  
        console.log("Redirecting to main site:", redirectUrl.toString());
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
  
    // For all other requests
    return next();
  }