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
import { lettersCount } from './letters-count';
import { finalGrade } from './final-grade';
import { singleFizzBuzz } from './single-fizzbuzz';
import { arithmetic } from './arithmetic';
import { balancedBrackets } from './balanced-brackets';
import { findAllIdx } from './find-all-idx';
import { replaceItems } from './replace-items';
import { moveToStart } from './move-to-start';
import { hasArrays } from './has-arrays';
import { numbersByParity } from './numbers-by-parity';
import { sequenceSum } from './sequence-sum';
import { nestedStringCount } from './nested-string-count';
import { optionalChainingPath } from './optional-chaining-path';
import { partitionTask } from './partition';
import { onceTask } from './once';
import { arrayFilterFactories } from './array-filter-factories';
import { objectCalculator } from './object-calculator';
import { getField } from './get-field';
import { createUsernames } from './create-usernames';
import { calculatePrice } from './calculate-price';
import { mostSenior } from './most-senior';

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
  lettersCount,
  finalGrade,
  singleFizzBuzz,
  arithmetic,
  balancedBrackets,
  findAllIdx,
  replaceItems,
  moveToStart,
  hasArrays,
  numbersByParity,
  sequenceSum,
  nestedStringCount,
  optionalChainingPath,
  partitionTask,
  onceTask,
  arrayFilterFactories,
  objectCalculator,
  getField,
  createUsernames,
  calculatePrice,
  mostSenior,
];

export function getTask(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

export function getTaskSlugs(): string[] {
  return tasks.map((task) => task.slug);
}
