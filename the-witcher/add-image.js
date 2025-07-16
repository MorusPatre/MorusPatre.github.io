
// This is a Cloudflare Worker that will handle image uploads.
// You will need to configure a binding in your Cloudflare dashboard.
// The binding should be named "IMAGE_BUCKET" and should point to your "add-image" R2 bucket.

export default {
  async fetch(request, env) {
    if (request.method === 'PUT') {
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
        const imageUrl = new URL(request.url).origin + '/' + key;
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }
    return new Response('Method Not Allowed', { status: 405 });
  },
};
