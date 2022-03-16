const ElementVNode = {
  type: 'div',
  props: {
    id: 'app'
  },
  children: [{
    type: 'span',
    children: '我是郜克帅'
  }]
}

const ElementVNode2 = {
  type: 'input',
  props: {
    required: true,
    placeholder: '请输入账号'
  },
  children: null
}

/**
 * 仅体现将虚拟 DOM 转换为 HTML 字符串的核心原理
 * 
 * 未考虑边界问题
 * @param {Object} vnode 虚拟DOM
 * @returns HTML 字符串
 */
const renderElementVNode = (vnode) => {
  // 去除标签名称 tag 和标签属性 props，以及标签的子节点。
  const { type: tag, props, children } = vnode;

  // 开始标签的头部
  let ret = `<${ tag }`;

  // 处理标签属性
  if (props) {
    for (let k in props) {
      // 以 key="value" 的形式拼接字符串
      ret += ` ${ k }="${ props[k] }"`
    }
  }

  // 闭合标签
  ret += '>'

  // 处理子节点
  // 如果子节点的类型是字符串，则是文本内容，直接拼接
  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVNode(child);
    })
  }

  // 结束标签
  ret += `</${ tag }>`;

  return ret;
}

const VOID_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                  'link', 'meta', 'param', 'source', 'track', 'wbr'];

const SHOULD_IGNORE_PROPS = ['key', 'ref'];

const isBooleanAttr = (key) => 
(`itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly` + 
  `,async,autofucus,autoplay,controls,default,defer,disabled,hidden,` + 
  `loop,open,required,reversed,scoped,seamless,` + 
  `checked,muted,multiple,selected`).split(',').includes(key);

const isSSRSafeAttrName = (key) => /[>/="'\u0009\u000a\u000c\u0020]/.test(key);

const renderElementVNode2 = (vnode) => {
  const { type: tag, props, children } = vnode;
  const isVoidElement = VOID_TAGS.includes(tag);

  let ret = `<${ tag }`;

  if (props) {
    for (let k in props) {
      ret += ` ${ k }="${ props[k] }"`
    }
  }

  ret += isVoidElement ? '/>' : '>';

  if (isVoidElement) return ret;

  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      ret += renderElementVNode2(child);
    })
  }

  ret += `</${ tag }>`;

  return ret;
}

const renderElementVNode3 = (vnode) => {
  const { type: tag, props, children } = vnode;
  const isVoidElement = VOID_TAGS.includes(tag);

  let ret = `<${ tag }`;

  if (props) {
    ret += renderAttrs(props);
  }

  ret += isVoidElement ? '/>' : '>';

  if (isVoidElement) return ret;

  if (typeof children === 'string') {
    ret += children
  } else if (Array.isArray(children)) {
    ret += renderElementVNode3(vnode);
  }

  ret += '>';

  return ret;
}

const renderAttrs = (props) => {
  let ret = ''
  for (let k in props) {
    if (SHOULD_IGNORE_PROPS.includes(k) || /^on[^a-z]/.test(k)) {
      continue
    }

    const v = props[k];
    ret += renderDynamicAttr(k, v);
  }
  return ret;
}

const renderDynamicAttr = (k, v) => {
  if (isBooleanAttr(k)) {
    return v === false ? '' : ` ${ k }`
  } else if (!isSSRSafeAttrName(k)) {
    return v === '' ? ` ${ k }` : ` ${ k }="${ v }"`;
  } else {
    console.warn(
      `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${ k }`
    )
    return '';
  }
}

console.log(renderElementVNode(ElementVNode));

console.log(renderElementVNode2(ElementVNode));

console.log(renderElementVNode3(ElementVNode2))