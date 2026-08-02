import type { Task } from '@/lib/runner/types';
import { capitalize } from './capitalize';
import { compareWithPrecision } from './compareWithPrecision';
import { countChars } from './count-chars';
import { dataTypesQuiz } from './data-types-quiz';
import { defaultTo } from './defaultto';
import { domFilterList } from './dom-filter-list';
import { domToggleBox } from './dom-toggle-box';
import { errors } from './errors';
import { filterEven } from './filter-even';
import { fizzBuzz } from './fizz-buzz';
import { reverseString } from './reverse-string';
import { stopGninnipsMySdrow } from './stop-gninnipS-My-sdroW';
import { sumTwoNumbers } from './sum-two-numbers';
import { wrapInParagraph } from './wrapInParagraph';

/**
 * Каталог задач. Хранится файлами в репозитории, а не в БД:
 * задачи версионируются вместе с кодом и правятся через обычный git-diff.
 * Порядок в массиве определяет порядок в списке на главной.
 */
export const tasks: Task[] = [
  sumTwoNumbers,
  reverseString,
  filterEven,
  countChars,
  fizzBuzz,
  capitalize,
  defaultTo,
  compareWithPrecision,
  stopGninnipsMySdrow,
  wrapInParagraph,
  domToggleBox,
  domFilterList,
  errors,
  dataTypesQuiz,
];

export function getTask(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

export function getTaskSlugs(): string[] {
  return tasks.map((task) => task.slug);
}
