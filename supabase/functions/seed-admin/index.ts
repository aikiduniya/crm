import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const email = "admin@buildcrm.com";
    const password = "admin123";

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === email);
    
    if (existing) {
      // Ensure role exists
      const { data: existingRole } = await adminClient.from("user_roles").select("*").eq("user_id", existing.id).single();
      if (!existingRole) {
        await adminClient.from("user_roles").insert({ user_id: existing.id, role: "admin" });
      }
      return new Response(JSON.stringify({ message: "Admin user already exists", email, password }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "System Admin" },
    });

    if (createError) throw createError;

    // Assign admin role
    await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });

    return new Response(JSON.stringify({ message: "Admin user created", email, password }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
