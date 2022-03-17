'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
// 设置一个全局空对象方便后续曲比较
const EMPTY_OBJ = {};
const isObject = (value) => {
    return value !== null && typeof value === 'object';
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
    const get = (target, key, value) => {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
    return get;
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
    $slots: (i) => i.slots
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
        setupState: {},
        parent,
        // parent,
        provides: parent ? parent.provides : {},
        insMounted: false,
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
    const { render } = Component;
    // render 存在时赋值
    if (render) {
        instance.render = render;
    }
};
const getCurrentInstance = () => {
    return currentInstance;
};
const setCurrentInstance = (instance) => {
    currentInstance = instance;
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

// custom render
const createRender = (options) => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    // Component
    const processComponent = (n1, n2, container, parentComponent, anchor) => {
        mountComponent(n2, container, parentComponent, anchor);
    };
    const mountComponent = (initinalVNode, container, parentComponent, anchor) => {
        const instance = createComponentInstance(initinalVNode, parentComponent);
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
        console.log('i', i);
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
                    for (let j = s2; j < e2; j++) {
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
        effect(() => {
            if (!instance.insMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                // vnode --> patch
                // vnode --> element --> mount
                patch(null, subTree, container, instance, anchor);
                initinalVNode.el = subTree.el;
                instance.insMounted = true;
            }
            else {
                const { proxy } = instance;
                const prevSubTree = instance.subTree;
                const subTree = instance.subTree = instance.render.call(proxy);
                // vnode --> patch
                // vnode --> element --> mount
                patch(prevSubTree, subTree, container, instance, anchor);
                initinalVNode.el = subTree.el;
                instance.insMounted = true;
            }
        });
    };
    return {
        createApp: createAppAPI(render)
    };
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

exports.Fragment = Fragment;
exports.Text = Text;
exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createComponentInstance = createComponentInstance;
exports.createElement = createElement;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.isRef = isRef;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.render = render;
exports.renderSlots = renderSlots;
exports.setupComponent = setupComponent;
exports.setupStatefulComponent = setupStatefulComponent;
exports.unRef = unRef;
