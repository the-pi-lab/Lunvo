/**
 * Safe Distribution Utilities
 * 
 * LUNVO intentionally does NOT use unofficial LinkedIn APIs or automation 
 * browser extensions to post content, as these frequently lead to account bans.
 * Instead, we use safe OS-level distribution methods.
 */

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

export interface WebhookPayload {
  platform: 'linkedin' | 'twitter' | 'newsletter';
  content: string | string[];
  scheduledDate?: string; // ISO String
}

export async function dispatchToWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error("Webhook dispatch failed:", error);
    return false;
  }
}
