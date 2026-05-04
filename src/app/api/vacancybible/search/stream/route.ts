import { getProgress, getSession } from "@/lib/vacancybible/store";

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const sent = new Set<string>();
      const sendSnapshot = () => {
        const session = getSession(sessionId);
        const progress = getProgress(sessionId);
        for (const evt of progress) {
          const key = `${evt.timestamp}:${evt.stage}:${evt.message}`;
          if (sent.has(key)) continue;
          sent.add(key);
          controller.enqueue(sseData(evt));
        }
        if (session?.status === "completed" || session?.status === "failed") {
          controller.enqueue(sseData({ done: true, status: session.status }));
          clearInterval(timer);
          controller.close();
        }
      };

      const timer = setInterval(sendSnapshot, 700);
      sendSnapshot();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
