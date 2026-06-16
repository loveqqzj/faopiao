// functions/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(`[中间件] 请求路径: ${pathname}`);

  // ========== 新增：检查是否需要验证 ==========
  const accessKey = env.ACCESS_KEY;
  // 如果环境变量未设置，直接放行所有请求
  if (!accessKey) {
    console.log(`[中间件] 未设置 ACCESS_KEY，跳过验证，直接放行`);
    return next();
  }
  // =========================================

  // 公开路径白名单
  const publicPaths = [
    '/login.html',
    '/login',
    '/favicon.ico'
  ];

  if (publicPaths.includes(pathname)) {
    console.log(`[中间件] 公开路径，放行`);
    return next();
  }

  // API 请求全部放行
  if (pathname.startsWith('/api/')) {
    console.log(`[中间件] API 路径，放行`);
    return next();
  }

  // 静态资源放行
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    console.log(`[中间件] 静态资源，放行`);
    return next();
  }

  // 检查登录 Cookie
  const cookie = request.headers.get('Cookie') || '';
  const authToken = getCookieValue(cookie, 'auth_token');

  if (!authToken) {
    console.log(`[中间件] 未登录，重定向到 /login.html`);
    return Response.redirect(`${url.origin}/login.html`, 302);
  }

  console.log(`[中间件] 已登录，放行`);
  return next();
}

function getCookieValue(cookieString, name) {
  const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}