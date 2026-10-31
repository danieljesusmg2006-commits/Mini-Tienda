import { ChatMessage, Order, OrderChat } from "@/types/store";

export const CLOUD_SYNC_TOPIC = "mini-tienda-daniel-sync-v1";
export const CLOUD_NTFY_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}`;

export type CloudSyncEvent =
  | {
      type: "CHAT_MESSAGE";
      orderId: string;
      message: ChatMessage;
      customerMeta?: { name?: string; email?: string; phone?: string };
    }
  | {
      type: "CHAT_READ";
      orderId: string;
      reader: "customer" | "seller";
    }
  | {
      type: "ORDER_CREATED";
      order: Order;
    };

/**
 * Broadcast an event to the cloud real-time bus
 */
export async function broadcastCloudEvent(event: CloudSyncEvent): Promise<boolean> {
  try {
    const payload = JSON.stringify(event);

    // Broadcast to ntfy.sh (works everywhere: serverless, edge, client, localhost)
    const res = await fetch(CLOUD_NTFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Title: event.type === "CHAT_MESSAGE" ? `Chat ${event.orderId}` : `Order Sync`,
      },
      body: payload,
    });

    return res.ok;
  } catch (err) {
    console.warn("Cloud sync broadcast failed:", err);
    return false;
  }
}

/**
 * Play a gentle 2-tone notification sound using Web Audio API
 * No external audio files or downloads required.
 */
export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.35);
  } catch {
    // Silently ignore audio restrictions if autoplay is blocked
  }
}

/**
 * Start listening for real-time events via Server-Sent Events (SSE)
 */
export function startCloudSyncListener(
  onEvent: (event: CloudSyncEvent) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let eventSource: EventSource | null = null;
  let isClosed = false;
  let retryTimer: NodeJS.Timeout | null = null;

  const connect = () => {
    if (isClosed) return;

    try {
      // Connect to ntfy.sh SSE stream
      eventSource = new EventSource(`${CLOUD_NTFY_URL}/sse`);

      eventSource.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw.event === "message" && raw.message) {
            const parsedEvent = JSON.parse(raw.message) as CloudSyncEvent;
            if (parsedEvent && parsedEvent.type) {
              onEvent(parsedEvent);
            }
          }
        } catch {
          // Ignore non-json or ping frames
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          // Reconnect with exponential backoff / simple 3s retry
          retryTimer = setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.warn("Could not initialize EventSource for cloud sync:", err);
      if (!isClosed) {
        retryTimer = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
