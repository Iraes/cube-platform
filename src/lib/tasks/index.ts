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
import { invertObject } from './invert-object';
import { deepEqualTask } from './deep-equal';
import { sumRest } from './sum-rest';
import { mergeObjects } from './merge-objects';
import { languagesStatistic } from './languages-statistic';
import { arrayCountsMap } from './array-counts-map';
import { uniqueSet } from './unique-set';
import { daysBetweenDates } from './days-between-dates';
import { isEmptyPrototypes } from './is-empty-prototypes';
import { bookLibrary } from './book-library';
import { prototypeDecorator } from './prototype-decorator';
import { objectCreatePolyfill } from './object-create-polyfill';
import { bankAccount } from './bank-account';
import { fluentCalc } from './fluent-calc';
import { eventEmitterTask } from './event-emitter';

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
  invertObject,
  deepEqualTask,
  sumRest,
  mergeObjects,
  languagesStatistic,
  arrayCountsMap,
  uniqueSet,
  daysBetweenDates,
  isEmptyPrototypes,
  bookLibrary,
  prototypeDecorator,
  objectCreatePolyfill,
  bankAccount,
  fluentCalc,
  eventEmitterTask,
];

export function getTask(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

export function getTaskSlugs(): string[] {
  return tasks.map((task) => task.slug);
}
