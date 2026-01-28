import { s as supabase } from './supabase_CyZfh9_5.mjs';

async function checkAuth(context) {
  try {
    const authHeader = context.request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      const { data: { user: user2 }, error: error2 } = await supabase.auth.getUser();
      if (error2 || !user2) {
        return {
          authenticated: false,
          isAdmin: false,
          error: "Not authenticated"
        };
      }
      const isAdmin2 = checkAdminRole(user2);
      return {
        authenticated: true,
        isAdmin: isAdmin2,
        user: {
          id: user2.id,
          email: user2.email,
          role: user2.user_metadata?.role,
          user_metadata: user2.user_metadata
        }
      };
    }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return {
        authenticated: false,
        isAdmin: false,
        error: "Invalid token"
      };
    }
    const isAdmin = checkAdminRole(user);
    return {
      authenticated: true,
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        user_metadata: user.user_metadata
      }
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      authenticated: false,
      isAdmin: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function checkAdminRole(user) {
  if (user.user_metadata?.role === "admin") {
    return true;
  }
  if (user.app_metadata?.role === "admin") {
    return true;
  }
  const adminEmails = [];
  if (adminEmails.includes(user.email)) {
    return true;
  }
  return false;
}
async function requireAdmin(context) {
  const authResult = await checkAuth(context);
  if (!authResult.authenticated) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Authentication required",
          code: "UNAUTHORIZED"
        }
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  if (!authResult.isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Admin access required",
          code: "FORBIDDEN"
        }
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  return null;
}
async function getCurrentUser(context) {
  const authResult = await checkAuth(context);
  return authResult.user || null;
}
async function requireAdminPage(context) {
  const authResult = await checkAuth(context);
  if (!authResult.authenticated) {
    return {
      redirect: new Response(null, {
        status: 302,
        headers: { Location: "/admin?error=auth_required" }
      })
    };
  }
  if (!authResult.isAdmin) {
    return {
      redirect: new Response(null, {
        status: 302,
        headers: { Location: "/admin?error=access_denied" }
      })
    };
  }
  return { user: authResult.user };
}

export { requireAdmin as a, getCurrentUser as g, requireAdminPage as r };
