type PagePlaceholderProps = {
  title: string;
  description: string;
  branch: string;
};

export function PagePlaceholder({ title, description, branch }: PagePlaceholderProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink text-balance">
        {title}
      </h1>
      <p className="max-w-md text-[13px] leading-relaxed text-ink-3 text-pretty">
        {description}
      </p>
      <span className="mt-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-ink-4">
        {branch}
      </span>
    </main>
  );
}
