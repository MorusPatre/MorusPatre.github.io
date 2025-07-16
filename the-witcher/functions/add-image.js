
// This is a Cloudflare Worker that will handle image uploads.
// You will need to configure a binding in your Cloudflare dashboard.
// The binding should be named "IMAGE_BUCKET" and should point to your "add-image" R2 bucket.

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const key = request.headers.get('X-Custom-File-Name');
      if (!key) {
        return new Response('X-Custom-File-Name header is required', { status: 400 });
      }

      try {
        await env.IMAGE_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get('content-type'),
          },
        });
        // Return just the key (filename) of the uploaded image
        return new Response(JSON.stringify({ key }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }
    return new Response('Method Not Allowed', { status: 405 });
  },
};
