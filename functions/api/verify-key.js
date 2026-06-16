// functions/api/verify-key.js
export async function onRequest(context) {
  const { request, env } = context;

  // ========== 新增：GET 请求用来查询是否需要验证 ==========
  if (request.method === "GET") {
    const presetKey = env.ACCESS_KEY;
    return new Response(JSON.stringify({ 
      requiresAuth: !!presetKey  // true = 需要验证，false = 不需要
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  // =====================================================

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { key } = await request.json();
    const presetKey = env.ACCESS_KEY;

    if (!presetKey) {
      return new Response(JSON.stringify({ error: "服务器未配置访问密钥" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (key !== presetKey) {
      return new Response(JSON.stringify({ error: "密钥错误，拒绝访问" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const sessionToken = crypto.randomUUID();

    return new Response(JSON.stringify({ message: "验证成功" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": [
          `auth_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
          `user_email=guest; Secure; SameSite=Strict; Path=/; Max-Age=86400`
        ].join(", ")
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}