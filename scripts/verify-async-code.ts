import { isDeepStrictEqual } from 'node:util';
import type { AlgorithmTask } from '@/lib/runner/types';
import { sumFileSizes } from '@/lib/tasks/async-code/callbacks/sum-file-sizes';
import { getUsersInfo } from '@/lib/tasks/async-code/callbacks/get-users-info';
import { increaseLowestSalary } from '@/lib/tasks/async-code/promises/increase-lowest-salary';
import { promiseRaceTask } from '@/lib/tasks/async-code/promises/promise-race';
import { promiseAllTask } from '@/lib/tasks/async-code/promises/promise-all';
import { increaseAllSalaries } from '@/lib/tasks/async-code/async-await/increase-all-salaries';
import { promisesInSeries } from '@/lib/tasks/async-code/async-await/promises-in-series';
import { throttleTask } from '@/lib/tasks/async-code/event-loop/throttle';
import { debounceTask } from '@/lib/tasks/async-code/event-loop/debounce';

const tasks = [sumFileSizes, getUsersInfo, increaseLowestSalary, promiseRaceTask, promiseAllTask, increaseAllSalaries, promisesInSeries, throttleTask, debounceTask];
const implementations: Record<string, string> = {
  'sum-file-sizes': `function sumFileSizes(a,b,get,onDone){let x,y;const done=()=>{if(x!==undefined&&y!==undefined)onDone(x+y)};get(a,v=>{x=v;done()});get(b,v=>{y=v;done()})}`,
  'get-users-info': `function getUsersInfo(db,onLoad){db.getUsersIds(ids=>{if(!ids.length)return onLoad([]);const result=new Array(ids.length);let left=ids.length;ids.forEach((id,i)=>db.getUserInfo(id,user=>{result[i]=user;if(--left===0)onLoad(result)}))})}`,
  'increase-lowest-salary': `function increaseSalary(api){return api.getEmployees().then(items=>items.reduce((a,b)=>a.salary<=b.salary?a:b)).then(user=>api.setEmployeeSalary(user.id,user.salary*1.2)).then(user=>api.notifyEmployee(user.id,\`Hello, \${user.name}! Congratulations, your new salary is \${user.salary}!\`).then(()=>true)).catch(error=>api.notifyAdmin(error).then(()=>false))}`,
  'promise-race': `function promiseRace(promises){return new Promise((resolve,reject)=>promises.forEach(p=>Promise.resolve(p).then(resolve,reject)))}`,
  'promise-all': `function promiseAll(promises){return new Promise((resolve,reject)=>{if(!promises.length)return resolve([]);const out=new Array(promises.length);let left=promises.length;promises.forEach((p,i)=>Promise.resolve(p).then(v=>{out[i]=v;if(--left===0)resolve(out)},reject))})}`,
  'increase-all-salaries': `async function increaseSalaries(api){const users=await api.getEmployees();const avg=users.reduce((s,u)=>s+u.salary,0)/users.length;let count=0,budget=0;for(const user of users){try{const next=await api.setEmployeeSalary(user.id,Math.round(user.salary*(user.salary<avg?1.2:1.1)));await api.notifyEmployee(next.id,\`Hello, \${next.name}! Congratulations, your new salary is \${next.salary}!\`);count++;budget+=next.salary}catch(error){await api.notifyAdmin(error)}}await api.sendBudgetToAccounting(budget);return count}`,
  'promises-in-series': `async function promisesInSeries(asyncFns=[]){let value;for(const fn of asyncFns)value=await fn(value);return value}`,
  throttle: `function throttle(fn,delay,now=Date.now){let last=-Infinity;return function(...args){const current=now();if(current-last>=delay){last=current;return fn.apply(this,args)}}}`,
  debounce: `function debounce(fn,delay){let timer;return function(...args){const context=this;clearTimeout(timer);timer=setTimeout(()=>fn.apply(context,args),delay)}}`,
};

async function verify(task: AlgorithmTask) {
  const helperAt = task.starterCode.indexOf('\nfunction check');
  const helperAtAsync = task.starterCode.indexOf('\nasync function check');
  const indexes = [helperAt, helperAtAsync].filter((value) => value >= 0);
  const helper = indexes.length ? task.starterCode.slice(Math.min(...indexes)) : '';
  const code = implementations[task.slug] + helper;
  const resolve = new Function(`${code}; return (name) => eval(name);`)() as (name: string) => (...args: unknown[]) => unknown;
  for (const test of task.tests) {
    let actual: unknown;
    let error: unknown;
    try { actual = await resolve(test.fn ?? 'solution')(...test.input); } catch (caught) { error = caught; }
    if (error || !isDeepStrictEqual(actual, test.expected)) throw new Error(`${task.slug}: ${test.name}\n${String(error)}\n${JSON.stringify(actual)}`);
  }
  console.log(`OK ${task.slug}: ${task.tests.length}`);
}

async function main(){for(const task of tasks) await verify(task)}
main().catch((error)=>{console.error(error);process.exit(1)});
