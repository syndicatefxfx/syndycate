import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPERADMIN_EMAIL = "syndicatetradefx@gmail.com";

const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase env vars are missing");
  }
  return createClient(supabaseUrl, serviceKey);
};

const getToken = (req) => {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
};

const requireUser = async (req, supabase) => {
  const token = getToken(req);
  if (!token) return { user: null, error: "Missing token" };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null, error: error?.message || "Invalid token" };
  }
  return { user: data.user, error: null };
};

export async function GET(req) {
  try {
    const supabase = createAdminClient();
    const { user, error } = await requireUser(req, supabase);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }
    if ((user.email || "").toLowerCase() !== SUPERADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const users = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      is_superadmin: u.email === SUPERADMIN_EMAIL,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = createAdminClient();
    const { user, error } = await requireUser(req, supabase);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }
    if ((user.email || "").toLowerCase() !== SUPERADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const password = (body?.password || "").toString().trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = createAdminClient();
    const { user, error } = await requireUser(req, supabase);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }
    if ((user.email || "").toLowerCase() !== SUPERADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const id = (body?.id || "").toString().trim();
    if (!id) {
      return NextResponse.json({ error: "User id required" }, { status: 400 });
    }

    const { data: target, error: targetError } = await supabase.auth.admin.getUserById(id);
    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 404 });
    }

    const targetEmail = target?.user?.email || "";
    if (targetEmail.toLowerCase() === SUPERADMIN_EMAIL) {
      return NextResponse.json({ error: "Cannot delete superadmin" }, { status: 403 });
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
