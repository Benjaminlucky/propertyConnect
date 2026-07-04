const BASE = "https://api.prembly.com/identitypass/verification";

function headers() {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env.PREMBLY_API_KEY ?? "",
    "app-id":    process.env.PREMBLY_APP_ID  ?? "",
  };
}

export interface NINResult {
  verified:   boolean;
  firstname?: string;
  lastname?:  string;
  middlename?: string;
  gender?:    string;
  birthdate?: string;
}

export interface BVNResult {
  verified:   boolean;
  firstname?: string;
  lastname?:  string;
}

interface PremblyResponse {
  status:  boolean;
  detail?: Record<string, string> | string;
  error?:  string;
}

export async function verifyNIN(nin: string): Promise<NINResult> {
  const res = await fetch(`${BASE}/nin`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ number: nin }),
  });

  if (!res.ok) throw new Error(`Prembly HTTP ${res.status}`);

  const json = (await res.json()) as PremblyResponse;

  if (!json.status || typeof json.detail !== "object" || !json.detail) {
    return { verified: false };
  }

  const d = json.detail;
  return {
    verified:   true,
    firstname:  d.firstname,
    lastname:   d.lastname,
    middlename: d.middlename,
    gender:     d.gender,
    birthdate:  d.birthdate,
  };
}

export async function verifyBVN(bvn: string): Promise<BVNResult> {
  const res = await fetch(`${BASE}/bvn`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ number: bvn }),
  });

  if (!res.ok) throw new Error(`Prembly HTTP ${res.status}`);

  const json = (await res.json()) as PremblyResponse;

  if (!json.status || typeof json.detail !== "object" || !json.detail) {
    return { verified: false };
  }

  const d = json.detail;
  return {
    verified:  true,
    firstname: d.firstname,
    lastname:  d.lastname,
  };
}
