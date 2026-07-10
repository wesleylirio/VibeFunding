export function formatAmdRequestMessages(input: {
  system: string;
  user: string;
}) {
  return [
    { role: "system" as const, content: input.system },
    { role: "user" as const, content: input.user },
  ];
}
