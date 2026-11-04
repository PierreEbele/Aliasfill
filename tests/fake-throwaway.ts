// In-memory stand-in for the Throwaway Mail API, enough for the extension: API key auth, domains,
// per-site addresses, and the long-polled verification code (`GET /v1/addresses/:id/code`).
type Message = { id: string; from: string; subject: string; code: string | null; links: { url: string }[]; receivedAt: number };
type Address = { id: string; email: string; site_name: string; site_url?: string; label?: string; created_at: number; messages: Message[] };

export function fakeThrowaway({ domain = "mail.example.test", key = "tm_test_key" } = {}) {
  const addresses: Address[] = [];
  let seq = 0;
  let clock = 0;
  // Strictly increasing timestamps, so "since" comparisons never tie.
  const now = () => (clock = Math.max(Date.now(), clock + 1));

  function createAddress(body: { site_name?: string; site_url?: string; label?: string; preferred_domain?: string }) {
    const id = `a${++seq}`;
    const address: Address = {
      id,
      email: `${body.site_name?.split(".")[0] || "x"}.${id}@${body.preferred_domain || domain}`,
      site_name: body.site_name || "",
      site_url: body.site_url,
      label: body.label,
      created_at: now(),
      messages: [],
    };
    addresses.push(address);
    return address;
  }

  // Delivers a mail; the code is the first 4–8 digit number of the text, like the server's extraction for simple mails.
  function deliver(email: string, { from = "noreply@shop.example.org", subject = "Your code", text = "" } = {}) {
    const a = addresses.find((x) => x.email === email);
    if (!a) throw new Error(`no address ${email}`);
    const links = [...text.matchAll(/https?:\/\/\S+/g)].map((m) => ({ url: m[0] }));
    a.messages.push({ id: `m${++seq}`, from, subject, code: /\b\d{4,8}\b/.exec(text)?.[0] ?? null, links, receivedAt: now() });
  }

  const view = (a: Address) => ({
    id: a.id,
    email: a.email,
    site_name: a.site_name,
    label: a.label,
    created_at: a.created_at,
    unread_count: a.messages.length,
  });
  const json = (status: number, body?: unknown) =>
    new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  function latest(a: Address, since: string | null, require: string) {
    const after = since && /^m\d+$/.test(since) ? (a.messages.find((m) => m.id === since)?.receivedAt ?? 0) : Number(since || 0);
    return (
      a.messages
        .filter((m) => m.receivedAt > after && (require === "code" ? m.code : m.code || m.links.length))
        .sort((x, y) => y.receivedAt - x.receivedAt)[0] || null
    );
  }

  async function handle(url: string, init: RequestInit = {}): Promise<Response> {
    const u = new URL(url);
    const auth = new Headers(init.headers).get("authorization");
    if (auth !== `Bearer ${key}`) return json(401, { error: { message: "Invalid API key" } });
    const method = init.method || "GET";
    const p = u.pathname;
    if (p === "/v1/auth/me") return json(200, { user: { name: "Ada", email: "ada@example.org" } });
    if (p === "/v1/domains") return json(200, { domains: [{ name: domain }] });
    if (p === "/v1/addresses" && method === "POST") {
      const a = createAddress(JSON.parse(String(init.body || "{}")));
      return json(201, { id: a.id, email: a.email, address: view(a), avoided_domains: [] });
    }
    if (p === "/v1/addresses") {
      const site = u.searchParams.get("site")?.toLowerCase();
      const q = u.searchParams.get("q")?.toLowerCase();
      const found = addresses.filter((a) => (!site || a.site_name.toLowerCase().includes(site)) && (!q || a.email.includes(q)));
      return json(200, { addresses: found.map(view) });
    }
    const code = /^\/v1\/addresses\/([^/]+)\/code$/.exec(p);
    if (code) {
      const a = addresses.find((x) => x.id === decodeURIComponent(code[1]));
      if (!a) return json(404, { error: { message: "Not found" } });
      const until = Date.now() + Number(u.searchParams.get("wait") || 0) * 1000;
      for (;;) {
        const m = latest(a, u.searchParams.get("since"), u.searchParams.get("require") || "any");
        if (m) return json(200, { code: m.code, from: m.from, subject: m.subject, message_id: m.id, links: m.links });
        if (Date.now() >= until) return json(204);
        await new Promise((r) => setTimeout(r, 25));
      }
    }
    const one = /^\/v1\/addresses\/([^/]+)$/.exec(p);
    if (one) {
      const a = addresses.find((x) => x.id === decodeURIComponent(one[1]));
      return a ? json(200, { address: view(a) }) : json(404, { error: { message: "Not found" } });
    }
    return json(404, { error: { message: "Not found" } });
  }

  return { key, domain, addresses, createAddress, deliver, handle };
}
