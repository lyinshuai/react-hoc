const compose = (...funcs) => (component) => {
  if (funcs.lenght === 0) {
    return component;
  }
  const last = funcs[funcs.length - 1];
  console.log('compose', funcs.reduceRight((res, cur) => cur(res), last(component)));
  return funcs.reduceRight((res, cur) => cur(res), last(component));
};

export {
  compose,
};
