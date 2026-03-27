export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    hasEnv: !!context.env,
    hasDB: !!context.env?.DB,
    envKeys: Object.keys(context.env || {})
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
