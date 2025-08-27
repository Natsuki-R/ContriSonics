// app/api/github/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid any accidental caching in dev

const GH_ENDPOINT = "https://api.github.com/graphql";

type Body = { username: string; from?: string; to?: string };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const { username } = body;
  const from =
    body.from || new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const to = body.to || new Date().toISOString();

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const query = `
    query($login:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$login) {
        contributionsCollection(from:$from, to:$to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                color
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const ghRes = await fetch(GH_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: { login: username, from, to } }),
    // cache: 'no-store' // optional: belt-and-suspenders
  });

  // Read the body ONCE, as JSON if possible; fall back to text
  let ghJson: any = null;
  let ghText: string | null = null;
  try {
    ghJson = await ghRes.json();
  } catch {
    try {
      ghText = await ghRes.text();
    } catch {
      ghText = null;
    }
  }

  if (!ghRes.ok) {
    const msg =
      ghJson?.errors?.[0]?.message ??
      ghText ??
      `GitHub returned ${ghRes.status}`;
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (
    !ghJson?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
  ) {
    const msg = ghJson?.errors?.[0]?.message ?? "No contribution data found";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const weeks =
    ghJson.data.user.contributionsCollection.contributionCalendar.weeks;

  const out = {
    weeks: weeks.map((w: any) => ({
      days: (w.contributionDays || []).map((d: any) => ({
        date: d.date,
        color: d.color,
        count: d.contributionCount,
      })),
    })),
  };

  return NextResponse.json(out, { status: 200 });
}
