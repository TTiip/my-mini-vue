'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var createNode = function (type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null
    };
    return vnode;
};

var publicPropertiesMap = {
    $el: function (instance) { return instance.vnode.el; }
};
var PublicInstanceProxyhandle = {
    get: function (_a, key) {
        var instance = _a._;
        // setupState 部分
        // setupState 里面去获取值
        var setupState = instance.setupState; instance.vnode;
        if (key in setupState) {
            return setupState[key];
        }
        // 如果去找你对应的 key 则表示存在对应的属性 直接调用方法获取值
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
};
var setupComponent = function (instance) {
    // Todo
    // initProps
    // initSlots
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    // 封装暴露 ctx
    // 方便 后续调用获取值，通过代理去 返回值
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyhandle);
    var setup = Component.setup;
    // 如果用户写了 setup
    if (setup) {
        // function 或者 object
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
};
var handleSetupResult = function (instance, setupResult) {
    // Todo function
    if (typeof setupResult === 'object') {
        // 如果是对象则直接赋值
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
};
var finishComponentSetup = function (instance) {
    // 先判断 组件上有没有render
    var Component = instance.type;
    instance.render = Component.render;
    // if (Component.render) {
    // 	instance.render = Component.render
    // }
};

var render = function (vnode, container) {
    //  patch -> 方便数据的处理
    patch(vnode, container);
};
var patch = function (vnode, container) {
    // 去处理组件
    // 判断 是不是 element
    // 如果是 element 那么应该处理 element
    // 如果是 component 就处理 component
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (typeof vnode.type === 'object') {
        processComponent(vnode, container);
    }
};
var processElement = function (vnode, container) {
    mountElemnt(vnode, container);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode, container);
};
var mountElemnt = function (vnode, container) {
    var type = vnode.type, children = vnode.children, props = vnode.props;
    // 此处的 虚拟节点 是数据 element 类型
    var el = (vnode.el = document.createElement(type));
    // 内容 string 或者 array
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // 处理 props
    for (var key in props) {
        var val = props[key];
        if ((key === 'class' || key === 'id') && Array.isArray(props[key])) {
            // 如果是 calss、id 且是一个 class、id 数组 则循环调用 添加class
            el.setAttribute(key, val.join(' '));
        }
        else {
            // 除去 class 和 id 且都是数据的情况 其他属性 直接赋值。
            el.setAttribute(key, val);
        }
    }
    container.append(el);
};
var mountChildren = function (vnode, container) {
    vnode.children.map(function (item) {
        patch(item, container);
    });
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
};
var setupRenderEffect = function (instance, vnode, container) {
    var proxy = instance.proxy;
    // 虚拟节点树
    // 通过call方法 改变this指向为proxy，在使用代理获取对应的值
    var subTree = instance.render.call(proxy);
    // vnode -> patch
    patch(subTree, container);
    // element --> mount
    // 在 element 子节点 全部处理完成以后
    vnode.el = subTree.el;
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先 转换成 VNode
            // component --> vNode
            // 所有逻辑操作 都会基于 VNode 做操作
            var vnode = createNode(rootComponent);
            // 渲染
            render(vnode, rootContainer);
        }
    };
};

var h = function (type, props, children) {
    var vnode = createNode(type, props, children);
    return vnode;
};

exports.createApp = createApp;
exports.h = h;
