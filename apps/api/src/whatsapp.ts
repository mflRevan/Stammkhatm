type WhatsappSendPayload = {
  tool: 'message';
  action: 'send';
  channel: 'whatsapp';
  target: string;
  message: string;
};

const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

export async function sendWhatsappMessage(target: string, message: string): Promise<boolean> {
  if (!gatewayUrl || !gatewayToken) {
    console.warn('⚠️  OpenClaw gateway not configured; WhatsApp send skipped');
    return false;
  }

  const payload: WhatsappSendPayload = {
    tool: 'message',
    action: 'send',
    channel: 'whatsapp',
    target,
    message,
  };

  const res = await fetch(`${gatewayUrl.replace(/\/$/, '')}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${gatewayToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('WhatsApp send failed', res.status, text);
    return false;
  }

  return true;
}
