'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const toDisplayString = (value) => {
    return String(value);
};

const extend = Object.assign;
// 设置一个全局空对象方便后续曲比较
const EMPTY_OBJ = {};
const isObject = (value) => {
    return value !== null && typeof value === 'object';
};
const isString = (value) => {
    return value !== null && typeof value === 'string';
};
const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
};
const getShapeFlag = (type) => {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
};
const hasOwn = (val = {}, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const camelize = (str) => {
    // ex: add-foo
    // _ 代表匹配到的值规则（-f）
    // targetValue 代表匹配到的值（f）
    return str.replace(/-(\w)/g, (_, targetValue) => {
        return targetValue ? targetValue.toUpperCase() : '';
    });
};
// add --> onAdd
const toHandlerKey = (str) => str ? camelize('on' + capitalize(str)) : '';
const getSequence = (arr) => {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        // 元素节点
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        // 组件节点
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 判断是否需要 slots 处理
    // 首先是必须是一个组件类型，其次 children 必须是一个对象
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
};
const createTextVNode = (text) => {
    return createVNode(Text, {}, text);
};

const createAppAPI = (render) => {
    const createApp = (rootComponent) => {
        return {
            mount(rootContainer) {
                // 先转换成虚拟节点
                // component --> vnode
                // 后续所有的逻辑操作 都会基于 vnode 去操作
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
    return createApp;
};

const renderSlots = (slots, slotName, props) => {
    const slot = slots[slotName];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.active = true; // stop 状态
        this.deps = [];
        this._fn = fn;
        this._scheduler = scheduler;
    }
    run() {
        // 会收集依赖
        // shouldTrack 来做区分
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        // 全局变量 reset
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanUpEffect(this);
            this.active = false;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}
const isTracking = () => {
    // 判断是不是 应该 收集依赖 & 有没有全局的 effect
    return shouldTrack && activeEffect !== undefined;
};
const cleanUpEffect = (effect) => {
    effect.deps.map((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
};
const effect = (fn, options = {}) => {
    const { scheduler } = options;
    // 初始化的时候就需要调用一次fn
    const _effect = new ReactiveEffect(fn, scheduler);
    // 将调用 options 中的参数 和 类上同名参数赋值
    // onStop --> onStop
    extend(_effect, options);
    _effect.run();
    // 将传进来的 fn 返回出去
    // bind 以当前的 effect 实例作为函数的 this 指针
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
};
const targetMap = new Map();
const trackEffects = (dep) => {
    // 如果没有 effect 实例直接不做后面的操作
    // if (!activeEffect) return
    // if (!shouldTrack) return
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
const track = (target, key) => {
    if (!isTracking())
        return;
    // target --> key --> dep
    let depsMap = targetMap.get(target);
    // 不存在despMap 先初始化一下
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    // 不存在dep 先初始化一下
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
};
const triggerEffects = (dep) => {
    // 循环调用 dep 的 run 方法 触发每一个 dep 的 _fn
    for (const effect of dep) {
        if (effect._scheduler) {
            effect._scheduler();
        }
        else {
            effect.run();
        }
    }
};
const trigger = (target, key) => {
    // 取出 target 对应的 depsMap
    let depsMap = targetMap.get(target);
    // 取出 key 对应的 dep
    let dep = depsMap.get(key);
    triggerEffects(dep);
};

let get;
let readOnlyGet;
let shallowReadonlyGet;
let set;
const createGetter = (isReadOnly = false, shallow = false) => {
    const get = (target, key) => {
        // target: { foo: 1 }
        // key: foo
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            // 通过 isReadOnly 来判断是不是 reactive 对象
            // return !isReadOnly
            // ？？？
            // 这里是不是可以直接指定为true，因为调用 getter 函数 肯定是 proxy 对象，所以一定是 reactive
            return true;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        // 如果是 shallow 类型(即外层是响应是对象，里面的不是 且设计成只读模式)
        if (shallow) {
            return res;
        }
        if (!isReadOnly) {
            // 依赖收集
            track(target, key);
        }
        // 看看 res 是不是 object
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        return res;
    };
    return get;
};
const createSetter = () => {
    const set = (target, key, value) => {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
    return set;
};
get = createGetter();
readOnlyGet = createGetter(true);
shallowReadonlyGet = createGetter(true, true);
set = createSetter();
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败, 因为 target:`, target, `是 readonly状态!`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const createActiveObject = (raw, baseHandlers) => {
    if (!isObject(raw)) {
        console.warn(`target: ${raw} 必须是一个对象！`);
    }
    else {
        return new Proxy(raw, baseHandlers);
    }
};
const reactive = (raw) => {
    return createActiveObject(raw, mutableHandlers);
};
const readonly = (raw) => {
    return createActiveObject(raw, readonlyHandlers);
};
const shallowReadonly = (raw) => {
    return createActiveObject(raw, shallowReadonlyHandlers);
};

const emit = (instance, eventName, ...args) => {
    const { props } = instance;
    const handlerName = toHandlerKey(eventName);
    const handler = props[handlerName];
    handler && handler(...args);
};

const initProps = (instance, rawProps = {}) => {
    instance.props = rawProps;
};

const initSlots = (instance, children) => {
    const { vnode } = instance;
    // 如果是 slot 类型 再进行处理
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
};
const normalizeObjectSlots = (slots, children) => {
    for (const key in children) {
        const slotVal = children[key];
        // 将设计的 props 传入对应的 slot
        slots[key] = (props) => normalizeSlotValue(slotVal(props));
    }
    slots = slots;
};
const normalizeSlotValue = (value) => {
    // 传入的 children（slots） 是不是数组，不是数组转换一下
    return Array.isArray(value) ? value : [value];
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const publickInstanceProxyhandlers = {
    get({ _: instance }, key) {
        // setupState
        // 这里必须要在这里 获取 setupState
        // 因为 只有在初始化组件 的时候 获取 setupState
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            // setupState 里面获取值
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // $el
        // if (key === '$el') {
        // 	// key --> $el
        // 	// 如果是 this.$el 则 key 值就是 $el
        // 	return vnode.el
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        // value 如果是对象 要用 reactive 转换成响应式对象
        this._rawValue = value;
        this._value = covert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            // 一定先修改值，再触发\
            this._rawValue = newValue;
            this._value = covert(newValue);
            triggerEffects(this.dep);
        }
    }
}
const covert = (value) => {
    return isObject(value) ? reactive(value) : value;
};
const trackRefValue = (ref) => {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
};
const ref = (value) => {
    return new RefImpl(value);
};
const isRef = (ref) => {
    return !!ref.__v_isRef;
};
const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref;
};
const proxyRefs = (objectWithRefs) => {
    // 如果获取的值 是 ref 类型 那么就返回 .value
    // 如果获取的值 不是 ref 那么就直接返回 它本身的值
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 看看是 是 ref 类型 是的话修改 .value
            // 看看是 不是 ref 类型 是的话修改 本身的值
            if (isRef(target[key]) && !isRef(value)) {
                return Reflect.set(target[key], 'value', value);
                // return target[key].value = value
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
};

let currentInstance;
const createComponentInstance = (vnode, parent) => {
    const component = {
        vnode,
        type: vnode.type,
        props: {},
        emit: {},
        slots: {},
        next: null,
        setupState: {},
        parent,
        // parent,
        provides: parent ? parent.provides : {},
        isMounted: false,
        subTree: {}
    };
    component.emit = emit.bind(null, component);
    return component;
};
const setupComponent = (instance) => {
    // initProps
    initProps(instance, instance.vnode.props);
    // initSlot
    initSlots(instance, instance.vnode.children);
    // initComponent
    setupStatefulComponent(instance);
};
const setupStatefulComponent = (instance) => {
    const Component = instance.type;
    const { setup } = Component;
    // ctx
    instance.proxy = new Proxy({
        _: instance
    }, publickInstanceProxyhandlers);
    // 用户可能不会写 setup 函数
    if (setup) {
        // 初始化获取 instance
        setCurrentInstance(instance);
        // 可以返回一个 fn 也可能是一个 object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
        // 重制获取 instance
        setCurrentInstance(null);
    }
};
const handleSetupResult = (instance, setupResult) => {
    // function or object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    // 初始化 render 函数
    finishCompentSetup(instance);
};
const finishCompentSetup = (instance) => {
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
};
const getCurrentInstance = () => {
    return currentInstance;
};
const setCurrentInstance = (instance) => {
    currentInstance = instance;
};
let compiler;
const registerRuntimeCompiler = (_compiler) => {
    compiler = _compiler;
};

const provide = (key, value) => {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // init
        // 只需要初始化的时候 执行一次
        // 当初始化完成以后实例的 provides 肯定是和父级的 provides相等
        // 调用过过 provide 以后 当前实例的 provides 肯定和父级不一样（因为有赋值操作）
        if (provides === parentProvides) {
            // 将当前 provide 实例的原型指向父级
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
};
const inject = (key, defaultVal) => {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        const parentProvides = parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === 'function') {
                return defaultVal();
            }
            return defaultVal;
        }
    }
};

const shouldUpdateComponent = (prevVNode, nextVNode) => {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
};

const queue = [];
// 用来标识是否需要 执行 创建 promise
let isFlushPending = false;
const queueJobs = (job) => {
    // 如果队列中没有 该 任务
    if (!queue.includes(job)) {
        queue.push(job);
    }
    // 创建一个 promise 去接收
    queueFlush();
};
const queueFlush = () => {
    if (isFlushPending) {
        return;
    }
    isFlushPending = true;
    nextTick(() => {
        flushJobs();
    });
};
const flushJobs = () => {
    // 执行完 微任务以后在将开关打开。
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
};
const p = Promise.resolve();
const nextTick = (fn) => {
    // 如果用户传入 nextTick 的回调函数，则执行
    // 否则，执行 Promise.resolve 的回调函数
    return fn ? p.then(fn) : p;
};

// custom render
const createRender = (options) => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    // Component
    const processComponent = (n1, n2, container, parentComponent, anchor) => {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    };
    const updateComponent = (n1, n2) => {
        const instance = n2.component = n1.component;
        // 如果 props 完全相同 则不需要更新
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    };
    const mountComponent = (initinalVNode, container, parentComponent, anchor) => {
        const instance = initinalVNode.component = createComponentInstance(initinalVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initinalVNode, container, anchor);
    };
    const mountChildren = (children, container, parentComponent, anchor) => {
        // 遍历 children 拿到节点 再次调用patch
        children.map(childrenItem => {
            patch(null, childrenItem, container, parentComponent, anchor);
        });
    };
    // Element
    const processElement = (n1, n2, container, parentComponent, anchor) => {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, parentComponent, anchor);
        }
    };
    const patchElement = (n1, n2, parentComponent, anchor) => {
        // console.log('patchElement')
        // console.log('n1', n1)
        // console.log('n2', n2)
        // props 修改 有以下几种情况：
        // 1.之前属性的值和现在的值不一样了          --> 修改
        // 2.之前属性的值变成 undefined 或者 null  --> 删除
        // 3.之前属性的值 现在没有了               --> 删除
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 当 第二次 patchElement 时 第一次的 n2 应该当作 第二次的 n1 去使用
        // 但是 n2 上并不存在 el 所以此处应当赋值以便于第二次调用。
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
        // children 修改有以下几种情况
        // text --> text
        // text --> array
        // array --> array
        // array --> text
        patchChildren(n1, n2, el, parentComponent, anchor);
    };
    const patchProps = (el, oldProps, newProps) => {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    // 不相等的时候更新
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            // 不等与空对象 才会去对比
            // 不能直接 rops !== {} 这个相当于创建了一个新的内存地址 所以这个判断一定是 true
            if (oldProps !== EMPTY_OBJ) {
                // 如果新设置的props 在原来的 props中不存在 则直接删除掉。
                for (const key in oldProps) {
                    const prevProp = oldProps[key];
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, prevProp, null);
                    }
                }
            }
        }
    };
    const patchChildren = (n1, n2, container, parentComponent, anchor) => {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const prevChildren = n1.children;
        const nextChildren = n2.children;
        if (nextShapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 老的是 array & 新的是 text
                // 1.把老的 children 清空
                unmountChildren(n1.children);
                // 2.设置 text
                // hostSetElementText(container, nextChildren)
            }
            // 老的是 text & 新的是 text
            if (prevChildren !== nextChildren) {
                hostSetElementText(container, nextChildren);
            }
        }
        else {
            // 老的是 array & 新的是 text
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                // 1.把老的 text 清空
                hostSetElementText(container, '');
                mountChildren(nextChildren, container, parentComponent, anchor);
            }
            else {
                // 老的是 array 新的也是 array
                patchKeyedChildren(prevChildren, nextChildren, container, parentComponent, anchor);
            }
        }
    };
    const patchKeyedChildren = (c1, c2, container, parentComponent, parentAnchor) => {
        let i = 0;
        let l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // i 标识双端对比的相同部分的下标
        // e1 e2 分别表示 原数据 和现数据 末尾端 的下标
        // ------> 左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            // 相等的时候 每次移动指针 i
            i++;
        }
        // ------> 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            // 新的比老的多 需要创建
            // 左侧右侧 都有效果
            if (i <= e2) {
                const nextPos = e2 + 1;
                // const anchor = e2 + 1 >= l2 ? null : c2[nextPos].el
                const anchor = e2 + 1 < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    // 一定记得移动 指针 否则会死循环。
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 新的比老的少 需要删除
            // 左侧右侧 都有效果
            while (i <= e1) {
                // remove
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 乱序部分 中间对比
            let s1 = i;
            let s2 = i;
            // a,b,(c,e,d),f,g
            // a,b,(e,c),f,g
            // 设定一个值来判断是不是所有的 新数据 中的 数据都比较完了，用来剔除就数据比新数据多，即（去掉这里的 d）。
            // 此处是索引需要 +1
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            // 是否需要移动
            let moved = false;
            let maxNewIndexSoFar = 0;
            // 建立一个 key 映射表
            const keyToNewIndexMap = new Map();
            // 最长递增子序列
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            let newIndex;
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                // 如果 所有新的不同节点都已经 patch 完毕
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                // 如果用户设置了 key 值
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            // 如果存在表示找到的原来的节点对应的映射，直接跳出
                            newIndex = j;
                            break;
                        }
                    }
                }
                //
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log('移动位置');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
    const isSameVNodeType = (n1, n2) => {
        // type key 两个东西去判断是不是想等
        return n1.type === n2.type && n1.key === n2.key;
    };
    const unmountChildren = (children) => {
        children.map(item => {
            const el = item.el;
            // remove
            hostRemove(el);
        });
    };
    const mountElement = (vnode, container, parentComponent, anchor) => {
        // vnode --> element 类型的 --> div
        const el = vnode.el = hostCreateElement(vnode.type);
        // children 可能是 string  array
        const { children, props, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // props
        for (const key in props) {
            let val;
            if (Array.isArray(props[key])) {
                val = props[key].join(' ');
            }
            else {
                val = props[key];
            }
            hostPatchProp(el, key, null, val);
        }
        // 挂载在页面上
        hostInsert(el, container, anchor);
    };
    //  Fragment
    const processFragment = (n1, n2, container, parentComponent, anchor) => {
        mountChildren(n2.children, container, parentComponent, anchor);
    };
    // Text
    const processText = (n1, n2, container) => {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    };
    const render = (vnode, container) => {
        patch(null, vnode, container, null, null);
    };
    const patch = (n1, n2, container, parentComponent, anchor) => {
        // 判断一下 vnode 类型
        // 调用对应的方法去处理
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    };
    const setupRenderEffect = (instance, initinalVNode, container, anchor) => {
        // 利用 effect 做依赖收集
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // 这里传递的 第一个 proxy 是组件实例this，第二个 proxy 是当做组件的参数，方便 render 函数中调用 ctx.xxx
                // 这里是方便组件内部调用 获取 ctx 的操作
                // 后续可能还有很多参数 (_cache, $props, $setup, $data, $options)
                const subTree = instance.subTree = instance.render.call(proxy, proxy);
                // vnode --> patch
                // vnode --> element --> mount
                patch(null, subTree, container, instance, anchor);
                initinalVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 这里 在更新的时候还需要更新组件的 props
                // 需要 更新完成以后的 vnode
                // vnode: 更新之前的 虚拟节点
                // next: 下次要更新的 虚拟节点
                const { next, vnode } = instance;
                if (next) {
                    // 更新 el
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const prevSubTree = instance.subTree;
                // 这里传递的 第一个 proxy 是组件实例this，第二个 proxy 是当做组件的参数，方便 render 函数中调用 ctx.xxx
                // 这里是方便组件内部调用 获取 ctx 的操作
                // 后续可能还有很多参数 (_cache, $props, $setup, $data, $options)
                const subTree = instance.subTree = instance.render.call(proxy, proxy);
                // vnode --> patch
                // vnode --> element --> mount
                patch(prevSubTree, subTree, container, instance, anchor);
                initinalVNode.el = subTree.el;
                instance.isMounted = true;
            }
        }, {
            // 优化 不需要每次更新数据都去执行 effect 收集的依赖。
            scheduler: () => {
                // 建立一个 微任务去 等待数据完成在执行回调。
                queueJobs(instance.update);
            }
        });
    };
    return {
        createApp: createAppAPI(render)
    };
};
const updateComponentPreRender = (instance, nextVNode) => {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
};

const createElement = (type) => {
    return document.createElement(type);
};
const patchProp = (el, key, prevVal, nextVal) => {
    // 实现注册 事件
    const isOn = key => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, nextVal);
    }
    else {
        // 如果设置值为 undefined 或者 null 的时候删除掉该属性
        if (nextVal == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
};
const insert = (child, parent, anchor = null) => {
    // parent.append(child)
    parent.insertBefore(child, anchor);
};
const remove = (children) => {
    const parent = children.parentNode;
    if (parent) {
        parent.removeChild(children);
    }
};
const setElementText = (el, text) => {
    el.textContent = text;
};
const render = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
const createApp = (...args) => {
    return render.createApp(...args);
};

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createElement: createElement,
    patchProp: patchProp,
    insert: insert,
    render: render,
    createApp: createApp,
    createAppAPI: createAppAPI,
    renderSlots: renderSlots,
    h: h,
    createElementVNode: createVNode,
    createVNode: createVNode,
    createTextVNode: createTextVNode,
    Fragment: Fragment,
    Text: Text,
    createComponentInstance: createComponentInstance,
    setupComponent: setupComponent,
    setupStatefulComponent: setupStatefulComponent,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRender: createRender,
    queueJobs: queueJobs,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    extend: extend,
    EMPTY_OBJ: EMPTY_OBJ,
    isObject: isObject,
    isString: isString,
    hasChanged: hasChanged,
    getShapeFlag: getShapeFlag,
    hasOwn: hasOwn,
    camelize: camelize,
    toHandlerKey: toHandlerKey,
    getSequence: getSequence
});

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('ctreateElementVNode');
const helperMapName = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

const generate = (ast) => {
    const context = createCodegenContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    push('return ');
    const functionName = 'render';
    const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options'];
    const signature = args.join(', ');
    push(`function ${functionName} (${signature}) { `);
    push('return ');
    genNode(ast.codegenNode, context);
    push(' }');
    return {
        code: context.code
    };
};
const genNodeList = (nodes, context) => {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(', ');
        }
    }
};
const genNode = (node, context) => {
    // 获取 ast的入口，在外部处理内容。
    // 区分一下类型
    switch (node.type) {
        case 3 /* TEXT */:
            genText(node, context);
            break;
        case 0 /* INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
};
const createCodegenContext = () => {
    const context = {
        code: '',
        push(source) {
            context.code += source;
        },
        getHelperName(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
};
const genFunctionPreamble = (ast, context) => {
    const { push } = context;
    const VueBinging = 'vue';
    const aliasHelpers = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelpers).join(', ')} } = ${VueBinging}`);
    }
    push('\n');
};
const genText = (node, context) => {
    const { push } = context;
    push(`'${node.content}'`);
};
const genInterpolation = (node, context) => {
    const { push, getHelperName } = context;
    push(`${getHelperName(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(`)`);
};
const genExpression = (node, context) => {
    const { push } = context;
    push(node.content);
};
const genElement = (node, context) => {
    const { push, getHelperName } = context;
    const { tag, children, props } = node;
    push(`${getHelperName(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(getNullAble([tag, props, children]), context);
    // genNode(children, context)
    // push(')')
};
const genCompoundExpression = (node, context) => {
    const { push } = context;
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
    push(')');
};
const getNullAble = (arg) => {
    return arg.map(item => item || 'null');
};

const interpolationOpenDelimiter = '{{';
const interpolationCloseDelimiter = '}}';
const ElementCloseDelimiter = '<';
const baseParse = (content) => {
    const context = createparserContent(content);
    // 初始化的时候 标签数组 传递一个 []
    return createRoot(parserChildren(context, []));
};
const parserChildren = (context, ancestors) => {
    const nodes = [];
    // 循环解析 字符串。
    while (!isEnd(context, ancestors)) {
        let node;
        const source = context.source;
        // 字符串是以 {{ 开头的才需要处理
        if (source.startsWith(interpolationOpenDelimiter)) {
            // 插值
            node = parseInterpolation(context);
        }
        else if (source.startsWith(ElementCloseDelimiter)) { // source[0] === '<'
            // element
            if (/[a-z]/i.test(source[1])) {
                node = parserElement(context, ancestors);
            }
        }
        // 如果前面的的两个判断都没有命中，表示是文本。
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
};
const isEnd = (context, ancestors) => {
    // 1.当遇到结束标签的时候
    const source = context.source;
    if (source.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startWithEndTagOpen(source, tag)) {
                return true;
            }
        }
    }
    // 2.context.source 有值的时候
    return !context.source;
};
const createRoot = (children) => {
    return {
        children,
        type: 4 /* ROOT */
    };
};
const createparserContent = (content) => {
    return {
        source: content
    };
};
const advanceBy = (context, length) => {
    context.source = context.source.slice(length);
};
// 插值
const parseInterpolation = (context) => {
    // {{ message }} ---> 拿到这个 message
    // 从第二个字符位置开始查找， 到 '}}' 结束
    const closeIndex = context.source.indexOf(interpolationCloseDelimiter, interpolationOpenDelimiter.length);
    // 去掉 前面的 '{{'
    advanceBy(context, interpolationCloseDelimiter.length);
    const rawContentLength = closeIndex - interpolationOpenDelimiter.length;
    // 可能存在空格 trim去掉~
    // const rawContent = context.source.slice(0, rawContentLength)
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, interpolationCloseDelimiter.length);
    //
    // TODO 思考 上面的逻辑 可以使用 slice(2, -2) 来直接获取吗？
    // context.source = context.source.slice(2, -2)
    // const content = context.source.slice(interpolationOpenDelimiter.length, -interpolationCloseDelimiter.length).trim()
    return {
        type: 0 /* INTERPOLATION */,
        content: {
            type: 1 /* SIMPLE_EXPRESSION */,
            content
        }
    };
};
// element
// 在调用 parserElement 的时候，使用栈的 先进后出特性，把 element push进去
// 之后在完成解析以后取出，比较标签有没有闭合。
const parserElement = (context, ancestors) => {
    // 这里需要调用两次！！！切记 开始标签匹配一次
    const element = parserTag(context, 0 /* Start */);
    ancestors.push(element);
    element.children = parserChildren(context, ancestors);
    ancestors.pop();
    // 这里需要判断标签是不是匹配，如果匹配才能销毁，或者删掉。
    if (startWithEndTagOpen(context.source, element.tag)) {
        // 结束标签匹配一次！！！
        parserTag(context, 1 /* End */);
    }
    else {
        throw new Error(`缺少结束标签: ${element.tag}`);
    }
    return element;
};
const startWithEndTagOpen = (source, tag) => {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
};
const parserTag = (context, type) => {
    // 1.解析 tag
    // <div />
    // <div></div>
    // 匹配以 < 开头或者以 </ 开头的 字符，/ 可以没有。
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    // 2.删除处理完成的代码
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === 1 /* End */) {
        // 如果是结束标签 (</div>) 直接不用返回 后面的东西了。
        return;
    }
    return {
        type: 2 /* ELEMENT */,
        tag
    };
};
// text 文本类型
const parseText = (context) => {
    let endTokens = ['{{', '<'];
    let endIndex = context.source.length;
    // 遇到 {{ 或者 < 都应该直接停下，返回了
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        // 当 字符串中 存在 {{ 表示是文本和 插值混合的。
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    // 1. 获取content
    const content = parseTextData(context, endIndex);
    return {
        type: 3 /* TEXT */,
        content
    };
};
const parseTextData = (context, length) => {
    const content = context.source.slice(0, length);
    // 2. 推进
    advanceBy(context, length);
    return content;
};

const transform = (root, options = {}) => {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
};
const createRootCodegen = (root) => {
    const child = root.children[0];
    if (child.type === 2 /* ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
};
const traverseNode = (node, context) => {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit) {
            exitFns.push(onExit);
        }
    }
    // 这里需要 分情况处理不同类型的逻辑
    switch (node.type) {
        // 插值类型
        case 0 /* INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        // root 根结点
        case 4 /* ROOT */:
        case 2 /* ELEMENT */:
            // 处理 children
            traverseChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
};
const createTransformContext = (root, options) => {
    const context = {
        root,
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
        nodeTransforms: options.nodeTransforms || []
    };
    return context;
};
const traverseChildren = (node, context) => {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
};

const createVNodeCall = (context, tag, props, children) => {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* ELEMENT */,
        tag,
        props,
        children
    };
};

const transformElement = (node, context) => {
    return () => {
        if (node.type === 2 /* ELEMENT */) {
            // 以下中间处理层，处理一下数据～
            // tag
            const vnodeTag = `'${node.tag}'`;
            // props
            let vnodeProps;
            let vnodeChild = node.children[0];
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChild);
        }
    };
};

const transformExpression = (node) => {
    if (node.type === 0 /* INTERPOLATION */) {
        processExpression(node.content);
    }
};
const processExpression = (node) => {
    node.content = `_ctx.${node.content}`;
};

const isText = (node) => {
    return (node.type === 3 /* TEXT */ || node.type === 0 /* INTERPOLATION */);
};

const transformText = (node) => {
    return () => {
        const { children } = node;
        let currentContainer;
        if (node.type === 2 /* ELEMENT */) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const nextChild = children[j];
                        if (isText(nextChild)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(' + ');
                            currentContainer.children.push(nextChild);
                            // 添加完成的 元素需要去掉
                            children.splice(j, 1);
                            // 删除以后后面的元素前移，导致取错，--即可
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        }
    };
};

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
}

// mini-vue 出口
function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function('vue', code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.EMPTY_OBJ = EMPTY_OBJ;
exports.Fragment = Fragment;
exports.Text = Text;
exports.camelize = camelize;
exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createComponentInstance = createComponentInstance;
exports.createElement = createElement;
exports.createElementVNode = createVNode;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.extend = extend;
exports.getCurrentInstance = getCurrentInstance;
exports.getSequence = getSequence;
exports.getShapeFlag = getShapeFlag;
exports.h = h;
exports.hasChanged = hasChanged;
exports.hasOwn = hasOwn;
exports.inject = inject;
exports.insert = insert;
exports.isObject = isObject;
exports.isRef = isRef;
exports.isString = isString;
exports.nextTick = nextTick;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.queueJobs = queueJobs;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.render = render;
exports.renderSlots = renderSlots;
exports.setupComponent = setupComponent;
exports.setupStatefulComponent = setupStatefulComponent;
exports.toDisplayString = toDisplayString;
exports.toHandlerKey = toHandlerKey;
exports.unRef = unRef;
