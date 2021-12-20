/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-15 17:55:45
 * @LastEditTime: 2021-12-20 10:57:00
 * @LastEditors: changqing
 * @Usage:
 */
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (value, key) => hasOwnProperty.call(value, key);
/*
let r = ShapeFlags.ELEMENT | ShapeFlags.FUNCTIONAL_COMPONENT; // r包含元素和函数式组件
// 我们像看r 是不是元素
(r & ShapeFlags.ELEMENT) > 0; // 说明包含元素
(r & ShapeFlags.FUNCTIONAL_COMPONENT) > 0
*/
// 二进制  00000100  位移  | & 是做权限必备的一个操作 
// | 来组合权限 & 来判断是否包含某个权限
//   001 |  010 => 011  =3    011 & 001 = 001   011 & 010 => 010   011 & 100  -> 000
// 001
// 010
// 100

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 22:17:44
 * @LastEditTime: 2021-12-20 11:11:02
 * @LastEditors: changqing
 * @Usage:
 */
function createVNode(type, props, children = null) {
    // 虚拟节点就是 用一个对象来描述信息的  
    // & | 
    const shapeFlag = isObject(type) ?
        6 /* COMPONENT */ :
        isString(type) ?
            1 /* ELEMENT */ :
            0;
    const vnode = {
        __v_isVNode: true,
        type,
        shapeFlag,
        props,
        children,
        key: props && props.key,
        component: null,
        el: null, // 虚拟节点对应的真实节点
    };
    if (children) {
        // 告诉此节点 是什么样的儿子 
        // 稍后渲染虚拟节点的时候 可以判断儿子是数组 就循环渲染
        vnode.shapeFlag = vnode.shapeFlag | (isString(children) ? 8 /* TEXT_CHILDREN */ : 16 /* ARRAY_CHILDREN */);
    }
    // vnode 就可以描述出来 当前他是一个什么样的节点 儿子是什么样的
    return vnode; // createApp(App)
}
function isVNode(vnode) {
    return !!vnode.__v_isVNode;
}
const Text = Symbol();
function normalizeVNode(vnode) {
    if (isObject(vnode)) {
        return vnode;
    }
    return createVNode(Text, null, String(vnode));
}
function isSameVNodeType(n1, n2) {
    // 比较类型是否一致 比较key是否一致
    return n1.type === n2.type && n1.key === n2.key;
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-20 11:16:18
 * @LastEditTime: 2021-12-20 11:16:19
 * @LastEditors: changqing
 * @Usage:
 */
function h(type, propsOrChildren, children) {
    // 写法1.  h('div',{color:red})
    // 写法2.  h('div',h('span'))
    // 写法3   h('div','hello')
    // 写法4：  h('div',['hello','hello'])
    let l = arguments.length;
    if (l === 2) {
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]); //  h('div',h('span'))
            }
            return createVNode(type, propsOrChildren); //  h('div',{color:red})
        }
        else {
            return createVNode(type, null, propsOrChildren); // h('div','hello')   h('div',['hello','hello'])
        }
    }
    else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
    // h('div',{},'孩子')
    // h('div',{},['孩子','孩子','孩子'])
    // h('div',{},[h('span'),h('span'),h('span')])
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 15:34:57
 * @LastEditTime: 2021-12-18 16:09:05
 * @LastEditors: changqing
 * @Usage:
 */
