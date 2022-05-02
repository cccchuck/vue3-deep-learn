import type { IDeps, IEffectFn } from "./type";

const bucket = new WeakMap();

let activeEffectFn;
let effectFnStack = [];

function effect(fn: Function) {
  const effectFn: IEffectFn = () => {
    // 在调用前清除依赖
    clean(effectFn);

    // 向调用栈中推送当前 effectFn
    activeEffectFn = effectFn;
    effectFnStack.push(effectFn);

    // 执行副作用函数
    fn();

    // 执行完毕后从调用栈中移除当前 effectFn
    effectFnStack.pop();
    activeEffectFn = effectFnStack[effectFnStack.length - 1];
  };
  effectFn.deps = [];
  effectFn();
}

function clean(fn: IEffectFn) {
  const deps = fn.deps;
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    dep.delete(fn);
  }
  fn.deps.length = 0;
}

function track<T extends object>(target: T, key: string | symbol) {
  if (!activeEffectFn) return;

  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  let deps: IDeps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  // 添加依赖函数
  deps.add(activeEffectFn);
  // 副作用函数记录依赖项
  activeEffectFn.deps.push(deps);
}

function trigger<T extends object>(target: T, key: string | symbol) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effectFns = depsMap.get(key);
  const effectFnRuns = new Set(effectFns);

  effectFnRuns.forEach((fn: Function) => fn());
}

const data = {
  name: "Chuck",
  age: 20,
  isShow: true,
};

const proxy = new Proxy(data, {
  get(target: typeof data, key) {
    track(target, key);
    return target[key];
  },
  set(target: typeof data, key: string, value: any) {
    target[key] = value;
    trigger(target, key);
    return true;
  },
});

effect(() => {
  console.log(proxy.isShow ? proxy.name : "Anonymous");
});

proxy.isShow = false;
proxy.name = "Tom";
