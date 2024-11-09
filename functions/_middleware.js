const config = {
    github_client_id: `${env.GITHUB_CLIENT_ID}`,
    github_client_secret: `${env.GITHUB_CLIENT_SECRET}`,
    oauth_host: "https://github.com",
    oauth_token_path: "/login/oauth/access_token",
    oauth_authorize_path: "/login/oauth/authorize",
};

export async function onRequest({ request, env, next }) {
    const url = new URL(request.url);

    // Handle callback from GitHub
    if (url.pathname === "/admin/callback") {
        const code = url.searchParams.get("code");
        const response = await fetch(`${config.oauth_host}${config.oauth_token_path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: config.github_client_id,
                client_secret: config.github_client_secret,
                code,
            }),
        });

        const data = await response.json();
        const redirectUrl = new URL("/admin/", url.origin);
        redirectUrl.hash = `access_token=${data.access_token}`;

        return Response.redirect(redirectUrl);
    }

    // Continue with the request
    return next();
}