// effect1(()=>{
//     state.name
//     effect2(()=>{
//         state.age;
//     })
//     state.address
// })
// effectStack = [effect1] activeEffect = effect1
// effect1 -> name
// effectStack = [effect1，effect2] activeEffect = effect2
// effect2 -> age
// effectStack = [effect1] activeEffect = effect1
// effect1 -> address
let effectStack = []; // 目的就是为了能保证我们effect执行的时候 可以存储正确的关系
let activeEffect;
function cleanupEffect(effect) {
    const { deps } = effect;
    for (let dep of deps) {
        // set 删除effect 让属性 删除掉对应的effect   name = []
        dep.delete(effect); // 让属性对应的effect移除掉，这样属性更新的时候 就不会触发这个effect重新执行了
    }
}
// 属性变化 触发的是 dep -> effect
// effect.deps = [] 和属性是没关系的
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true; // this.active = true;
        this.deps = []; // 让effect 记录他依赖了哪些属性 ， 同时要记录当前属性依赖了哪个effect
    }
    run() {
        if (!this.active) { // 稍后如果非激活状态 调用run方法 默认会执行fn函数
            return this.fn();
        }
        if (!effectStack.includes(this)) { // 屏蔽同一个effect会多次执行
            try {
                effectStack.push(activeEffect = this);
                return this.fn(); // 取值  new Proxy 会执行get方法  (依赖收集)
            }
            finally {
                effectStack.pop(); // 删除最后一个
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
        }
    }
}
// obj name :[effect]
//     age : [effect]
// {对象：{属性 ： [effect,effect]}  } 
function isTracking() {
    return activeEffect !== undefined;
}
const targetMap = new WeakMap();
function track(target, key) {
    // 是只要取值我就要收集吗？不是
    if (!isTracking()) { // 如果这个属性 不依赖于effect直接跳出即可
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map())); // {对象：map{}}
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set())); // {对象：map{name:set[]}}
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    let shouldTrack = !dep.has(activeEffect); // 看一下这个属性有没有存过这个effect
    if (shouldTrack) {
        dep.add(activeEffect); // // {对象：map{name:set[effect,effect]}}
        activeEffect.deps.push(dep); // 稍后用到
    } // { 对象：{name:set,age:set}
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return; // 属性修改的属性 根本没有依赖任何的effect
    let deps = []; // [set ,set ]
    if (key !== undefined) {
        deps.push(depsMap.get(key));
    }
    let effects = [];
    for (const dep of deps) {
        effects.push(...dep);
    }
    triggerEffects(effects);
}
function triggerEffects(dep) {
    for (const effect of dep) { // 如果当前effect执行 和 要执行的effect是同一个，不要执行了 防止循环
        if (effect !== activeEffect) {
            if (effect.scheduler) {
                return effect.scheduler();
            }
            effect.run(); // 执行effect
        }
    }
}
function effect(fn) {
    const _effect = new ReactiveEffect(fn);
    _effect.run(); // 会默认让fn执行一次
    let runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 给runner添加一个effect实现 就是 effect实例
    return runner;
}
// vue3 的响应式原理  取值时 收集对应的effect， 改值时找到对应的effect执行

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-17 11:07:14
 * @LastEditTime: 2021-12-18 16:16:05
 * @LastEditors: changqing
 * @Usage:
 */
const mutableHandlers = {
    get(target, key, recevier) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return true;
        }
        // 这里取值了， 可以收集他在哪个effect中
        track(target, key);
        const res = Reflect.get(target, key, recevier); // target[key]
        return res;
    },
    set(target, key, value, recevier) {
        let oldValue = target[key];
        const res = Reflect.set(target, key, value, recevier); // target[key] = value
        // 如果改变值了， 可以在这里触发effect更新
        if (oldValue !== value) { // 值不发生变化 effect不需要重新执行
            trigger(target, key); // 找属性对应的effect让她重新执行
        }
        return res;
    }
};
// map和weakMap的区别
const reactiveMap = new WeakMap(); // weakmap 弱引用   key必须是对象，如果key没有被引用可以被自动销毁
function createReactiveObject(target) {
    // 先默认认为这个target已经是代理过的属性了
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
        return target;
    }
    // reactiveApi 只针对对象才可以 
    if (!isObject(target)) {
        return target;
    }
    const exisitingProxy = reactiveMap.get(target); // 如果缓存中有 直接使用上次代理的结果
    if (exisitingProxy) {
        return exisitingProxy;
    }
    const proxy = new Proxy(target, mutableHandlers); // 当用户获取属性 或者更改属性的时候 我能劫持到
    reactiveMap.set(target, proxy); // 将原对象和生成的代理对象 做一个映射表
    return proxy; // 返回代理
}
function reactive(target) {
    return createReactiveObject(target);
}
function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}
// readonly shallowReactive shallowReadnly 
// export function readonly(){
// }
// export function shallowReactive(){
// }
// export function shallowReadnly(){
// }

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 16:19:54
 * @LastEditTime: 2021-12-18 16:19:54
 * @LastEditors: changqing
 * @Usage:
 */
