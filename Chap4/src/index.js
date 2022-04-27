const data = {
  text: "Hello World",
};

const bucket = new WeakMap();

let activeEffectFn = null;

function effect(fn) {
  activeEffectFn = fn;
  fn();
}

function track(target, key) {
  if (!activeEffectFn) return;

  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  deps.add(activeEffectFn);
  console.log("track");
}

function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;

  let deps = depsMap.get(key);
  if (!deps) return;

  deps.forEach((fn) => fn());
  console.log("trigger");
}

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});

effect(() => {
  document.querySelector(".text").textContent = obj.text;
});

const input = document.querySelector(".input");

input.addEventListener("keyup", () => {
  obj.text = input.value;
});
