import type { Task } from '@/lib/runner/types';
import { capitalize } from './standalone/capitalize';
import { compareWithPrecision } from './standalone/compareWithPrecision';
import { countChars } from './standalone/count-chars';
import { dataTypesQuiz } from './standalone/data-types-quiz';
import { defaultTo } from './standalone/defaultto';
import { domFilterList } from './standalone/dom-filter-list';
import { domToggleBox } from './standalone/dom-toggle-box';
import { errors } from './standalone/errors';
import { filterEven } from './standalone/filter-even';
import { fizzBuzz } from './standalone/fizz-buzz';
import { reverseString } from './standalone/reverse-string';
import { stopGninnipsMySdrow } from './standalone/stop-gninnipS-My-sdroW';
import { sumTwoNumbers } from './standalone/sum-two-numbers';
import { wrapInParagraph } from './standalone/wrapInParagraph';
import { lettersCount } from './reference-types/objects/letters-count';
import { finalGrade } from './reference-types/conditions/final-grade';
import { singleFizzBuzz } from './reference-types/conditions/single-fizzbuzz';
import { arithmetic } from './reference-types/ternary-and-switch/arithmetic';
import { balancedBrackets } from './reference-types/loops/balanced-brackets';
import { findAllIdx } from './reference-types/loops/find-all-idx';
import { replaceItems } from './reference-types/pure-functions/replace-items';
import { moveToStart } from './reference-types/arrays/move-to-start';
import { hasArrays } from './reference-types/arrays/has-arrays';
import { numbersByParity } from './reference-types/arrays/numbers-by-parity';
import { sequenceSum } from './advanced-functions/recursion-basics/sequence-sum';
import { nestedStringCount } from './advanced-functions/recursion-practice/nested-string-count';
import { optionalChainingPath } from './advanced-functions/recursion-practice/optional-chaining-path';
import { partitionTask } from './advanced-functions/higher-order-functions/partition';
import { onceTask } from './advanced-functions/closures/once';
import { arrayFilterFactories } from './advanced-functions/closures-practice/array-filter-factories';
import { objectCalculator } from './advanced-functions/this-context/object-calculator';
import { getField } from './array-iteration/array-iteration-methods/get-field';
import { createUsernames } from './array-iteration/array-iteration-methods/create-usernames';
import { calculatePrice } from './array-iteration/array-iteration-methods/calculate-price';
import { mostSenior } from './array-iteration/array-iteration-methods/most-senior';
import { invertObject } from './objects/object-methods/invert-object';
import { deepEqualTask } from './objects/object-methods/deep-equal';
import { sumRest } from './objects/spread-rest/sum-rest';
import { mergeObjects } from './objects/spread-rest/merge-objects';
import { languagesStatistic } from './objects/destructuring/languages-statistic';
import { arrayCountsMap } from './objects/map/array-counts-map';
import { uniqueSet } from './objects/set/unique-set';
import { daysBetweenDates } from './objects/date/days-between-dates';
import { isEmptyPrototypes } from './prototypes-and-classes/prototype-chain/is-empty-prototypes';
import { bookLibrary } from './prototypes-and-classes/constructor-functions/book-library';
import { prototypeDecorator } from './prototypes-and-classes/this-call-apply-bind/prototype-decorator';
import { objectCreatePolyfill } from './prototypes-and-classes/object-create/object-create-polyfill';
import { bankAccount } from './prototypes-and-classes/classes/bank-account';
import { fluentCalc } from './prototypes-and-classes/classes/fluent-calc';
import { eventEmitterTask } from './prototypes-and-classes/classes/event-emitter';
import { arrowFunctionFactory } from './array-iteration/arrow-functions/arrow-function-factory';
import { analyzeNumbers } from './array-iteration/module-checklist/analyze-numbers';
import { linkPrototype } from './prototypes-and-classes/prototype-vs-proto/link-prototype';
import { userProfileClass } from './prototypes-and-classes/review-booking/user-profile-class';
import { arrayToCsv } from './error-handling/try-catch/array-to-csv';
import { incrementStoredCounter } from './error-handling/data-boundaries/increment-counter';
import { repeatableData } from './error-handling/custom-errors/repeatable-data';
import { applyFunctions } from './error-handling/custom-errors/apply-functions';

