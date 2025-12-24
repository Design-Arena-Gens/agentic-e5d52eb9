import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1),
  config: z.record(z.any()).optional()
});

type SoraJobResponse = {
  id: string;
  status: string;
  assets?: {
    video?: { url: string };
    thumbnail?: { url: string };
  };
  error?: { message: string };
};

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);

  if (!raw) {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.SORA_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "A aplicação não possui chave de acesso ao Sora/OpenAI definida. Configure a variável de ambiente SORA_API_KEY ou OPENAI_API_KEY."
      },
      { status: 500 }
    );
  }

  const payload = {
    model: "sora-2.0",
    prompt: parsed.data.prompt,
    ...(parsed.data.config ? { config: parsed.data.config } : {})
  };

  const soraResponse = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!soraResponse.ok) {
    const errorText = await soraResponse.text();
    return NextResponse.json(
      { error: `Sora API retornou ${soraResponse.status}: ${errorText}` },
      { status: soraResponse.status }
    );
  }

  const data = (await soraResponse.json()) as SoraJobResponse;

  if (data.error) {
    return NextResponse.json(
      { error: data.error.message ?? "Erro desconhecido ao gerar vídeo." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    jobId: data.id,
    status: data.status,
    videoUrl: data.assets?.video?.url,
    thumbnailUrl: data.assets?.thumbnail?.url
  });
}
