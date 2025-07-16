export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Check if the request is for the image upload endpoint
    if (url.pathname === '/add-image' && request.method === 'POST') {
      const key = request.headers.get('X-Custom-File-Name');
      if (!key) {
        return new Response('X-Custom-File-Name header is required', { status: 400 });
      }

      try {
        // Upload the image to the R2 bucket
        await env.IMAGE_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get('content-type'),
          },
        });

        // Return the key (filename) of the uploaded image
        return new Response(JSON.stringify({ key }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }

    // For all other requests, fetch the static assets
    return env.ASSETS.fetch(request);
  },
};