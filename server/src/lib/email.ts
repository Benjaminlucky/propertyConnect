import { Resend } from "resend";

let _resend: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const MODE_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp enquiry",
  viewing:  "Viewing request",
  message:  "Message",
};

export interface EnquiryNotificationOpts {
  agentName:     string;
  agentEmail:    string;
  marketId:      string;
  listingTitle:  string;
  neighbourhood: string;
  buyerName:     string;
  buyerPhone?:   string;
  buyerEmail?:   string;
  mode:          string;
  message?:      string;
}

export async function sendEnquiryNotification(opts: EnquiryNotificationOpts): Promise<void> {
  const c = client();
  if (!c) return;

  const origin = process.env.CLIENT_ORIGIN ?? "https://mypropertyconnect.ng";
  const dashboardUrl = `${origin}/${opts.marketId}/dashboard`;
  const modeLabel = MODE_LABEL[opts.mode] ?? opts.mode;
  const firstName = opts.agentName.split(" ")[0];

  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px">
  <p style="margin:0 0 16px">Hi ${firstName},</p>
  <p style="margin:0 0 16px">
    You have a new <strong>${modeLabel}</strong> on your listing:
  </p>
  <div style="background:#f5f5f0;border-radius:10px;padding:16px 20px;margin:0 0 20px">
    <p style="margin:0;font-weight:700">${opts.listingTitle}</p>
    <p style="margin:4px 0 0;color:#555;font-size:14px">${opts.neighbourhood}</p>
  </div>
  <table style="border-collapse:collapse;width:100%;margin:0 0 20px">
    <tr><td style="padding:6px 0;color:#555;font-size:14px;width:110px">From</td>
        <td style="padding:6px 0;font-weight:600">${opts.buyerName}</td></tr>
    ${opts.buyerPhone
      ? `<tr><td style="padding:6px 0;color:#555;font-size:14px">Phone</td>
             <td style="padding:6px 0;font-weight:600">
               <a href="tel:${opts.buyerPhone}" style="color:#0b3d2e;text-decoration:none">${opts.buyerPhone}</a>
             </td></tr>`
      : ""}
    ${opts.buyerEmail
      ? `<tr><td style="padding:6px 0;color:#555;font-size:14px">Email</td>
             <td style="padding:6px 0;font-weight:600">
               <a href="mailto:${opts.buyerEmail}" style="color:#0b3d2e;text-decoration:none">${opts.buyerEmail}</a>
             </td></tr>`
      : ""}
    ${opts.message
      ? `<tr><td style="padding:6px 0;color:#555;font-size:14px;vertical-align:top">Message</td>
             <td style="padding:6px 0">${opts.message}</td></tr>`
      : ""}
  </table>
  <a href="${dashboardUrl}"
     style="display:inline-block;background:#0b3d2e;color:#fff;text-decoration:none;
            padding:11px 20px;border-radius:8px;font-weight:700;font-size:14px">
    View lead in dashboard →
  </a>
  <p style="margin:28px 0 0;color:#999;font-size:12px">
    MyPropertyConnect · <a href="https://mypropertyconnect.ng" style="color:#999">mypropertyconnect.ng</a>
  </p>
</body></html>`.trim();

  await c.emails.send({
    from:    process.env.RESEND_FROM ?? "MyPropertyConnect <notifications@mypropertyconnect.ng>",
    to:      opts.agentEmail,
    subject: `New ${modeLabel} — ${opts.listingTitle}`,
    html,
  });
}
