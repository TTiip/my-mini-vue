var createComponentInstance = function (vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type
    };
    return component;
};
var setupComponent = function (instance) {
    // TODO initProps
    // TODO initSlot
    //
    setupStatefulComponent(instance);
};
var setupStatefulComponent = function (instance) {
    var Component = instance.type;
    var setup = Component.setup;
    // 用户可能不会写 setup 函数
    if (setup) {
        // 可以返回一个 fn 也可能是一个 object
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
};
var handleSetupResult = function (instance, setupResult) {
    // function or object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // 初始化 render 函数
    finishCompentSetup(instance);
};
var finishCompentSetup = function (instance) {
    var Component = instance.type;
    var render = Component.render;
    // render 存在时赋值
    if (render) {
        instance.render = render;
    }
};

var render = function (vnode, container) {
    // patch
    patch(vnode);
};
var patch = function (vnode, container) {
    // 去处理我们的组件
    // TODO 判断一下 vnode 是不是 element 类型
    // 调用对应的方法去处理对应的 方法
    // processElement()
    processComponent(vnode);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode);
};
var mountComponent = function (vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
};
var setupRenderEffect = function (instance, container) {
    var subTree = instance.render();
    // vnode --> patch
    // vnode --> element --> mount
    patch(subTree);
};

var createVNode = function (type, props, children) {
    return {
        type: type,
        props: props,
        children: children
    };
};

var createApp = function (rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先转换成虚拟节点
            // component --> vnode
            // 后续所有的逻辑操作 都会基于 vnode 去操作
            var vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
};

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

export { createApp, h };