import { swapValues } from './primitive-types/variables/swap-values';
import { safeNumber } from './primitive-types/type-conversion/safe-number';
import { roundTo } from './primitive-types/numbers/round-to';
import { capitalizeWord } from './primitive-types/strings/capitalize-word';
import { wrapInTag } from './primitive-types/template-strings/wrap-in-tag';
import { incrementCounter } from './reference-types/objects/increment-counter';
import { countBrackets } from './reference-types/loops/count-brackets';
import { greetDefault } from './reference-types/functions/greet-default';
import { factorial } from './advanced-functions/recursion-basics/factorial';
import { sumNestedNumbers } from './advanced-functions/recursion-practice/sum-nested-numbers';
import { applyToAll } from './advanced-functions/higher-order-functions/apply-to-all';
import { createCounter } from './advanced-functions/closures/create-counter';
import { greaterThan } from './advanced-functions/closures-practice/greater-than';
import { thisBox } from './advanced-functions/this-context/this-box';
import { arrowBasics } from './array-iteration/arrow-functions/arrow-basics';
import { mapFilterReduce } from './array-iteration/array-iteration-methods/map-filter-reduce';
import { shallowEqual } from './objects/object-methods/shallow-equal';
import { formatDateTask } from './objects/date/format-date';
import { pointConstructor } from './prototypes-and-classes/constructor-functions/point-constructor';
import { rectangleClass } from './prototypes-and-classes/classes/rectangle-class';

/**
 * Каталог задач. Хранится файлами в репозитории, а не в БД:
 * задачи версионируются вместе с кодом и правятся через обычный git-diff.
 * Папки повторяют структуру «модуль / урок»; standalone — старые задачи,
 * которые пока не привязаны к конкретному уроку.
 */
export const tasks: Task[] = [
  sumTwoNumbers,
  reverseString,
  filterEven,
  countChars,
  fizzBuzz,
  capitalizeWord,
  capitalize,
  safeNumber,
  defaultTo,
  roundTo,
  compareWithPrecision,
  stopGninnipsMySdrow,
  wrapInTag,
  wrapInParagraph,
  domToggleBox,
  domFilterList,
  errors,
  dataTypesQuiz,
  swapValues,
  greetDefault,
  incrementCounter,
  lettersCount,
  finalGrade,
  singleFizzBuzz,
  arithmetic,
  countBrackets,
  balancedBrackets,
  findAllIdx,
  replaceItems,
  moveToStart,
  hasArrays,
  numbersByParity,
  factorial,
  sequenceSum,
  sumNestedNumbers,
  nestedStringCount,
  optionalChainingPath,
  applyToAll,
  partitionTask,
  createCounter,
  onceTask,
  greaterThan,
  arrayFilterFactories,
  thisBox,
  objectCalculator,
  arrowBasics,
  mapFilterReduce,
  getField,
  createUsernames,
  calculatePrice,
  mostSenior,
  invertObject,
  shallowEqual,
  deepEqualTask,
  sumRest,
  mergeObjects,
  languagesStatistic,
  arrayCountsMap,
  uniqueSet,
  formatDateTask,
  daysBetweenDates,
  isEmptyPrototypes,
  pointConstructor,
  bookLibrary,
  prototypeDecorator,
  objectCreatePolyfill,
  rectangleClass,
  bankAccount,
  fluentCalc,
  eventEmitterTask,
  arrowFunctionFactory,
  analyzeNumbers,
  linkPrototype,
  userProfileClass,
  arrayToCsv,
  incrementStoredCounter,
  repeatableData,
  applyFunctions,
];

export function getTask(slug: string): Task | undefined {
  return tasks.find((task) => task.slug === slug);
}

export function getTaskSlugs(): string[] {
  return tasks.map((task) => task.slug);
}