class ComputedRefImpl {
    constructor(getter, setter) {
        this.setter = setter;
        this._dirty = true; // this._dirty = true;
        this.__v_isRef = true;
        // 这里将计算属性包成一个effect
        // 这里 我给计算属性变成了effect ，那么计算属性中的属性会收集这个effect
        this.effect = new ReactiveEffect(getter, () => {
            // 稍后计算属性依赖的值变化 不要重新执行计算属性的effect，而是调用此函数
            if (!this._dirty) {
                this._dirty = true;
                triggerEffects(this.dep);
            }
        });
    }
    get value() {
        if (isTracking()) { // 是否是在effect中取值的
            trackEffects(this.dep || (this.dep = new Set));
        }
        if (this._dirty) {
            // 将结果缓存到this._value 这样就不用每次都run了
            this._value = this.effect.run();
            this._dirty = false;
        }
        return this._value;
    }
    set value(newValue) {
        this.setter(newValue); // 如果修改计算属性的值 就触发你自己的set方法
    }
}
function computed(getterOrOptions) {
    const onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => { };
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 16:43:46
 * @LastEditTime: 2021-12-18 16:48:58
 * @LastEditors: changqing
 * @Usage:
 */
class RefImpl {
    constructor(_rawValue) {
        this._rawValue = _rawValue;
        // _rawValue如果用户传进来的值 是一个对象 我需要将对象转化成响应式
        this._value = toReactive(_rawValue);
    }
    // 类的属性访问器 最终会变成deifneProperty
    get value() {
        if (isTracking()) {
            trackEffects(this.dep || (this.dep = new Set()));
        }
        return this._value;
    }
    set value(newValue) {
        if (newValue !== this._rawValue) {
            // 先看一下之前之后是否一样
            this._rawValue = newValue;
            this._value = toReactive(newValue);
            triggerEffects(this.dep);
        }
    }
}
function createRef(value) {
    return new RefImpl(value);
}
function ref(value) {
    return createRef(value);
}
// export function shallowRef(value){
//   return createRef(value,true);
// }
// reactive readonly

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 22:14:02
 * @LastEditTime: 2021-12-20 14:27:33
 * @LastEditors: changqing
 * @Usage:
 */
function createAppAPI(render) {
    return (rootComponent, rootProps) => {
        const app = {
            mount(container) {
                // 1.创造组件虚拟节点 
                let vnode = createVNode(rootComponent, rootProps); // h函数
                // 2.挂载的核心就是根据传入的组件对象 创造一个组件的虚拟节点 ，在将这个虚拟节点渲染到容器中
                render(vnode, container);
            }
        };
        return app;
    };
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-20 11:15:53
 * @LastEditTime: 2021-12-20 11:15:53
 * @LastEditors: changqing
 * @Usage:
 */
function createComponentInstance(vnode) {
    const type = vnode.type; // 用户自己传入的属性
    const instance = {
        vnode,
        type,
        subTree: null,
        ctx: {},
        props: {},
        attrs: {},
        slots: {},
        setupState: {},
        propsOptions: type.props,
        proxy: null,
        render: null,
        emit: null,
        exposed: {},
        isMounted: false // 是否挂载完成
    };
    instance.ctx = { _: instance }; // 稍后会说 ， 后续会对他进行代理
    return instance;
}
function initProps(instance, rawProps) {
    const props = {};
    const attrs = {};
    const options = Object.keys(instance.propsOptions); // 用户注册过的, 校验类型
    if (rawProps) {
        for (let key in rawProps) {
            const value = rawProps[key];
            if (options.includes(key)) {
                props[key] = value;
            }
            else {
                attrs[key] = value;
            }
        }
    }
    instance.props = reactive(props);
    instance.attrs = attrs; // 这个attrs 是非响应式的
}
function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose: (exposed) => instance.exposed = exposed || {}
    };
}
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance; // 同名 props 和状态同名   通过proxy 可以直接访问状态和属性
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        else ;
    },
    set({ _: instance }, key, value) {
        const { setupState, props } = instance; // 属性不能修改
        if (hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        else if (hasOwn(props, key)) {
            console.warn('Props are readonly');
            return false;
        }
        else ;
        return true;
    }
};
function setupStatefulComponent(instance) {
    // 核心就是调用组件的setup方法
    const Component = instance.type;
    const { setup } = Component;
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers); // proxy就是代理的上下文
    if (setup) {
        const setupContext = createSetupContext(instance);
        let setupResult = setup(instance.props, setupContext); /// 获取setup的返回值
        if (isFunction(setupResult)) {
            instance.render = setupResult; // 如果setup返回的是函数那么就是render函数
        }
        else if (isObject(setupResult)) {
            instance.setupState = setupResult;
        }
    }
    if (!instance.render) {
        // 如果 没有render 而写的是template  可能要做模板编译  下个阶段 会实现如何将template -》 render函数 (耗性能)
        instance.render = Component.render; // 如果setup没有写render 那么就采用组件本身的render
    }
}
function setupComponent(instance) {
    const { props, children } = instance.vnode;
    // 组件的props 做初始化  attrs也要初始化
    initProps(instance, props);
    // 插槽的初始化
    // initSlots(instance,children) ...
    setupStatefulComponent(instance); // 这个方法的目的就是调用setup函数 拿到返回值 给
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-20 11:06:00
 * @LastEditTime: 2021-12-20 14:27:55
 * @LastEditors: changqing
 * @Usage:
 */
function createRenderer(renderOptions) {
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, } = renderOptions;
    const setupRenderEffect = (initialVNode, instance, container) => {
        // 创建渲染effect
        // 核心就是调用render，数据变化 就重新调用render 
        const componentUpdateFn = () => {
            let { proxy } = instance; //  render中的参数
            if (!instance.isMounted) {
                // 组件初始化的流程
                // 调用render方法 （渲染页面的时候会进行取值操作，那么取值的时候会进行依赖收集 ， 收集对应的effect，稍后属性变化了会重新执行当前方法）
                const subTree = instance.subTree = instance.render.call(proxy, proxy); // 渲染的时候会调用h方法
                // 真正渲染组件 其实渲染的应该是subTree
                patch(null, subTree, container); // 稍后渲染完subTree 会生成真实节点之后挂载到subTree
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 组件更新的流程 。。。
                // 我可以做 diff算法   比较前后的两颗树 
                const prevTree = instance.subTree;
                const nextTree = instance.render.call(proxy, proxy);
                patch(prevTree, nextTree, container); // 比较两棵树
            }
        };
        const effect = new ReactiveEffect(componentUpdateFn);
        // 默认调用update方法 就会执行componentUpdateFn
        const update = effect.run.bind(effect);
        update();
    };
    const mountComponent = (initialVNode, container) => {
        // 根据组件的虚拟节点 创造一个真实节点 ， 渲染到容器中
        // 1.我们要给组件创造一个组件的实例 
        const instance = initialVNode.component = createComponentInstance(initialVNode);
        // 2. 需要给组件的实例进行赋值操作
        setupComponent(instance); // 给实例赋予属性
        // 3.调用render方法实现 组件的渲染逻辑。 如果依赖的状态发生变化 组件要重新渲染
        // 数据和视图是双向绑定的 如果数据变化视图要更新 响应式原理 
        // effect  data  effect 可以用在组件中，这样数据变化后可以自动重新的执行effect函数
        setupRenderEffect(initialVNode, instance, container); // 渲染effect
    };
    const processComponent = (n1, n2, container) => {
        if (n1 == null) {
            // 组件的初始化
            mountComponent(n2, container);
        }
    };
    const mountChildren = (children, container) => {
        // 如果是一个文本 可以直接   el.textContnt = 文本2
        // ['文本1','文本2']   两个文本 需要 创建两个文本节点 塞入到我们的元素中
        for (let i = 0; i < children.length; i++) {
            const child = (children[i] = normalizeVNode(children[i]));
            patch(null, child, container); // 如果是文本需要特殊处理
        }
    };
    const mountElement = (vnode, container) => {
        // vnode中的children  可能是字符串 或者是数组  对象数组  字符串数组
        let { type, props, shapeFlag, children } = vnode; // 获取节点的类型 属性 儿子的形状 children
        let el = vnode.el = hostCreateElement(type);
        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, children);
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) { // 按位与
            mountChildren(children, el);
        }
        // 处理属性
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]); // 给元素添加属性
            }
        }
        hostInsert(el, container);
    };
    const patchProps = (oldProps, newProps, el) => {
        if (oldProps === newProps)
            return;
        for (let key in newProps) {
            const prev = oldProps[key];
            const next = newProps[key]; // 获取新老属性
            if (prev !== next) {
                hostPatchProp(el, key, prev, next);
            }
        }
        for (const key in oldProps) { // 老的有新的没有  移除老的
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    };
    const patchElement = (n1, n2) => {
        let el = n2.el = n1.el; // 先比较元素 元素一致 则复用 
        const oldProps = n1.props || {}; // 复用后比较属性
        const newProps = n2.props || {};
        patchProps(oldProps, newProps, el);
        // 实现比较儿子  diff算法  
    };
    const processElement = (n1, n2, container) => {
        if (n1 == null) {
            // 初始化
            mountElement(n2, container);
        }
        else {
            // diff
            patchElement(n1, n2); // 更新两个元素之间的差异
        }
    };
    const processText = (n1, n2, container) => {
        if (n1 === null) {
            // 文本的初始化 
            let textNode = hostCreateText(n2.children);
            hostInsert(textNode, container);
        }
    };
    const unmount = (vnode) => {
        hostRemove(vnode.el); // 删除真实节点即可
    };
    const patch = (n1, n2, container) => {
        // 两个元素 完全没用关系 
        if (n1 && !isSameVNodeType(n1, n2)) { // n1 有值 再看两个是否是相同节点
            unmount(n1);
            n1 = null;
        }
        // 如果前后元素不一致 需要删除老的元素 换成新的元素
        if (n1 == n2)
            return;
        const { shapeFlag, type } = n2; // createApp(组件)
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 6 /* COMPONENT */) {
                    processComponent(n1, n2, container);
                }
                else if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container);
                }
        }
    };
    const render = (vnode, container) => {
        // 后续还有更新 patch  包含初次渲染 还包含更新
        patch(null, vnode, container); // 后续更新 prevNode nextNode container
    };
    // 
    return {
        createApp: createAppAPI(render),
        render
    };
}

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 22:01:35
 * @LastEditTime: 2021-12-18 22:01:35
 * @LastEditors: changqing
 * @Usage:
 */
