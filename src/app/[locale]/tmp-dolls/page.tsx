import { ClassicGameInner } from "@/components/ClassicGameInner";
const questions = Array.from({ length: 20 }, (_, i) => ({
  id: `q${i}`,
  prompt: `Kolik je ${i + 2} + ${i + 3}?`,
  options: [String(2 * i + 5), String(2 * i + 6), String(2 * i + 4), String(2 * i + 9)] as [string, string, string, string],
  correctIndex: 0,
  explanation: "x",
}));
export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ClassicGameInner locale="cs" game="oblekani" questions={questions} difficulty={1} backHref="/cs" />
    </div>
  );
}
