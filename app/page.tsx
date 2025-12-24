"use client";

import { useMemo, useState } from "react";
import { PRESETS } from "@/lib/presets";
import {
  type CreateVideoFormState,
  createVideoFormSchema
} from "@/lib/schema";

type BuilderSection = {
  title: string;
  bullets: string[];
};

const builderSections: BuilderSection[] = [
  {
    title: "Narrativa",
    bullets: [
      "Defina a abertura (local, horário do dia, clima).",
      "Descreva como a câmera se movimenta e transições.",
      "Inclua elementos humanos ou objetos-chave com ações específicas.",
      "Finalize com call-to-action ou momento memorável."
    ]
  },
  {
    title: "Estética",
    bullets: [
      "Cite referências de estilo (film noir, documental, high fashion).",
      "Especifique iluminação, color grade, textura e ritmo de edição.",
      "Adicione trilha sonora/voice-over com idioma e emoção desejada."
    ]
  },
  {
    title: "Detalhes Técnicos",
    bullets: [
      "Informe duração, aspect ratio e formato de exportação.",
      "Configure câmera virtual (lente, profundidade de campo).",
      "Defina anotações de pós-produção (tipografia, efeitos, subtítulos)."
    ]
  }
];

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [advancedConfig, setAdvancedConfig] = useState("");
  const [formState, setFormState] = useState<CreateVideoFormState>({
    status: "idle"
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState({ status: "submitting" });

    const form = createVideoFormSchema.safeParse({ prompt, advancedConfig });

    if (!form.success) {
      setFormState({
        status: "error",
        message: Object.values(form.error.flatten().fieldErrors)
          .flat()
          .join(" ")
      });
      return;
    }

    let parsedConfig: Record<string, unknown> | undefined;

    if (form.data.advancedConfig?.trim()) {
      parsedConfig = JSON.parse(form.data.advancedConfig);
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: form.data.prompt,
          config: parsedConfig
        })
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(
          typeof error === "string" ? error : "Falha ao gerar vídeo."
        );
      }

      const data = await response.json();

      setFormState({
        status: "success",
        message:
          data.status === "queued"
            ? "Pedido enviado! Monitorando o job enquanto processa."
            : "Vídeo pronto!",
        jobId: data.jobId,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        configDump: parsedConfig
      });
    } catch (error) {
      setFormState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o prompt."
      });
    }
  };

  const handlePreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    setPrompt(preset.prompt);
    setAdvancedConfig(
      preset.config ? JSON.stringify(preset.config, null, 2) : ""
    );
    setFormState({ status: "idle" });
  };

  const disableSubmit = useMemo(
    () => formState.status === "submitting",
    [formState.status]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-400">
          Sora 2 Video Studio
        </p>
        <h1 className="text-4xl font-bold text-slate-50 sm:text-5xl">
          Crie vídeos de alto impacto com prompts profissionais
        </h1>
        <p className="max-w-2xl text-base text-slate-300">
          Combine narrativa, estética e parâmetros avançados para direcionar o
          Sora 2 em produções cinematográficas. Utilize presets curados ou
          monte seu prompt do zero com o assistente estruturado.
        </p>
      </header>

      <section className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-brand-900/20 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Briefing Criativo
              </h2>
              <p className="text-sm text-slate-400">
                Descreva o vídeo em detalhes. Use os tópicos ao lado para
                estruturar sua narrativa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPrompt("");
                setAdvancedConfig("");
                setFormState({ status: "idle" });
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 transition hover:border-brand-400 hover:text-brand-200"
            >
              Resetar
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="prompt"
                className="text-sm font-medium text-slate-200"
              >
                Prompt principal
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={8}
                placeholder="Ex: Produza um vídeo de lançamento para..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-100 shadow-inner shadow-black/40 transition focus:border-brand-400"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="config"
                  className="text-sm font-medium text-slate-200"
                >
                  Configuração avançada (JSON opcional)
                </label>
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-brand-200">
                  Opcional
                </span>
              </div>
              <textarea
                id="config"
                name="config"
                rows={8}
                placeholder='{\n  \"duration\": 30,\n  \"aspect_ratio\": \"16:9\",\n  \"style\": \"cinematic\"\n}'
                value={advancedConfig}
                onChange={(event) => setAdvancedConfig(event.target.value)}
                className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs text-slate-100 shadow-inner shadow-black/40 transition focus:border-brand-400"
              />
              <p className="text-xs text-slate-500">
                Defina parâmetros como duração, aspect ratio, câmera, trilha,
                efeitos, legendas, voice-over e mais. Deixe em branco para usar
                apenas o prompt natural.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={disableSubmit}
                className="flex-1 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-500/50"
              >
                {formState.status === "submitting"
                  ? "Enviando..."
                  : "Gerar vídeo com Sora 2"}
              </button>
              <span className="text-xs text-slate-500">
                Processamento leva alguns minutos. Receba o link do job para
                acompanhar no painel da OpenAI.
              </span>
            </div>
          </form>

          {formState.status !== "idle" && (
            <div
              className={`rounded-2xl border p-6 ${
                formState.status === "success"
                  ? "border-brand-400/40 bg-brand-500/10 text-brand-100"
                  : formState.status === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-slate-800 bg-slate-900 text-slate-200"
              }`}
            >
              <p className="text-sm font-semibold">
                {formState.status === "success"
                  ? "Solicitação enviada"
                  : formState.status === "error"
                  ? "Erro ao enviar"
                  : "Processando"}
              </p>
              {formState.message && (
                <p className="mt-2 text-sm opacity-90">{formState.message}</p>
              )}
              {formState.jobId && (
                <p className="mt-3 text-xs font-medium uppercase text-slate-400">
                  Job ID:{" "}
                  <span className="font-mono text-brand-200">
                    {formState.jobId}
                  </span>
                </p>
              )}
              {formState.videoUrl && (
                <a
                  href={formState.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                >
                  Assistir vídeo renderizado
                  <span aria-hidden>↗</span>
                </a>
              )}
              {formState.thumbnailUrl && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Prévia do thumbnail
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formState.thumbnailUrl}
                    alt="Thumbnail do vídeo"
                    className="mt-3 w-full rounded-xl border border-slate-800"
                  />
                </div>
              )}
              {formState.configDump && (
                <details className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Configuração utilizada
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-xs text-slate-200">
                    {JSON.stringify(formState.configDump, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-10">
          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/30">
            <h3 className="text-lg font-semibold text-slate-100">
              Guia de Prompt Profissional
            </h3>
            <div className="space-y-5">
              {builderSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
                    {section.title}
                  </p>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4 text-xs text-brand-100">
              Dica: combine linguagem natural com parâmetros estruturados. O
              Sora responde melhor quando entende storytelling, estilo visual e
              metas de comunicação.
            </p>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  Presets curados
                </h3>
                <p className="text-sm text-slate-400">
                  Clique para carregar prompts completos com configurações
                  avançadas.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePreset(preset.id)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-brand-500/60 hover:bg-brand-500/10"
                >
                  <p className="text-sm font-semibold text-slate-100">
                    {preset.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {preset.description}
                  </p>
                  <pre className="mt-3 max-h-24 overflow-hidden whitespace-pre-wrap break-all font-mono text-[10px] text-slate-500">
                    {preset.prompt}
                  </pre>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