const nodeOps = {
    insert: (child, parent, anchor = null) => {
        parent.insertBefore(child, anchor); // parent.appendChild(child)
    },
    remove: child => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: tag => document.createElement(tag),
    createText: text => document.createTextNode(text),
    setElementText: (el, text) => el.textContent = text,
    setText: (node, text) => node.nodeValue = text,
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => document.querySelector(selector)
};
// runtime-dom 提供 节点操作的api -> 传递给 runtime-core

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 22:02:11
 * @LastEditTime: 2021-12-18 22:03:19
 * @LastEditors: changqing
 * @Usage:
 */
// 需要比对属性 diff算法    属性比对前后值
function patchClass(el, value) {
    if (value == null) {
        el.removeAttribute('class');
    }
    else {
        el.className = value;
    }
}
function patchStyle(el, prev, next) {
    const style = el.style; // 操作的是样式
    // 最新的肯定要全部加到元素上
    for (let key in next) {
        style[key] = next[key];
    }
    // 新的没有 但是老的有这个属性, 将老的移除掉
    if (prev) {
        for (let key in prev) {
            if (next[key] == null) {
                style[key] = null;
            }
        }
    }
}
function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e);
    };
    invoker.value = value; // 存储这个变量, 后续想换绑 可以直接更新value值
    return invoker;
}
function patchEvent(el, key, nextValue) {
    // vei  vue event invoker  缓存绑定的事件 
    const invokers = el._vei || (el._vei = {}); // 在元素上绑定一个自定义属性 用来记录绑定的事件
    let exisitingInvoker = invokers[key]; // 先看一下有没有绑定过这个事件
    if (exisitingInvoker && nextValue) { // 换绑逻辑
        exisitingInvoker.value = nextValue;
    }
    else {
        const name = key.slice(2).toLowerCase(); // eventName
        if (nextValue) {
            const invoker = invokers[key] = createInvoker(nextValue); // 返回一个引用
            el.addEventListener(name, invoker); // 正规的时间 onClick =(e)=>{}
        }
        else if (exisitingInvoker) {
            // 如果下一个值没有 需要删除
            el.removeEventListener(name, exisitingInvoker);
            invokers[key] = undefined; // 解绑了
        }
        // else{
        //     // 压根没有绑定过 事件就不需要删除了
        // }
    }
}
function patchAttr(el, key, value) {
    if (value == null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, value);
    }
}
const patchProp = (el, key, prevValue, nextValue) => {
    if (key === 'class') { // 类名 
        patchClass(el, nextValue); // 
    }
    else if (key === 'style') { // 样式
        patchStyle(el, prevValue, nextValue);
    }
    else if (/^on[^a-z]/.test(key)) { // onXxx
        // 如果有事件 addEventListener  如果没事件 应该用removeListener
        patchEvent(el, key, nextValue);
        // 绑定一个 换帮了一个  在换绑一个
    }
    else {
        // 其他属性 setAttribute
        patchAttr(el, key, nextValue);
    }
};

/*
 * @Description:
 * @Author: changqing
 * @Date: 2021-12-18 21:19:59
 * @LastEditTime: 2021-12-18 22:07:29
 * @LastEditors: changqing
 * @Usage:
 */
const renderOptions = Object.assign(nodeOps, { patchProp }); // 包含所需要的所有api
// 实现将renderOptions 传入到core中
// runtime-dom  在这层 对我们浏览器的操作做了一些
const createApp = (component, rootProps = null) => {
    // 需要创建一个渲染器
    const { createApp } = createRenderer(renderOptions); // runtime-core中的方法
    let app = createApp(component, rootProps);
    let { mount } = app; // 获取core中mount
    app.mount = function (container) {
        container = nodeOps.querySelector(container);
        container.innerHTML = '';
        mount(container); // 处理节点后传入到mount中
    };
    return app;
};
const createSSRApp = () => {
};

export { ReactiveEffect, computed, createApp, createRenderer, createSSRApp, effect, h, isObject, reactive, ref };
//# sourceMappingURL=runtime-dom.esm-bundler.js.map
