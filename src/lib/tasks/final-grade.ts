import type { AlgorithmTask } from '@/lib/runner/types';
export const finalGrade: AlgorithmTask = {
  kind: 'algorithm', slug: 'final-grade', title: 'Final Grade', language: 'javascript',
  description: `Реализуйте \`finalGrade(exam, projects)\`.

- 100, если \`exam > 90\` или \`projects > 10\`;
- 90, если \`exam > 75\` и \`projects >= 5\`;
- 75, если \`exam > 50\` и \`projects >= 2\`;
- 0 в остальных случаях.`,
  starterCode: `function finalGrade(exam, projects) {

}
`,
  tests: [
    { name: 'Высокая оценка за экзамен → 100', fn: 'finalGrade', input: [99, 0], expected: 100 },
    { name: 'Больше 10 проектов → 100', fn: 'finalGrade', input: [10, 15], expected: 100 },
    { name: '85 баллов и 5 проектов → 90', fn: 'finalGrade', input: [85, 5], expected: 90 },
    { name: '55 баллов и 3 проекта → 75', fn: 'finalGrade', input: [55, 3], expected: 75 },
    { name: '55 баллов без проектов → 0', fn: 'finalGrade', input: [55, 0], expected: 0 },
  ],
};
