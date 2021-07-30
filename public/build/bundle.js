
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const mounted = writable(false);

    const currentProject = writable(null);

    const urlProject = derived(currentProject, ($currentProject) => {    
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        urlParams.set("project", $currentProject);

        return $currentProject
    });

    const scrollY = writable(0);
    const windowH = writable(0);

    var google = {
    	sheet: [
    	],
    	doc: [
    		{
    			id: "177gK8YFHelSyKMLUXL7aBzFTT0K04u3NV2534qq4xP4",
    			filepath: "public/assets/copy/markup.json"
    		}
    	],
    	fonts: {
    		active: true,
    		weights: [
    			{
    				name: "Inter",
    				weights: [
    					"400",
    					"500",
    					"700"
    				],
    				italics: [
    				]
    			},
    			{
    				name: "Zilla Slab",
    				weights: [
    					"400",
    					"500",
    					"700"
    				],
    				italics: [
    				]
    			}
    		]
    	}
    };
    var fontAwesome = {
    	active: true,
    	kitId: "2f5b16c217"
    };
    var typekit = {
    	active: true,
    	kitId: "mqy7dqx"
    };
    var config = {
    	google: google,
    	fontAwesome: fontAwesome,
    	typekit: typekit
    };

    /* src/components/Head.svelte generated by Svelte v3.29.7 */
    const file = "src/components/Head.svelte";

    // (62:2) {#if config.fontAwesome.active}
    function create_if_block_2(ctx) {
    	let script;
    	let script_src_value;

    	const block = {
    		c: function create() {
    			script = element("script");
    			this.h();
    		},
    		l: function claim(nodes) {
    			script = claim_element(nodes, "SCRIPT", { src: true, crossorigin: true });
    			var script_nodes = children(script);
    			script_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (script.src !== (script_src_value = "https://kit.fontawesome.com/" + config.fontAwesome.kitId + ".js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "crossorigin", "anonymous");
    			add_location(script, file, 62, 4, 1902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, script, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(62:2) {#if config.fontAwesome.active}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#if config.typekit.active}
    function create_if_block_1(ctx) {
    	let link;
    	let link_href_value;

    	const block = {
    		c: function create() {
    			link = element("link");
    			this.h();
    		},
    		l: function claim(nodes) {
    			link = claim_element(nodes, "LINK", { rel: true, href: true });
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", link_href_value = "https://use.typekit.net/" + config.typekit.kitId + ".css");
    			add_location(link, file, 69, 4, 2068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(69:2) {#if config.typekit.active}",
    		ctx
    	});

    	return block;
    }

    // (76:2) {#if config.google.fonts.active}
    function create_if_block(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			html_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*googleTag*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*googleTag*/ 1) html_tag.p(/*googleTag*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(76:2) {#if config.google.fonts.active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let meta4;
    	let meta5;
    	let meta6;
    	let meta7;
    	let meta8;
    	let meta9;
    	let meta10;
    	let meta11;
    	let meta12;
    	let meta13;
    	let meta14;
    	let meta15;
    	let meta16;
    	let meta17;
    	let meta18;
    	let meta19;
    	let meta20;
    	let meta21;
    	let link;
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let if_block0 = config.fontAwesome.active && create_if_block_2(ctx);
    	let if_block1 = config.typekit.active && create_if_block_1(ctx);
    	let if_block2 = config.google.fonts.active && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			meta4 = element("meta");
    			meta5 = element("meta");
    			meta6 = element("meta");
    			meta7 = element("meta");
    			meta8 = element("meta");
    			meta9 = element("meta");
    			meta10 = element("meta");
    			meta11 = element("meta");
    			meta12 = element("meta");
    			meta13 = element("meta");
    			meta14 = element("meta");
    			meta15 = element("meta");
    			meta16 = element("meta");
    			meta17 = element("meta");
    			meta18 = element("meta");
    			meta19 = element("meta");
    			meta20 = element("meta");
    			meta21 = element("meta");
    			link = element("link");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-eyxv49\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { charset: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta2 = claim_element(head_nodes, "META", { "http-equiv": true, content: true });
    			meta3 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta4 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta5 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta6 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta7 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta8 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta9 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta10 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta11 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta12 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta13 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta14 = claim_element(head_nodes, "META", { property: true, content: true });
    			meta15 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta16 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta17 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta18 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta19 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta20 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta21 = claim_element(head_nodes, "META", { name: true, content: true });
    			link = claim_element(head_nodes, "LINK", { rel: true, href: true });
    			if (if_block0) if_block0.l(head_nodes);
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.l(head_nodes);
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.l(head_nodes);
    			if_block2_anchor = empty();
    			head_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Sam";
    			attr_dev(meta0, "charset", "UTF-8");
    			add_location(meta0, file, 32, 2, 749);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1.0");
    			add_location(meta1, file, 33, 2, 776);
    			attr_dev(meta2, "http-equiv", "X-UA-Compatible");
    			attr_dev(meta2, "content", "ie=edge");
    			add_location(meta2, file, 34, 2, 851);
    			attr_dev(meta3, "name", "description");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file, 35, 2, 909);
    			attr_dev(meta4, "name", "news_keywords");
    			attr_dev(meta4, "content", "");
    			add_location(meta4, file, 36, 2, 950);
    			attr_dev(meta5, "property", "og:title");
    			attr_dev(meta5, "content", "");
    			add_location(meta5, file, 38, 2, 994);
    			attr_dev(meta6, "property", "og:site_name");
    			attr_dev(meta6, "content", "");
    			add_location(meta6, file, 39, 2, 1036);
    			attr_dev(meta7, "property", "og:url");
    			attr_dev(meta7, "content", "");
    			add_location(meta7, file, 40, 2, 1082);
    			attr_dev(meta8, "property", "og:description");
    			attr_dev(meta8, "content", "description");
    			add_location(meta8, file, 41, 2, 1122);
    			attr_dev(meta9, "property", "og:type");
    			attr_dev(meta9, "content", "article");
    			add_location(meta9, file, 42, 2, 1181);
    			attr_dev(meta10, "property", "og:locale");
    			attr_dev(meta10, "content", "en_US");
    			add_location(meta10, file, 43, 2, 1229);
    			attr_dev(meta11, "property", "og:image");
    			attr_dev(meta11, "content", "");
    			add_location(meta11, file, 45, 2, 1278);
    			attr_dev(meta12, "property", "og:image:type");
    			attr_dev(meta12, "content", "image/jpeg");
    			add_location(meta12, file, 46, 2, 1320);
    			attr_dev(meta13, "property", "og:image:width");
    			attr_dev(meta13, "content", "1200");
    			add_location(meta13, file, 47, 2, 1377);
    			attr_dev(meta14, "property", "og:image:height");
    			attr_dev(meta14, "content", "600");
    			add_location(meta14, file, 48, 2, 1429);
    			attr_dev(meta15, "name", "twitter:card");
    			attr_dev(meta15, "content", "summary_large_image");
    			add_location(meta15, file, 50, 2, 1482);
    			attr_dev(meta16, "name", "twitter:site");
    			attr_dev(meta16, "content", "");
    			add_location(meta16, file, 51, 2, 1543);
    			attr_dev(meta17, "name", "twitter:creator");
    			attr_dev(meta17, "content", "");
    			add_location(meta17, file, 52, 2, 1585);
    			attr_dev(meta18, "name", "twitter:title");
    			attr_dev(meta18, "content", "");
    			add_location(meta18, file, 53, 2, 1630);
    			attr_dev(meta19, "name", "twitter:description");
    			attr_dev(meta19, "content", "");
    			add_location(meta19, file, 54, 2, 1673);
    			attr_dev(meta20, "name", "twitter:image:src");
    			attr_dev(meta20, "content", "");
    			add_location(meta20, file, 55, 2, 1722);
    			attr_dev(meta21, "name", "robots");
    			attr_dev(meta21, "content", "max-image-preview:large");
    			add_location(meta21, file, 57, 2, 1770);
    			attr_dev(link, "rel", "canonical");
    			attr_dev(link, "href", "");
    			add_location(link, file, 59, 2, 1830);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, meta4);
    			append_dev(document.head, meta5);
    			append_dev(document.head, meta6);
    			append_dev(document.head, meta7);
    			append_dev(document.head, meta8);
    			append_dev(document.head, meta9);
    			append_dev(document.head, meta10);
    			append_dev(document.head, meta11);
    			append_dev(document.head, meta12);
    			append_dev(document.head, meta13);
    			append_dev(document.head, meta14);
    			append_dev(document.head, meta15);
    			append_dev(document.head, meta16);
    			append_dev(document.head, meta17);
    			append_dev(document.head, meta18);
    			append_dev(document.head, meta19);
    			append_dev(document.head, meta20);
    			append_dev(document.head, meta21);
    			append_dev(document.head, link);
    			if (if_block0) if_block0.m(document.head, null);
    			append_dev(document.head, if_block0_anchor);
    			if (if_block1) if_block1.m(document.head, null);
    			append_dev(document.head, if_block1_anchor);
    			if (if_block2) if_block2.m(document.head, null);
    			append_dev(document.head, if_block2_anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (config.fontAwesome.active) if_block0.p(ctx, dirty);
    			if (config.typekit.active) if_block1.p(ctx, dirty);
    			if (config.google.fonts.active) if_block2.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(meta4);
    			detach_dev(meta5);
    			detach_dev(meta6);
    			detach_dev(meta7);
    			detach_dev(meta8);
    			detach_dev(meta9);
    			detach_dev(meta10);
    			detach_dev(meta11);
    			detach_dev(meta12);
    			detach_dev(meta13);
    			detach_dev(meta14);
    			detach_dev(meta15);
    			detach_dev(meta16);
    			detach_dev(meta17);
    			detach_dev(meta18);
    			detach_dev(meta19);
    			detach_dev(meta20);
    			detach_dev(meta21);
    			detach_dev(link);
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			detach_dev(if_block1_anchor);
    			if (if_block2) if_block2.d(detaching);
    			detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Head", slots, []);
    	let googleTag, fontPaths = [];

    	config.google.fonts.weights.forEach((font, i) => {
    		const name = font.name.replace(/\s+/g, "+"), fontWeights = [];

    		font.weights.forEach(weight => {
    			fontWeights.push(`0,${weight}`);
    		});

    		font.italics.forEach(weight => {
    			fontWeights.push(`1,${weight}`);
    		});

    		fontPaths.push(`family=${name}:ital,wght@${fontWeights.join(";")}`);
    	});

    	googleTag = `
			<link rel="preconnect" href="https://fonts.gstatic.com">
			<link href="https://fonts.googleapis.com/css2?${fontPaths.join("&")}&display=swap" rel="stylesheet">
	`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Head> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ config, googleTag, fontPaths });

    	$$self.$inject_state = $$props => {
    		if ("googleTag" in $$props) $$invalidate(0, googleTag = $$props.googleTag);
    		if ("fontPaths" in $$props) fontPaths = $$props.fontPaths;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [googleTag];
    }

    class Head extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment.name
    		});
    	}
    }
    Head.$compile = {"vars":[{"name":"config","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"googleTag","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"fontPaths","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true}]};

    /* src/components/Styles.svelte generated by Svelte v3.29.7 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Styles", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Styles> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Styles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Styles",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }
    Styles.$compile = {"vars":[]};

    var headline = [
    	{
    		type: "text",
    		value: "Hi, I'm Sam. I tell visual stories using data, graphics, and interactivity."
    	},
    	{
    		type: "text",
    		value: "<span class=\"text-green-600\">It's so nice to meet you.</span>"
    	}
    ];
    var pics = [
    	{
    		src: "/moving-pictures/IzzyInTheSnow.gif",
    		alt: "Here is my derp of a dog, Izzy, playing in the snow in Squamish, BC",
    		width: "col-span-3 md:col-span-3"
    	},
    	{
    		src: "/pictures/IzzyAtGraduation.jpg",
    		alt: "My dog Izzy and I at her graduation from puppy school",
    		width: "hidden md:block md:col-span-2 mt-8"
    	},
    	{
    		src: "/pictures/Swinging.jpg",
    		alt: "Here I am enjoying a rope swing on the beach at Cape Scott on Northern Vancouver Island",
    		width: "hidden md:block col-span-2 mt-32"
    	},
    	{
    		src: "/pictures/TheBoys.JPG",
    		alt: "My brother, my dad, and I attending a Blue Jays game during the pandemic in Buffalo as cardboard cutouts",
    		width: "col-span-2 md:col-span-3 -mt-8"
    	},
    	{
    		src: "/pictures/IzzyAtChristmas.jpg",
    		alt: "My dog, Izzy, dressed up for Christmas",
    		width: "col-span-3 md:col-span-2 mt-8 md:mt-20"
    	}
    ];
    var lead = [
    	{
    		type: "text",
    		value: "I&rsquo;m a senior designer and developer at <a href=\"http://thedataface.com\">The DataFace</a>, based in Vancouver, BC and working at the intersection of data science, journalism, design, and web development."
    	}
    ];
    var intro = [
    	{
    		type: "text",
    		value: "I have a bachelor's degree from the University of Waterloo School of Architecture and a Master's of Science in Data Visualization from Parsons in NYC."
    	},
    	{
    		type: "text",
    		value: "I&rsquo;m also an eight-time local pub trivia champion, along with my twin brother; the current scoring champion in one of the lowest-division adult hockey leagues in the city; and an early pioneer of the Circle Line Pub Crawl."
    	},
    	{
    		type: "text",
    		value: "You can see some of my work below and if you want to get in touch, you can email me at <a href=\"mailto:sam.vickars@gmail.com\">sam.vickars@gmail.com</a> &mdash; I&rsquo;m almost always down for a chat. If you add me on Twitter, <a href=\"http://twitter.com/samvickars\">@samvickars</a>, I&rsquo;ll probably follow you back."
    	}
    ];
    var conclusion = "I made this site using <a href=\"https://svelte.dev/\">Svelte</a>, and <a href=\"http://archieml.org/\">ArchieML</a>. The whole thing runs off this <a https://docs.google.com/document/d/177gK8YFHelSyKMLUXL7aBzFTT0K04u3NV2534qq4xP4/edit\">Google Doc</a>. It's hosted on Github pages and uses Inter, a Google Font.";
    var work = [
    	{
    		title: "The Yelp Economic Average",
    		id: "yelp-economic-average",
    		date: "July 2021",
    		type: "Yelp",
    		client: "Yelp <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#EB5757",
    		team: "Jack Beckwith + Michael Hester + Yelp Comms Team + Yelp Data Science Team",
    		links: [
    			{
    				text: "Explore",
    				href: "https://yelpeconomicaverage.com"
    			}
    		],
    		awards: [
    			{
    				icon: "star",
    				text: "PRWeek US 2021 Winner: Data Insight"
    			},
    			{
    				icon: "hand-point-right",
    				text: "Featured in the Wall Street Journal, New York Times, Bloomberg and Axios, and on CNN, CNBC, and CBS This Morning"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "The Yelp Economic Average tracks the performance of local economies across the United States using Yelp data. The DataFace has been working with Yelp&rsquo;s communications team to produce data-driven stories since 2018, including quarterly YEA reports."
    			},
    			{
    				type: "text",
    				value: "Since I joined the team, w&rsquo;ve been responsible for two annual reports, six special reports, and countless quarterly reports. We also designed and built <a href=\"http://yelpeconomicaverage.com\">yelpeconomicaverage.com</a>, the new home for YEA. Each report combines interactive and static data viz and graphics, with copy written by the Yelp team."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/yea/1.png",
    				alt: "Some of my work on Yelp’s Economic Average.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/yea/2.png",
    				alt: "Some of my work on Yelp’s Economic Average.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/yea/3.png",
    				alt: "Some of my work on Yelp’s Economic Average.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/yea/4.png",
    				alt: "Some of my work on Yelp’s Economic Average.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "FreeKeithDavisJr",
    		id: "keith-davis-jr",
    		date: "July 2021",
    		type: "Campaign Zero",
    		filter: "selected",
    		selected: "-1",
    		client: "Campaign Zero <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development + Copywriting",
    		color: "#F2C94C",
    		dark: "true",
    		bg: "black",
    		team: "Jack Beckwith + Michael Hester + Aria Todd + Omar Nema + DeRay Mckesson + Katie Ryan",
    		links: [
    			{
    				text: "See the Site",
    				href: "https://keithdavisjr.com/"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Keith Davis Jr. was cornered by police in a West Baltimore garage in 2015, where they shot at him 44 times, striking him multiple times. Keith Davis Jr. was supposed to die, but instead he&rsquo;s endured trial after trial, simply for surviving."
    			},
    			{
    				type: "text",
    				value: "Baltimore&rsquo;s state attorney Marilyn Mosby chose to protect the officers and prosecute Keith for crimes he did not commit. For more than 6 years, Keith has been the victim of inconsistent testimony, tampered evidence, and unjust trials."
    			},
    			{
    				type: "text",
    				value: "We teamed up with Campaign Zero to create this website, where we walk through Keith Davis&rsquo;s last 6 years: the charges he&rsquo;s face, the trials he&rsquo;s endured, and the web of inconsistencies in the evidence presented against him (cue this <a href=\"https://media.giphy.com/media/l0IykOsxLECVejOzm/giphy.gif\">gif</a>)."
    			},
    			{
    				type: "text",
    				value: "I played a big role in the design of the site, along with Aria Todd, and the development, with Michael Hester and Omar Nema."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/keith-davis-jr/1.gif",
    				alt: "Some of my work on Campaign Zero’s Free Keith Davis Jr. project.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/keith-davis-jr/2.png",
    				alt: "Some of my work on Campaign Zero’s Free Keith Davis Jr. project.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/keith-davis-jr/3.png",
    				alt: "Some of my work on Campaign Zero’s Free Keith Davis Jr. project.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/keith-davis-jr/4.png",
    				alt: "Some of my work on Campaign Zero’s Free Keith Davis Jr. project.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "America&rsquo;s Favorite Ice Cream",
    		id: "we-all-scream-for-ice-cream",
    		date: "May 2021",
    		type: "Instacart",
    		client: "Instacart <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Data Analysis",
    		color: "#0AAD0A",
    		team: "Jack Beckwith + Michael Hester + Catalina Perez",
    		description: [
    		],
    		media: [
    			{
    				src: "portfolio/we-all-scream-for-ice-cream/1.png",
    				alt: "A map of America’s favourite ice cream flavours.",
    				size: "col-span-4 md:col-span-12 -mt-2"
    			}
    		]
    	},
    	{
    		title: "The Retirement Security Report",
    		id: "equable-rsr",
    		date: "June 2021",
    		type: "Equable",
    		filter: "all",
    		client: "Equable <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#2D9CDB",
    		team: "Jack Beckwith + Michael Hester + Aria Todd",
    		links: [
    			{
    				text: "Check out the report",
    				href: "https://equable.org/rsr/"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Equable is a bipartisan, collaborative organization sitting on a wealth of data on pensions and retirement plans across the United States."
    			},
    			{
    				type: "text",
    				value: "The Equable team reached out to us looking to create what they called the Retirement Security Report. They analyzed 335 retirement plans across 50 states + D.C. across 11 metrics to determine if plans are providing a path to retirement income security for all public workers."
    			},
    			{
    				type: "text",
    				value: "We went above and beyond, creating a fully interactive report with a downloadable PDF, retirement savings calculator, and integrated data viz."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/equable-rsr/1.png",
    				alt: "Some of my work on Equable’s Retirement Security Report.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/equable-rsr/2.png",
    				alt: "Some of my work on Equable’s Retirement Security Report.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/equable-rsr/3.png",
    				alt: "Some of my work on Equable’s Retirement Security Report.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/equable-rsr/4.png",
    				alt: "Some of my work on Equable’s Retirement Security Report.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Plant Power",
    		id: "plant-based-report",
    		date: "May 2021",
    		type: "Instacart",
    		client: "Instacart <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Data Analysis",
    		color: "#0AAD0A",
    		team: "Jack Beckwith + Michael Hester + Catalina Perez",
    		links: [
    			{
    				text: "Read the article",
    				href: "https://www.instacart.com/company/blog/company-updates/plant-power-how-meat-and-milk-alternatives-are-taking-over-our-carts"
    			}
    		],
    		description: [
    		],
    		media: [
    			{
    				src: "portfolio/plant-based-report/1.png",
    				alt: "Some of my work on Instacart’s Plant Power report.",
    				size: "col-span-4 md:col-span-4 -mt-2"
    			},
    			{
    				src: "portfolio/plant-based-report/2.png",
    				alt: "Some of my work on Instacart’s Plant Power report.",
    				size: "col-span-4 md:col-span-4 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/plant-based-report/3.png",
    				alt: "Some of my work on Instacart’s Plant Power report.",
    				size: "col-span-4 md:col-span-4 mt-7 hidden md:block"
    			}
    		]
    	},
    	{
    		title: "STAATUS Index",
    		id: "laaunch-staatus",
    		date: "May 2021",
    		type: "LAAUNCH",
    		client: "LAAUNCH <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#EB5757",
    		team: "Jack Beckwith + Michael Hester + Aria Todd + Catalina Perez",
    		dark: "true",
    		bg: "gray-900",
    		filter: "selected",
    		selected: "2",
    		links: [
    			{
    				text: "Explore the digital site",
    				href: "https://staatus-index.laaunch.org/"
    			},
    			{
    				text: "Download the report",
    				href: "https://assets.website-files.com/60a45c372eb2698f9ce47814/60cbd3f12cff2a5387e008ba_staatus-index-2021-final.pdf"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "We worked closely with LAAUNCH, a non profit fighting racism and increasing Asian American representaion, to bring life to their STAATUS Index."
    			},
    			{
    				type: "text",
    				value: "LAAUNCH surveyed thousands of Americans, asking questions like &ldquo;how do people perceive the treatment of their own racial/ethnic group&rdquo; and &ldquo;When you think of prominent Asian Americans, what specific names come to mind, if any?&rdquo; The results were eye-opening, and visualized here digitally and in a PDF."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/laaunch-staatus/1.png",
    				alt: "Some of my work on LAAUNCH’s STAATUS index.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/laaunch-staatus/2.png",
    				alt: "Some of my work on LAAUNCH’s STAATUS index.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/laaunch-staatus/3.png",
    				alt: "Some of my work on LAAUNCH’s STAATUS index.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/laaunch-staatus/4.png",
    				alt: "Some of my work on LAAUNCH’s STAATUS index.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Beyond the Cart: A Year of Essential Insights",
    		id: "beyond-the-cart",
    		date: "April 2021",
    		type: "Instacart",
    		client: "Instacart <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Data Analysis",
    		color: "#0AAD0A",
    		team: "Jack Beckwith + Michael Hester",
    		links: [
    			{
    				text: "Read the article",
    				href: "https://news.instacart.com/beyond-the-cart-a-year-of-essential-insights-b6ac201228e6"
    			}
    		],
    		description: [
    		],
    		media: [
    			{
    				src: "portfolio/beyond-the-cart/1.png",
    				alt: "Some of my work on Instacart’s COVID-19 report.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/beyond-the-cart.png",
    				alt: "Some of my work on Instacart’s COVID-19 report.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/beyond-the-cart/3.png",
    				alt: "Some of my work on Instacart’s COVID-19 report.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/beyond-the-cart/4.png",
    				alt: "Some of my work on Instacart’s COVID-19 report.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Let&rsquo;s Play Mad Libs",
    		id: "mad-libs",
    		date: "December 2020",
    		type: "Experiment",
    		filter: "all",
    		color: "#BB6BD9",
    		links: [
    			{
    				text: "Play",
    				href: "https://svickars.github.io/mad-libs/"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "My first project using the Svelte JS framework, this fun little experiment really took me back. I used the Pudding’s Svelte Starter and Microsoft’s Dataset for Fill-in-the-Blank Humor."
    			}
    		]
    	},
    	{
    		title: "End All No-Knocks",
    		id: "no-knocks",
    		date: "November 2020",
    		type: "Campaign Zero",
    		filter: "selected",
    		selected: "4",
    		client: "Campaign Zero <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#56CCF2",
    		team: "Jack Beckwith + Michael Hester + DeRay Mckesson + Katie Ryan + Justin Kemerling + Will Donahoe",
    		links: [
    			{
    				text: "See the Site",
    				href: "https://endallnoknocks.org/"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Breonna Taylor was one of many victims of senseless no-knock raids that happen across the US. While progress has been made to enact legislation to put a stop to no-knock raids, there is still plenty to do."
    			},
    			{
    				type: "text",
    				value: "We worked with Campaign Zero to design and build this interactive site that both maps case studies across the country and tracks legislation at the state, city, and federal levels."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/no-knocks/1.png",
    				alt: "Some of my work on Campaign Zero’s End All No-Knocks project.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/no-knocks/2.png",
    				alt: "Some of my work on Campaign Zero’s End All No-Knocks project.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/no-knocks/3.png",
    				alt: "Some of my work on Campaign Zero’s End All No-Knocks project.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/no-knocks/4.png",
    				alt: "Some of my work on Campaign Zero’s End All No-Knocks project.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "#NIXTHE6: No More Cop Money",
    		id: "nix-the-six",
    		date: "September 2020",
    		type: "Campaign Zero",
    		filter: "all",
    		client: "Campaign Zero <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#F2994A",
    		team: "Jack Beckwith + Michael Hester + DeRay Mckesson + Katie Ryan",
    		links: [
    			{
    				text: "See the Site",
    				href: "https://nixthe6.org/contributions/"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Police unions have too much power. It’s time to hold them accountable."
    			},
    			{
    				type: "text",
    				value: "We worked with Campaign Zero to design and build an interactive map tracking political contributions from law enforcement across the United States, between 2015 and 2020."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/nix-the-six/1.png",
    				alt: "Some of my work on Campaign Zero’s NixThe6 project.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/nix-the-six/2.png",
    				alt: "Some of my work on Campaign Zero’s NixThe6 project.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/nix-the-six/3.png",
    				alt: "Some of my work on Campaign Zero’s NixThe6 project.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/nix-the-six/4.png",
    				alt: "Some of my work on Campaign Zero’s NixThe6 project.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Healthy Marketplace Index",
    		id: "hcci",
    		date: "August 2020",
    		type: "HCCI",
    		"type-icon": "award-simple",
    		filter: "all",
    		client: "Health Care Cost Institute <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#2F80ED",
    		team: "Jack Beckwith + Michael Hester",
    		awards: [
    			{
    				icon: "award-simple",
    				text: "NIHCM Digital Media Awards 2021 Finalist"
    			},
    			{
    				icon: "award-simple",
    				text: "Information is Beautiful Awards 2019 Shortlist"
    			}
    		],
    		links: [
    			{
    				text: "Launch",
    				href: "https://healthcostinstitute.org/hcci-originals/hmi-interactive"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "The Health Cost Institute is a non-profit, healthcare research group based in Washington, D.C., working with grants from the Robert Wood Johnson Foundation. Throughout 2019 and 2020, we worked closely with their team and their data to design and build their Healthy Marketplace Index (HMI)."
    			},
    			{
    				type: "text",
    				value: "Made up of four fully interactive experiences (<a href=\"https://healthcostinstitute.org/hcci-originals/hmi-interactive#HMI-Price-Index\">Price</a>, <a href=\"https://healthcostinstitute.org/hcci-originals/hmi-interactive#HMI-Use-Index\">Use</a>, <a href=\"https://healthcostinstitute.org/hcci-originals/hmi-interactive#HMI-Price-and-Use\">Price vs Use</a>, and <a href=\"https://healthcostinstitute.org/hcci-originals/hmi-interactive#HMI-Concentration-Index\">Hospital Market Concentration</a>), as well as a <a href=\"https://healthcostinstitute.org/hcci-originals/hmi-interactive\">metro area snapshot</a> and several interactive dashboards, HMI uses nearly 2.5 billion commercial claims from 2013–2017 to track drivers of healthcare spending across 124 US metro areas."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/hcci/1.png",
    				alt: "Some of my work on HCCI’s Healthy Marketplace Index.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/hcci/2.png",
    				alt: "Some of my work on HCCI’s Healthy Marketplace Index.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/hcci/3.png",
    				alt: "Some of my work on HCCI’s Healthy Marketplace Index.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/hcci/4.png",
    				alt: "Some of my work on HCCI’s Healthy Marketplace Index.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "The No Doubter Report",
    		id: "no-doubt",
    		date: "June 2020",
    		type: "DataFace Original",
    		filter: "selected",
    		selected: "7",
    		color: "#219653",
    		links: [
    			{
    				text: "Launch",
    				href: "http://thedataface.com/2019/09/sports/no-doubter-report"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Pro ballparks come in all shapes and sizes, sometimes due to the shape of the city block on which they were built, sometimes based on a team&rsquo;s strengths (or weaknesses), and sometimes just to add character. Because their shapes differ, a home run hit in one park might not be a home run in another."
    			},
    			{
    				type: "text",
    				value: "That&rsquo;s what inspired the No Doubter Report. In this project, I look at every home run hit this season to determine which were hit hard enough, long enough, and high enough to leave any major league ballpark, which we&rsquo;ve dubbed &ldquo;No Doubters&rdquo;."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/nodoubt/nodoubt.gif",
    				alt: "Screenshot of my project tracking No Doubters in the MLB.",
    				size: "col-span-4 md:col-span-4 -mt-2"
    			},
    			{
    				src: "portfolio/nodoubt/2.png",
    				alt: "Screenshot of my project tracking No Doubters in the MLB.",
    				size: "col-span-4 md:col-span-4 mt-7 hidden sm:block"
    			},
    			{
    				src: "portfolio/nodoubt/3.png",
    				alt: "Screenshot of my project tracking No Doubters in the MLB.",
    				size: "col-span-4 md:col-span-4 mt-4 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Healthcare Spending in North Carolina",
    		id: "nc-healthcare",
    		date: "June 2020",
    		type: "HCCI x Duke",
    		filter: "all",
    		client: "Health Care Cost Institute <i class=\"fa-thin fa-xmark\"></i> Duke University <i class=\"fa-thin fa-xmark\"></i> Blue Cross Blue Shield NC <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		role: "Design + Development",
    		color: "#2F80ED",
    		dark: "true",
    		bg: "gray-900",
    		team: "Jack Beckwith + Michael Hester",
    		links: [
    			{
    				text: "Launch",
    				href: "https://healthcostinstitute.org/hcci-originals/north-carolina-health-care-spending-analysis"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "The Health Care Cost Institute (HCCI), a non-profit research group based in Washington D.C., in collaboration with researchers from Duke University&rsquo;s Margolis Center for Health Policy and Blue Cross Blue Shield of North Carolina, tasked us with building a comprehensive data visualization experience to promote the research."
    			},
    			{
    				type: "text",
    				value: "We created a visual essay that walked readers through major findings, using interactivity, scrollytelling, and explorable and downloadable content."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/nc-healthcare/1.gif",
    				alt: "Some of my work on HCCI’s project on healthcare spending in North Carolina.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/nc-healthcare/2.png",
    				alt: "Some of my work on HCCI’s project on healthcare spending in North Carolina.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/nc-healthcare/3.png",
    				alt: "Some of my work on HCCI’s project on healthcare spending in North Carolina.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/nc-healthcare/4.png",
    				alt: "Some of my work on HCCI’s project on healthcare spending in North Carolina.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Coronavirus by County",
    		id: "coronavirus",
    		date: "March 2020",
    		type: "DataFace Original",
    		filter: "all",
    		role: "Design + Development + Copywriting",
    		color: "#F2994A",
    		team: "Jack Beckwith + Michael Hester",
    		links: [
    			{
    				text: "Launch",
    				href: "https://thedataface.com/2020/04/public-health/coronavirus-by-county"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Michael Hester, Jack Beckwith, and I put this coronavirus tracker together in a couple of days in March. It uses the New York Times newly released coronavirus by county data."
    			}
    		]
    	},
    	{
    		title: "Yelp&rsquo;s Coronavirus Economic Impact Report",
    		id: "yelp-covid",
    		date: "March 2020",
    		type: "Yelp",
    		"type-icon": "star",
    		filter: "all",
    		role: "Design + Development + Copywriting",
    		color: "#EB5757",
    		team: "Jack Beckwith + Michael Hester",
    		client: "Yelp <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		awards: [
    			{
    				icon: "star",
    				text: "Featured in Washington Post, Forbes, and Business Insider"
    			}
    		],
    		links: [
    			{
    				text: "Launch",
    				href: "https://thedataface.com/2020/04/public-health/coronavirus-by-county"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "We worked with Yelp&rsquo;s communications team to design and build a special economic impact report focusing on the effects of the COVID-19 pandemic across the United States. We released regular updates with interactive and static graphics, the last of which in September."
    			}
    		]
    	},
    	{
    		title: "Block by Block",
    		id: "block-by-block",
    		date: "February 2020",
    		type: "B6",
    		client: "B6 <i class=\"fa-thin fa-xmark\"></i> THe DataFace",
    		filter: "all",
    		links: [
    			{
    				text: "Q4 2019",
    				href: "https://b6realestateadvisors.com/reports/block-by-block-4q19/"
    			},
    			{
    				text: "Q3 2019",
    				href: "https://b6realestateadvisors.com/reports/block-by-block-3q19/"
    			},
    			{
    				text: "H1 2019",
    				href: "https://b6realestateadvisors.com/reports/block-by-block-1h19/"
    			},
    			{
    				text: "Q1 2019",
    				href: "https://b6realestateadvisors.com/reports/block-by-block-1q19/"
    			}
    		],
    		role: "Design + Development",
    		color: "#219653",
    		description: [
    			{
    				type: "text",
    				value: "B6 Real Estate Advisors tasked us with bringing their regular quarterly reports to life, making use of interactive data viz and storytelling. We worked with them to publish 4 quarterly reports and one predicitions report."
    			}
    		]
    	},
    	{
    		title: "Why We Run",
    		id: "why-we-run",
    		date: "January 2020",
    		type: "Strava",
    		filter: "selected",
    		selected: "2",
    		links: [
    			{
    				text: "Check it out",
    				href: "https://whywerun.strava.com/"
    			}
    		],
    		role: "Design + Development",
    		client: "Strava <i class=\"fa-thin fa-xmark\"></i> The DataFace <i class=\"fa-thin fa-xmark\"></i> Polygraph",
    		color: "#F2994A",
    		dark: "true;",
    		bg: "black",
    		description: [
    			{
    				type: "text",
    				value: "Strava is a social network for fitness, home to millions of runners, cyclists, and performance athletes. With access to such a large group of avid runners who use the app to track their progress and connect with others, Strava found themselves with a ton of data and original research on the factors that motivate people to start and then keep running."
    			},
    			{
    				type: "text",
    				value: "Strava hired us, along with Imprint Projects and Polygraph to build an experience that visualizes their findings. We combined their qualitative research with quantitative poll results to create a compelling, interactive narrative, with downloadable content and interactive elements, available in six languages."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/why-we-run/1.gif",
    				alt: "Some of my work on Strava’s Why We Run.",
    				size: "col-span-4 md:col-span-3"
    			},
    			{
    				src: "portfolio/why-we-run/2.png",
    				alt: "Some of my work on Strava’s Why We Run.",
    				size: "col-span-4 md:col-span-3 mt-8 hidden sm:block"
    			},
    			{
    				src: "portfolio/why-we-run/3.png",
    				alt: "Some of my work on Strava’s Why We Run.",
    				size: "col-span-4 md:col-span-3 mt-2 hidden md:block"
    			},
    			{
    				src: "portfolio/why-we-run/4.gif",
    				alt: "Some of my work on Strava’s Why We Run.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Yelp 15",
    		id: "yelp-15",
    		date: "September 2019",
    		type: "Yelp",
    		filter: "all",
    		links: [
    			{
    				text: "Launch",
    				href: "https://yelp15.com/"
    			}
    		],
    		role: "Design + Development",
    		client: "Yelp <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		color: "#EB5757",
    		description: [
    			{
    				type: "text",
    				value: "Yelp celebrated their 15th anniversary in September of 2019. We created this microsite (<a href=\"http://yelp15.com\">yelp15.com</a>) to help celebrate. Along with Yelp&rsquos data science team, we analyzed nearly 200m reviews and 15 years worth of search and consumer interest data to create six interactive explorations."
    			},
    			{
    				type: "text",
    				value: "Check it out to explore the foods we consumed, the chains we cherished, the fads we followed, the language we used, the words that defined our cities, and the services we needed."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/yelp-15/1.png",
    				alt: "Some of my work on Yelp 15.",
    				size: "col-span-4 md:col-span-3"
    			},
    			{
    				src: "portfolio/yelp-15/2.png",
    				alt: "Some of my work on Yelp 15.",
    				size: "col-span-4 md:col-span-3 mt-8 hidden sm:block"
    			},
    			{
    				src: "portfolio/yelp-15/3.png",
    				alt: "Some of my work on Yelp 15.",
    				size: "col-span-4 md:col-span-3 mt-2 hidden md:block"
    			},
    			{
    				src: "portfolio/yelp-15/4.png",
    				alt: "Some of my work on Yelp 15.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "America&rsquo;s Favorite Summer Drinks",
    		id: "summer-drinks",
    		date: "June 2019",
    		type: "Yelp",
    		filter: "all",
    		links: [
    			{
    				text: "Check it out in Glamour",
    				href: "https://www.glamour.com/story/most-popular-summer-cocktails-in-every-city"
    			}
    		],
    		role: "Design + Illustration",
    		client: "Yelp <i class=\"fa-thin fa-xmark\"></i> The DataFace",
    		team: "Michael Hester",
    		color: "#F2C94C",
    		description: [
    			{
    				type: "text",
    				value: "I designed a set of versatile and custom icons for Yelp&rsquo;s piece on America&rsquo;s Favorite Summer Drinks for 2019."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/summer-drinks/1.png",
    				size: "col-span-4 md:col-span-12"
    			}
    		]
    	},
    	{
    		title: "The NBA&rsquo;s Best Drafting Teams",
    		id: "nba",
    		date: "June 2019",
    		type: "DataFace Original",
    		filter: "all",
    		links: [
    			{
    				text: "Read the article",
    				href: "https://thedataface.com/2019/06/sports/best-drafting-nba-teams"
    			}
    		],
    		team: "Michael Hester",
    		role: "Illustration",
    		color: "#56CCF2",
    		description: [
    			{
    				type: "text",
    				value: "I illustrated a series of rookie cards for Michael Hester&rsquo;s article on the NBA draft."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/nba/1.png",
    				size: "col-span-4 md:col-span-12"
    			}
    		]
    	},
    	{
    		title: "The Irregular Outfields of Baseball",
    		id: "irregular-outfields",
    		date: "April 2019",
    		type: "DataFace Original",
    		"type-icon": "award-simple",
    		filter: "selected",
    		selected: "0",
    		links: [
    			{
    				text: "Check it out",
    				href: "http://thedataface.com/2019/04/sports/baseballs-irregular-outfields"
    			}
    		],
    		role: "Design + Development + Writing",
    		color: "#6FCF97",
    		awards: [
    			{
    				icon: "award-simple",
    				text: "Information is Beautiful Awards 2019 Bronze Winner"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Baseball is a sport rooted in rules and regulations. Everything in the game is standardized, planned, and coordinated, based on a guideline or precedent. Everything, that is, but the park itself: outfield sizes and wall heights vary across the entire league. There are 30 MLB stadiums. No two of them are alike."
    			},
    			{
    				type: "text",
    				value: "The inconsistencies and idiosyncrasies of pro baseball fields have fascinated me for years. In this piece, the first in a series on the irregular outfields of baseball and my first original for the DataFace, I look at the seven different types of MLB parks, what makes them distinct, and where the varying sizes in their outfields come from."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/irregular-outfields/Outfields.png",
    				alt: "A collection of illustrations I did for my project on the irregular outfields of baseball, based on a few major league baseball stadiums.",
    				size: "col-span-4 md:col-span-3"
    			},
    			{
    				src: "portfolio/irregular-outfields/Outfields-1.gif",
    				alt: "An animated gif highlighting elements of my project on the irregular outfields of baseball.",
    				size: "col-span-4 md:col-span-3 mt-8 hidden sm:block"
    			},
    			{
    				src: "portfolio/irregular-outfields/Outfields-2.gif",
    				alt: "An animated gif highlighting elements of my project on the irregular outfields of baseball.",
    				size: "col-span-4 md:col-span-3 mt-2 hidden md:block"
    			},
    			{
    				src: "portfolio/irregular-outfields/Outfields-2.png",
    				alt: "An illustration I did for my project on the irregular outfields of baseball.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Who is the biggest pop star?",
    		id: "biggest-pop-star",
    		date: "February 2019",
    		type: "Pudding Original",
    		filter: "all",
    		links: [
    			{
    				text: "Check it out",
    				href: "https://pudding.cool/2019/03/pop-music/"
    			}
    		],
    		role: "Design + Development",
    		team: "Jack Beckwith + Michael Hester",
    		color: "#F2C94C",
    		description: [
    			{
    				type: "text",
    				value: "We worked with the folks at the Pudding to determine who the world&rsquo;s biggest pop star is, using a variety of different methods."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/biggest-pop-star/1.png",
    				size: "col-span-4 md:col-span-12"
    			}
    		]
    	},
    	{
    		title: "Globalography: Our Interconnected World Revealed in 50 Maps",
    		id: "globalography",
    		date: "November 2018",
    		type: "Print Original",
    		filter: "selected",
    		selected: "6",
    		color: "#F2C94C",
    		dark: "true",
    		bg: "gray-900",
    		links: [
    			{
    				text: "Buy it",
    				href: "https://www.amazon.ca/Globalography-Interconnected-World-revealed-Maps/dp/1781317917"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "&ldquo;Explore how cities are expanding beyond the reach of their nations, uncover the ways bananas, cobalt, and water bottles link the most unlikely of places, and discover how modern phenomena such as messenger apps and sharing platforms are changing not just our interactions, but how we interconnect."
    			},
    			{
    				type: "text",
    				value: "&ldquo;Globalography uncovers the myriad ways we can now connect with one another and in doing so, showcases the radical way globalization is transforming our world.&rdquo;"
    			},
    			{
    				type: "text",
    				value: "I worked with Quarto editors to create 50+ maps for this book (and the cover) on our interconnected world, which features essays by author Chris Fitch."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/globalography/1.jpeg",
    				alt: "Part of my book on our interconnected book.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/globalography/4.png",
    				alt: "Part of my book on our interconnected book.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/globalography/2.png",
    				alt: "Part of my book on our interconnected book.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/globalography/3.png",
    				alt: "Part of my book on our interconnected book.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "The Winningest Cities in North American Sports",
    		id: "titletowns",
    		date: "November 2018",
    		type: "Pudding Original",
    		filter: "selected",
    		selected: "3",
    		client: "The Pudding",
    		color: "#2D9CDB",
    		links: [
    			{
    				text: "Check it out",
    				href: "https://pudding.cool/2018/11/titletowns/"
    			}
    		],
    		awards: [
    			{
    				icon: "star",
    				text: "Information is Beautiful Awards 2019 Longlist"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "After the Golden State Warriors won their third NBA championship in four years in 2018, I started thinking...Of all the cities to field a professional or college level team in the last 150 years, which is the winningest?"
    			},
    			{
    				type: "text",
    				value: "I dug through a century of data to determine the titletown of all the North American titletowns, looking at 458 pro sports teams from MLB, NBA, NFL, NHL, MLS, and CFL, as well as 1,917 NCAA div one college teams. All told, these teams have represented 199 different cities, and competed for 996 titles since 1870."
    			},
    			{
    				type: "text",
    				value: "This visual essay explores all the data through three lenses to determine the winningest city in North America, while allowing you to set your own parameters throughout."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/titletowns/Title.gif",
    				alt: "What makes a titletown?",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/titletowns/case1.gif",
    				alt: "An animated gif of the first chart in my project on North America’s winningest cities.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/titletowns/filter.png",
    				alt: "A preview of the filters you can use throughout this project on North America’s winningest cities.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/titletowns/case2.png",
    				alt: "The second chart in my project on North America’s winningest cities.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "Parental Leave in North America",
    		id: "parental-leave",
    		date: "March 2018",
    		type: "DataFace Original",
    		filter: "all",
    		color: "#BB6BD9",
    		links: [
    			{
    				text: "Launch",
    				href: "https://thedataface.com/2018/03/economy/parental-leave"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "During his first term as president, Bill Clinton passed the Family and Medical Leave Act, providing 12 weeks of federally-mandated unpaid leave to new parents. Since then, the need for parental leave and for flexibility has only grown. Yet federal policies haven’t changed."
    			},
    			{
    				type: "text",
    				value: "This project, my first with the DataFace, examines how companies across the US compare, and how the US compares to the rest of the world."
    			}
    		]
    	},
    	{
    		title: "Visualizing Canada&rsquo;s Indian Residential Schools",
    		id: "canada-residential-schools",
    		date: "May 2017",
    		type: "MSDV Thesis",
    		"type-icon": "star",
    		filter: "selected",
    		selected: "1",
    		links: [
    			{
    				text: "Take a look",
    				href: "http://residentialschools.info/"
    			}
    		],
    		role: "Design + Development + Writing",
    		color: "#F2994A",
    		awards: [
    			{
    				icon: "star",
    				text: "Parsons Keynote Selection"
    			},
    			{
    				icon: "star",
    				text: "AIGA New York Fresh Grad Selection"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "Canada&rsquo;s Indian Residential School System was a network of boarding schools, industrial schools, and federal hostels created to remove indigenous children from their homes, their families, and their cultures. While many schools originated long before Confederation in 1867, the system was primarily active following the approval of the Indian Act in 1876 — a group of laws aiming to do away with the Indian tribal system and forcibly enfranchise First Nations peoples — until the the last federally-operated school closed in 1996."
    			},
    			{
    				type: "text",
    				value: "Only in recent years has information about the schools, often run by various religious sects, and their students welfare become public knowledge: physical and sexual abuse was rampang; malnourishment and poor living conditions were not uncommon; and assimilation, deprivation of cultural traditions, and punishment was the standard. It is estimated that 6000 children died while in attendance at an Indian Residential School."
    			},
    			{
    				type: "text",
    				value: "<strong>We weren&rsquo;t taught this in school.</strong>"
    			},
    			{
    				type: "text",
    				value: "This project, my thesis piece at Parsons School of Design, aims to investigate the IRS system visually, beginning with the stories of survivors and transitioning into the narrative of each school."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/IRS/Title.png",
    				alt: "The title page for my Master’s thesis project on Canada’s Indian Residential Schools.",
    				size: "col-span-4 md:col-span-3 hidden sm:block mt-4"
    			},
    			{
    				src: "portfolio/IRS/Map.png",
    				alt: "A map showing all IRS locations I created for my Master’s thesis project on Canada’s Indian Residential Schools.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/IRS/Stories1.png",
    				alt: "The story selection view for my Master’s thesis project on Canada’s Indian Residential Schools.",
    				size: "col-span-4 md:col-span-3 hidden sm:block mt-7"
    			},
    			{
    				src: "portfolio/IRS/School.png",
    				alt: "A school detail page, part of my Master’s thesis project on Canada’s Indian Residential Schools.",
    				size: "col-span-4 md:col-span-3 hidden md:block mt-4"
    			}
    		]
    	},
    	{
    		title: "Roma XXXVI",
    		id: "Roma",
    		date: "December 2014",
    		filter: "all",
    		color: "#000",
    		description: [
    			{
    				type: "text",
    				value: "I spent three and a half months studying architecture in Roma and I did one sketch a day for 80 days. These are my favourites."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/roma/1.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/2.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/3.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/4.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/5.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/6.png",
    				size: "col-span-12"
    			},
    			{
    				src: "portfolio/roma/7.png",
    				size: "col-span-12"
    			}
    		]
    	},
    	{
    		title: "A Chair for Dr Seuss",
    		id: "dr-seuss",
    		date: "November 2013",
    		type: "Built Original",
    		"type-icon": "award-simple",
    		filter: "selected",
    		selected: "5",
    		"class": "ARCH 365: Structural Design",
    		color: "#EB5757",
    		links: [
    			{
    				text: "Read the Storybook",
    				href: "https://issuu.com/himynameissam/docs/astorybook_all"
    			}
    		],
    		awards: [
    			{
    				icon: "star",
    				text: "End of Year Show Selection"
    			},
    			{
    				icon: "award-simple",
    				text: "Come Up To My Room 2013, Judge&rsquo;s Choice"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "For one of my final projects in my third year structural design course at architecture school, I was tasked with designing and building a chair for a famous person or character, while also proving its structural stability. I chose Dr Seuss."
    			},
    			{
    				type: "text",
    				value: "Inspired by All the Places You&rsquo;ll Go, this simple stool breaks down into 6 pieces, ready to pack up and go. It also serves as a reminder that life is quite the balancing act. And the whole thing is written in rhyme."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/seuss/Title.png",
    				alt: "A Chair for Dr. Suess: title page",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/seuss/Tile.jpeg",
    				alt: "An array of photos of people trying to sit or balance on a chair I designed.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/seuss/Me.jpeg",
    				alt: "An overlay of me sitting on a chair I designed.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/seuss/Book.jpeg",
    				alt: "A preview of a couple pages in my book which details the chair I designed.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	},
    	{
    		title: "The World of James Bond",
    		id: "james-bond",
    		date: "October 2016",
    		type: "Print Original",
    		"type-icon": "star",
    		filter: "selected",
    		selected: "5",
    		color: "#000000",
    		dark: "true",
    		bg: "black",
    		awards: [
    			{
    				icon: "award-simple",
    				text: "Adobe Awards 2016, Semifinalist"
    			},
    			{
    				icon: "award-simple",
    				text: "Information is Beautiful Awards 2016, Longlist"
    			}
    		],
    		links: [
    			{
    				text: "See it live",
    				href: "https://svickars.github.io/portfolio/allaboutthatbond/"
    			},
    			{
    				text: "PDF",
    				href: "https://svickars.github.io/data/TheWorldOfJamesBond.pdf"
    			}
    		],
    		description: [
    			{
    				type: "text",
    				value: "<h3>Shaken. Not stirred.</h3>"
    			},
    			{
    				type: "text",
    				value: "Ever wonder which James Bond made the most money? How about which actor flirted with Moneypenny the most? Or who killed the most henchmen? I have. So I did what anybody would do: I sat down with a martini and watched every 007 film (including the unofficial Never Say Never Again), and I got to know every actor, every recurring character, every gadget, every car, and every killer pun. Then I made this."
    			},
    			{
    				type: "text",
    				value: "This map is the result of my undying need to know everything James Bond - from the number of ladies he kisses in each film, to the cities he visits, to the cars he drives. This map shows it all and the connections between each."
    			}
    		],
    		media: [
    			{
    				src: "portfolio/bond/1.gif",
    				alt: "A screenshot of my project about James Bond.",
    				size: "col-span-4 md:col-span-3 -mt-2"
    			},
    			{
    				src: "portfolio/bond/2.png",
    				alt: "A screenshot of my project about James Bond.",
    				size: "col-span-4 md:col-span-3 mt-4 hidden sm:block"
    			},
    			{
    				src: "portfolio/bond/3.png",
    				alt: "A screenshot of my project about James Bond.",
    				size: "col-span-4 md:col-span-3 mt-7 hidden md:block"
    			},
    			{
    				src: "portfolio/bond/4.png",
    				alt: "A screenshot of my project about James Bond.",
    				size: "col-span-4 md:col-span-3 mt-3 hidden sm:block"
    			}
    		]
    	}
    ];
    var footer = {
    	"email-text": "Say hi",
    	"email-link": "mailto:sam.vickars@gmail.com",
    	links: [
    		{
    			text: "Twitter",
    			link: "https://twitter.com/samvickars"
    		},
    		{
    			text: "Instagram",
    			link: "https://www.instagram.com/samvickars/"
    		},
    		{
    			text: "Github",
    			link: "https://github.com/svickars"
    		}
    	]
    };
    var markup = {
    	headline: headline,
    	pics: pics,
    	lead: lead,
    	intro: intro,
    	conclusion: conclusion,
    	"not-work": [
    	{
    		src: "Colour-Box-Bar.jpeg",
    		title: "Colour Box Bar: a stationary bar I built for my new house."
    	},
    	{
    		src: "Colour-Box-Bar-2.jpeg",
    		title: "Colour Box Bar: a stationary bar I built for my new house."
    	},
    	{
    		src: "Izzys-Big-Day.jpeg",
    		title: "Izzy’s Big Day: My sweet girl at her graduation from (not a) puppy school."
    	},
    	{
    		src: "West-Coast-Headboard.jpeg",
    		title: "West Coast Headboard: a live-edge bed I built and installed."
    	},
    	{
    		src: "San-Josef-Bay.jpeg",
    		title: "San Josef Bay: a trip I took in summer 2020 to Cape Scott, where I camped on the beach at San Josef Bay."
    	},
    	{
    		src: "Employee-of-the-Month.jpeg",
    		title: "Meet Izzy, a 2, 3, or 4 year-old mutt I found wandering around the SPCA in Vancouver."
    	},
    	{
    		src: "IIBA.png",
    		title: "My brother and I celebrating my win at the Information is Beautiful Awards in 2019 in London."
    	},
    	{
    		src: "Oscar-The-Grouch.png",
    		title: "My nephew and I dressed as  a couple of grouches for Halloween: Oscar and Arnold."
    	},
    	{
    		src: "Worlds.png",
    		title: "World Box Lacrosse Championships 2019, Scottish National Team, #42"
    	},
    	{
    		src: "Published.png",
    		title: "My first published book, Globalography."
    	}
    ],
    	work: work,
    	footer: footer
    };

    /* src/components/blocks/Lead.svelte generated by Svelte v3.29.7 */
    const file$1 = "src/components/blocks/Lead.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (8:2) {#each markup.headline as text}
    function create_each_block(ctx) {
    	let h1;
    	let html_tag;
    	let raw_value = /*text*/ ctx[0].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t = claim_space(h1_nodes);
    			h1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(t);
    			attr_dev(h1, "class", "mb-4 font-serif text-4xl font-medium md:text-5xl lg:text-6xl svelte-1yag1o6");
    			add_location(h1, file$1, 8, 4, 245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			html_tag.m(raw_value, h1);
    			append_dev(h1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:2) {#each markup.headline as text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = markup.headline;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "flex flex-col items-start justify-center w-full h-screen max-w-5xl px-8 mx-auto mb-20 animate-pop-up-fast svelte-1yag1o6");
    			add_location(div, file$1, 4, 0, 84);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*markup*/ 0) {
    				each_value = markup.headline;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lead", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lead> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ markup });
    	return [];
    }

    class Lead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lead",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }
    Lead.$compile = {"vars":[{"name":"markup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/components/blocks/Pic.svelte generated by Svelte v3.29.7 */

    const file$2 = "src/components/blocks/Pic.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let div0_class_value;
    	let t;
    	let div1;
    	let div1_resize_listener;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true, style: true, title: true });
    			children(div0).forEach(detach_dev);
    			t = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", div0_class_value = "w-full transition transform bg-center bg-cover rounded-full shadow-" + /*shadow*/ ctx[4] + " filter hover:animate-pop-hover");
    			set_style(div0, "background-image", "url(assets/media" + /*src*/ ctx[2] + ")");
    			set_style(div0, "height", /*clientWidth*/ ctx[5] + "px");
    			attr_dev(div0, "title", /*title*/ ctx[1]);
    			add_location(div0, file$2, 11, 2, 209);
    			attr_dev(div1, "class", "absolute top-0 left-0 w-full");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[6].call(div1));
    			add_location(div1, file$2, 16, 2, 429);
    			attr_dev(div2, "class", div2_class_value = "relative " + /*width*/ ctx[0] + " animate-pop-delay-" + /*i*/ ctx[3] + " opacity-0");
    			add_location(div2, file$2, 10, 0, 144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[6].bind(div1));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*shadow*/ 16 && div0_class_value !== (div0_class_value = "w-full transition transform bg-center bg-cover rounded-full shadow-" + /*shadow*/ ctx[4] + " filter hover:animate-pop-hover")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*src*/ 4) {
    				set_style(div0, "background-image", "url(assets/media" + /*src*/ ctx[2] + ")");
    			}

    			if (dirty & /*clientWidth*/ 32) {
    				set_style(div0, "height", /*clientWidth*/ ctx[5] + "px");
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(div0, "title", /*title*/ ctx[1]);
    			}

    			if (dirty & /*width, i*/ 9 && div2_class_value !== (div2_class_value = "relative " + /*width*/ ctx[0] + " animate-pop-delay-" + /*i*/ ctx[3] + " opacity-0")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			div1_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pic", slots, []);
    	let { width } = $$props;
    	let { title } = $$props;
    	let { src } = $$props;
    	let { i } = $$props;
    	let { shadow = "none" } = $$props;
    	let clientWidth;
    	const writable_props = ["width", "title", "src", "i", "shadow"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pic> was created with unknown prop '${key}'`);
    	});

    	function div1_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(5, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("shadow" in $$props) $$invalidate(4, shadow = $$props.shadow);
    	};

    	$$self.$capture_state = () => ({
    		width,
    		title,
    		src,
    		i,
    		shadow,
    		clientWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("shadow" in $$props) $$invalidate(4, shadow = $$props.shadow);
    		if ("clientWidth" in $$props) $$invalidate(5, clientWidth = $$props.clientWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, title, src, i, shadow, clientWidth, div1_elementresize_handler];
    }

    class Pic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			width: 0,
    			title: 1,
    			src: 2,
    			i: 3,
    			shadow: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pic",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Pic> was created without expected prop 'width'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Pic> was created without expected prop 'title'");
    		}

    		if (/*src*/ ctx[2] === undefined && !("src" in props)) {
    			console.warn("<Pic> was created without expected prop 'src'");
    		}

    		if (/*i*/ ctx[3] === undefined && !("i" in props)) {
    			console.warn("<Pic> was created without expected prop 'i'");
    		}
    	}

    	get width() {
    		throw new Error("<Pic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Pic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Pic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Pic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Pic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Pic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<Pic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<Pic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shadow() {
    		throw new Error("<Pic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shadow(value) {
    		throw new Error("<Pic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Pic.$compile = {"vars":[{"name":"width","export_name":"width","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"title","export_name":"title","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"src","export_name":"src","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"i","export_name":"i","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"shadow","export_name":"shadow","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"clientWidth","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/blocks/Pics.svelte generated by Svelte v3.29.7 */
    const file$3 = "src/components/blocks/Pics.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (17:2) {#each markup.pics as pic, i}
    function create_each_block$1(ctx) {
    	let pic;
    	let current;

    	pic = new Pic({
    			props: {
    				width: /*pic*/ ctx[1].width,
    				title: /*pic*/ ctx[1].alt,
    				src: /*pic*/ ctx[1].src,
    				i: /*i*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pic.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(pic.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pic, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pic.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pic.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pic, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:2) {#each markup.pics as pic, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	let each_value = markup.pics;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "grid w-full grid-flow-col-dense gap-4 px-4 mx-auto cols-4 md:grid-cols-12 max-w-7xl pb-60");
    			add_location(div, file$3, 13, 0, 291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*markup*/ 0) {
    				each_value = markup.pics;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pics", slots, []);
    	let visible = false;

    	setTimeout(
    		() => {
    			visible = true;
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pics> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide, markup, mounted, Pic, visible });

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Pics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pics",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }
    Pics.$compile = {"vars":[{"name":"slide","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"markup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"mounted","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"Pic","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"visible","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true}]};

    /* src/components/blocks/Intro.svelte generated by Svelte v3.29.7 */
    const file$4 = "src/components/blocks/Intro.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (7:4) {#each markup.lead as text}
    function create_each_block_1(ctx) {
    	let h2;
    	let html_tag;
    	let raw_value = /*text*/ ctx[0].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t = claim_space(h2_nodes);
    			h2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(t);
    			attr_dev(h2, "class", "text-2xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-3xl lg:text-4xl svelte-1vygwrh");
    			add_location(h2, file$4, 7, 6, 204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			html_tag.m(raw_value, h2);
    			append_dev(h2, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(7:4) {#each markup.lead as text}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each markup.intro as text}
    function create_each_block$2(ctx) {
    	let p;
    	let html_tag;
    	let raw_value = /*text*/ ctx[0].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t = claim_space(p_nodes);
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(t);
    			attr_dev(p, "class", "mb-8 text-xl font-normal leading-normal opacity-0 animate-pop-up-fast md:text-2xl svelte-1vygwrh");
    			add_location(p, file$4, 17, 6, 448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			html_tag.m(raw_value, p);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:4) {#each markup.intro as text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let each_value_1 = markup.lead;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = markup.intro;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div1_nodes);
    			}

    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "max-w-3xl mb-16");
    			add_location(div0, file$4, 5, 2, 136);
    			attr_dev(div1, "class", "max-w-3xl");
    			add_location(div1, file$4, 15, 2, 385);
    			attr_dev(div2, "class", "w-full max-w-5xl px-8 mx-auto my-60");
    			add_location(div2, file$4, 4, 0, 84);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*markup*/ 0) {
    				each_value_1 = markup.lead;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*markup*/ 0) {
    				each_value = markup.intro;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Intro", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ markup });
    	return [];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }
    Intro.$compile = {"vars":[{"name":"markup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    const filter = writable("selected");

    const projects = derived(filter, ($filter) => {
        let filteredProjects = markup.work.filter(d => d.active !== "false");

        if ($filter !== "all") filteredProjects =  filteredProjects.filter(d => d.filter === $filter);
        if ($filter === "all" || $filter === "not") filteredProjects = filteredProjects.sort((a, b) => {
            a.parsedDate = +`${a.date.split(" ")[1]}${months[a.date.split(" ")[0]]}`;
            b.parsedDate = +`${b.date.split(" ")[1]}${months[b.date.split(" ")[0]]}`;
            
            return a.parsedDate < b.parsedDate ? 1 : a.parsedDate > b.parsedDate ? -1 : 0;
        });
        if ($filter === "selected") filteredProjects = filteredProjects.sort((a, b) => {
            return +a.selected > +b.selected ? 1 : +a.selected < +b.selected ? -1 : 0;
        });

        return filteredProjects;
    });

    const months = {
        "January": "00",
        "February": "01",
        "March": "02",
        "April": "03",
        "May": "04",
        "June": "05",
        "July": "06",
        "August": "07",
        "September": "08",
        "October": "09",
        "November": "10",
        "December": "11"
    };

    /* src/components/helpers/Filter.svelte generated by Svelte v3.29.7 */
    const file$5 = "src/components/helpers/Filter.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[1]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			t = claim_text(div_nodes, /*text*/ ctx[1]);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "mr-2 mb-2 text-base " + (/*val*/ ctx[0] === /*$filter*/ ctx[2]
    			? "font-bold text-green-600"
    			: "font-normal text-gray-300") + " hover:opacity-80 cursor-pointer transition");

    			add_location(div, file$5, 11, 0, 154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*val, $filter*/ 5 && div_class_value !== (div_class_value = "mr-2 mb-2 text-base " + (/*val*/ ctx[0] === /*$filter*/ ctx[2]
    			? "font-bold text-green-600"
    			: "font-normal text-gray-300") + " hover:opacity-80 cursor-pointer transition")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $filter;
    	validate_store(filter, "filter");
    	component_subscribe($$self, filter, $$value => $$invalidate(2, $filter = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Filter", slots, []);
    	let { val } = $$props;
    	let { text } = $$props;

    	function click() {
    		set_store_value(filter, $filter = val, $filter);
    	}

    	const writable_props = ["val", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ filter, val, text, click, $filter });

    	$$self.$inject_state = $$props => {
    		if ("val" in $$props) $$invalidate(0, val = $$props.val);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [val, text, $filter, click];
    }

    class Filter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { val: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filter",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*val*/ ctx[0] === undefined && !("val" in props)) {
    			console.warn("<Filter> was created without expected prop 'val'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<Filter> was created without expected prop 'text'");
    		}
    	}

    	get val() {
    		throw new Error("<Filter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set val(value) {
    		throw new Error("<Filter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Filter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Filter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Filter.$compile = {"vars":[{"name":"filter","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"val","export_name":"val","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"text","export_name":"text","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"click","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$filter","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var copy = (text) => {
        var input = document.createElement('input');
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand('copy');
        document.body.removeChild(input);
        return result;
     };

    const allOpen = writable(false);
    const allClosed = writable(true);
    const whichOpen = writable([]);

    const somethingOpen = derived(whichOpen, ($whichOpen) => {
        return $whichOpen.length > 0 ? true : false;
    });

    /* src/components/helpers/IconText.svelte generated by Svelte v3.29.7 */

    const file$6 = "src/components/helpers/IconText.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let i;
    	let i_class_value;
    	let t;
    	let p;
    	let p_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = space();
    			p = element("p");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			i = claim_element(div_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			p_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", i_class_value = "mr-2 fa-" + /*weight*/ ctx[2] + " fa-" + /*icon*/ ctx[0] + " " + (/*dark*/ ctx[3] ? "text-gray-100" : "text-gray-600"));
    			add_location(i, file$6, 8, 2, 158);
    			attr_dev(p, "class", p_class_value = "text-base " + (/*dark*/ ctx[3] ? "text-gray-100" : "text-gray-600"));
    			add_location(p, file$6, 13, 2, 262);
    			attr_dev(div, "class", "flex flex-row items-center");
    			add_location(div, file$6, 7, 0, 115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    			append_dev(div, p);
    			p.innerHTML = /*text*/ ctx[1];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*weight, icon, dark*/ 13 && i_class_value !== (i_class_value = "mr-2 fa-" + /*weight*/ ctx[2] + " fa-" + /*icon*/ ctx[0] + " " + (/*dark*/ ctx[3] ? "text-gray-100" : "text-gray-600"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*text*/ 2) p.innerHTML = /*text*/ ctx[1];
    			if (dirty & /*dark*/ 8 && p_class_value !== (p_class_value = "text-base " + (/*dark*/ ctx[3] ? "text-gray-100" : "text-gray-600"))) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconText", slots, []);
    	let { icon } = $$props;
    	let { text } = $$props;
    	let { weight = "thin" } = $$props;
    	let { dark = false } = $$props;
    	const writable_props = ["icon", "text", "weight", "dark"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("weight" in $$props) $$invalidate(2, weight = $$props.weight);
    		if ("dark" in $$props) $$invalidate(3, dark = $$props.dark);
    	};

    	$$self.$capture_state = () => ({ icon, text, weight, dark });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("weight" in $$props) $$invalidate(2, weight = $$props.weight);
    		if ("dark" in $$props) $$invalidate(3, dark = $$props.dark);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon, text, weight, dark];
    }

    class IconText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { icon: 0, text: 1, weight: 2, dark: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconText",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<IconText> was created without expected prop 'icon'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<IconText> was created without expected prop 'text'");
    		}
    	}

    	get icon() {
    		throw new Error("<IconText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<IconText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<IconText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<IconText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weight() {
    		throw new Error("<IconText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weight(value) {
    		throw new Error("<IconText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<IconText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<IconText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    IconText.$compile = {"vars":[{"name":"icon","export_name":"icon","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"text","export_name":"text","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"weight","export_name":"weight","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"dark","export_name":"dark","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/helpers/Link.svelte generated by Svelte v3.29.7 */

    const file$7 = "src/components/helpers/Link.svelte";

    function create_fragment$8(ctx) {
    	let a;
    	let div;
    	let i0;
    	let i0_class_value;
    	let t0;
    	let p;
    	let raw_value = /*link*/ ctx[0].text + "";
    	let p_class_value;
    	let t1;
    	let i1;
    	let i1_class_value;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			i0 = element("i");
    			t0 = space();
    			p = element("p");
    			t1 = space();
    			i1 = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, class: true, target: true });
    			var a_nodes = children(a);
    			div = claim_element(a_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			i0 = claim_element(div_nodes, "I", { class: true });
    			children(i0).forEach(detach_dev);
    			t0 = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			i1 = claim_element(div_nodes, "I", { class: true });
    			children(i1).forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i0, "class", i0_class_value = "mr-2 fa-light fa-external-link " + (/*dark*/ ctx[1] ? "text-gray-100" : "text-gray-600"));
    			add_location(i0, file$7, 15, 4, 260);

    			attr_dev(p, "class", p_class_value = "text-base " + (/*dark*/ ctx[1] ? "text-gray-100" : "text-gray-600") + " transition " + (/*hover*/ ctx[2]
    			? /*dark*/ ctx[1] ? "text-blue-200" : "text-blue-500"
    			: ""));

    			add_location(p, file$7, 20, 4, 378);

    			attr_dev(i1, "class", i1_class_value = "ml-1 fa-thin fa-arrow-right " + (/*hover*/ ctx[2]
    			? "transform translate-x-1 {dark ? \"text-blue-200\": \"text-blue-500\"}"
    			: "") + " transition");

    			add_location(i1, file$7, 31, 4, 610);
    			attr_dev(div, "class", "flex flex-row items-center");
    			add_location(div, file$7, 14, 2, 215);
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[0].href);
    			attr_dev(a, "class", "no-underline");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$7, 7, 0, 72);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, i0);
    			append_dev(div, t0);
    			append_dev(div, p);
    			p.innerHTML = raw_value;
    			append_dev(div, t1);
    			append_dev(div, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[3], false, false, false),
    					listen_dev(a, "mouseout", /*mouseout_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dark*/ 2 && i0_class_value !== (i0_class_value = "mr-2 fa-light fa-external-link " + (/*dark*/ ctx[1] ? "text-gray-100" : "text-gray-600"))) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (dirty & /*link*/ 1 && raw_value !== (raw_value = /*link*/ ctx[0].text + "")) p.innerHTML = raw_value;
    			if (dirty & /*dark, hover*/ 6 && p_class_value !== (p_class_value = "text-base " + (/*dark*/ ctx[1] ? "text-gray-100" : "text-gray-600") + " transition " + (/*hover*/ ctx[2]
    			? /*dark*/ ctx[1] ? "text-blue-200" : "text-blue-500"
    			: ""))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*hover*/ 4 && i1_class_value !== (i1_class_value = "ml-1 fa-thin fa-arrow-right " + (/*hover*/ ctx[2]
    			? "transform translate-x-1 {dark ? \"text-blue-200\": \"text-blue-500\"}"
    			: "") + " transition")) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*link*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[0].href)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, []);
    	let { link } = $$props;
    	let { dark } = $$props;
    	let hover;
    	const writable_props = ["link", "dark"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = () => $$invalidate(2, hover = true);
    	const mouseout_handler = () => $$invalidate(2, hover = false);

    	$$self.$$set = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("dark" in $$props) $$invalidate(1, dark = $$props.dark);
    	};

    	$$self.$capture_state = () => ({ link, dark, hover });

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("dark" in $$props) $$invalidate(1, dark = $$props.dark);
    		if ("hover" in $$props) $$invalidate(2, hover = $$props.hover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, dark, hover, mouseover_handler, mouseout_handler];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { link: 0, dark: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !("link" in props)) {
    			console.warn("<Link> was created without expected prop 'link'");
    		}

    		if (/*dark*/ ctx[1] === undefined && !("dark" in props)) {
    			console.warn("<Link> was created without expected prop 'dark'");
    		}
    	}

    	get link() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Link.$compile = {"vars":[{"name":"link","export_name":"link","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"dark","export_name":"dark","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"hover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/helpers/Launch.svelte generated by Svelte v3.29.7 */

    const file$8 = "src/components/helpers/Launch.svelte";

    function create_fragment$9(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let i;
    	let i_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { class: true, href: true, target: true });
    			var a_nodes = children(a);
    			div1 = claim_element(a_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true, style: true });
    			var div0_nodes = children(div0);
    			t0 = claim_text(div0_nodes, /*text*/ ctx[0]);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			i = claim_element(div1_nodes, "I", { class: true, style: true });
    			children(i).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "font-serif text-2xl transition");

    			set_style(div0, "color", /*hover*/ ctx[3]
    			? "rgba(59, 130, 246, 1)"
    			: /*colour*/ ctx[2]);

    			add_location(div0, file$8, 16, 4, 325);

    			attr_dev(i, "class", i_class_value = "ml-2 fa-thin transition fa-lg fa-" + (/*hover*/ ctx[3]
    			? "rocket-launch transform translate-x-1 -translate-y-1"
    			: "rocket"));

    			set_style(i, "color", /*hover*/ ctx[3]
    			? "rgba(59, 130, 246, 1)"
    			: /*colour*/ ctx[2]);

    			add_location(i, file$8, 22, 4, 473);
    			attr_dev(div1, "class", "flex items-center justify-center my-16 cursor-pointer");
    			add_location(div1, file$8, 15, 2, 253);
    			attr_dev(a, "class", "no-underline");
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$8, 8, 0, 120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, i);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(a, "mouseout", /*mouseout_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);

    			if (dirty & /*hover, colour*/ 12) {
    				set_style(div0, "color", /*hover*/ ctx[3]
    				? "rgba(59, 130, 246, 1)"
    				: /*colour*/ ctx[2]);
    			}

    			if (dirty & /*hover*/ 8 && i_class_value !== (i_class_value = "ml-2 fa-thin transition fa-lg fa-" + (/*hover*/ ctx[3]
    			? "rocket-launch transform translate-x-1 -translate-y-1"
    			: "rocket"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*hover, colour*/ 12) {
    				set_style(i, "color", /*hover*/ ctx[3]
    				? "rgba(59, 130, 246, 1)"
    				: /*colour*/ ctx[2]);
    			}

    			if (dirty & /*href*/ 2) {
    				attr_dev(a, "href", /*href*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Launch", slots, []);
    	let { text = "Launch Project" } = $$props;
    	let { href } = $$props;
    	let { colour } = $$props;
    	let hover = false;
    	const writable_props = ["text", "href", "colour"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Launch> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = () => $$invalidate(3, hover = true);
    	const mouseout_handler = () => $$invalidate(3, hover = false);

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    		if ("colour" in $$props) $$invalidate(2, colour = $$props.colour);
    	};

    	$$self.$capture_state = () => ({ text, href, colour, hover });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    		if ("colour" in $$props) $$invalidate(2, colour = $$props.colour);
    		if ("hover" in $$props) $$invalidate(3, hover = $$props.hover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, href, colour, hover, mouseover_handler, mouseout_handler];
    }

    class Launch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { text: 0, href: 1, colour: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Launch",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*href*/ ctx[1] === undefined && !("href" in props)) {
    			console.warn("<Launch> was created without expected prop 'href'");
    		}

    		if (/*colour*/ ctx[2] === undefined && !("colour" in props)) {
    			console.warn("<Launch> was created without expected prop 'colour'");
    		}
    	}

    	get text() {
    		throw new Error("<Launch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Launch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Launch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Launch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colour() {
    		throw new Error("<Launch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colour(value) {
    		throw new Error("<Launch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Launch.$compile = {"vars":[{"name":"text","export_name":"text","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"href","export_name":"href","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"colour","export_name":"colour","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"hover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    var random = (min, max) => Math.floor(Math.random() * (max - min) + min);

    /* src/components/helpers/Asset.svelte generated by Svelte v3.29.7 */
    const file$9 = "src/components/helpers/Asset.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let img_height_value;
    	let img_class_value;
    	let t;
    	let div0;
    	let div0_resize_listener;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t = space();
    			div0 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true, style: true });
    			var div1_nodes = children(div1);

    			img = claim_element(div1_nodes, "IMG", {
    				alt: true,
    				src: true,
    				height: true,
    				class: true
    			});

    			t = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(img, "alt", /*title*/ ctx[1]);
    			if (img.src !== (img_src_value = `assets/media/${/*src*/ ctx[2]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", img_height_value = /*clientWidth*/ ctx[5] * 0.75);
    			attr_dev(img, "class", img_class_value = "w-full transition rounded shadow-" + /*shadow*/ ctx[4] + " filter");
    			add_location(img, file$9, 16, 2, 334);
    			attr_dev(div0, "class", "absolute top-0 left-0 w-full");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[6].call(div0));
    			add_location(div0, file$9, 22, 2, 487);
    			attr_dev(div1, "class", div1_class_value = "relative " + /*width*/ ctx[0] + " animate-pop-delay-" + /*i*/ ctx[3] + " opacity-0");
    			set_style(div1, "margin-top", random(-12, 32) + "px");
    			set_style(div1, "min-height", /*clientWidth*/ ctx[5] * 0.75 + "px");
    			add_location(div1, file$9, 12, 0, 188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[6].bind(div0));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) {
    				attr_dev(img, "alt", /*title*/ ctx[1]);
    			}

    			if (dirty & /*src*/ 4 && img.src !== (img_src_value = `assets/media/${/*src*/ ctx[2]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*clientWidth*/ 32 && img_height_value !== (img_height_value = /*clientWidth*/ ctx[5] * 0.75)) {
    				attr_dev(img, "height", img_height_value);
    			}

    			if (dirty & /*shadow*/ 16 && img_class_value !== (img_class_value = "w-full transition rounded shadow-" + /*shadow*/ ctx[4] + " filter")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*width, i*/ 9 && div1_class_value !== (div1_class_value = "relative " + /*width*/ ctx[0] + " animate-pop-delay-" + /*i*/ ctx[3] + " opacity-0")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*clientWidth*/ 32) {
    				set_style(div1, "min-height", /*clientWidth*/ ctx[5] * 0.75 + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			div0_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Asset", slots, []);
    	let { width } = $$props;
    	let { title } = $$props;
    	let { src } = $$props;
    	let { i } = $$props;
    	let { shadow = "none" } = $$props;
    	let clientWidth;
    	const writable_props = ["width", "title", "src", "i", "shadow"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Asset> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		$$invalidate(5, clientWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("shadow" in $$props) $$invalidate(4, shadow = $$props.shadow);
    	};

    	$$self.$capture_state = () => ({
    		random,
    		width,
    		title,
    		src,
    		i,
    		shadow,
    		clientWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("i" in $$props) $$invalidate(3, i = $$props.i);
    		if ("shadow" in $$props) $$invalidate(4, shadow = $$props.shadow);
    		if ("clientWidth" in $$props) $$invalidate(5, clientWidth = $$props.clientWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, title, src, i, shadow, clientWidth, div0_elementresize_handler];
    }

    class Asset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			width: 0,
    			title: 1,
    			src: 2,
    			i: 3,
    			shadow: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Asset",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Asset> was created without expected prop 'width'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Asset> was created without expected prop 'title'");
    		}

    		if (/*src*/ ctx[2] === undefined && !("src" in props)) {
    			console.warn("<Asset> was created without expected prop 'src'");
    		}

    		if (/*i*/ ctx[3] === undefined && !("i" in props)) {
    			console.warn("<Asset> was created without expected prop 'i'");
    		}
    	}

    	get width() {
    		throw new Error("<Asset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Asset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Asset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Asset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Asset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Asset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<Asset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<Asset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shadow() {
    		throw new Error("<Asset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shadow(value) {
    		throw new Error("<Asset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Asset.$compile = {"vars":[{"name":"random","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"width","export_name":"width","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"title","export_name":"title","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"src","export_name":"src","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"i","export_name":"i","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"shadow","export_name":"shadow","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"clientWidth","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/blocks/Project.svelte generated by Svelte v3.29.7 */
    const file$a = "src/components/blocks/Project.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    // (102:10) {#if project.type || project.client}
    function create_if_block_12(ctx) {
    	let h5;
    	let t0_value = (/*project*/ ctx[0].type || /*project*/ ctx[0].client) + "";
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*project*/ ctx[0]["type-icon"] && create_if_block_13(ctx);

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h5 = claim_element(nodes, "H5", { class: true });
    			var h5_nodes = children(h5);
    			t0 = claim_text(h5_nodes, t0_value);
    			h5_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h5, "class", "order-1 text-gray-300 md:text-right md:order-2");
    			add_location(h5, file$a, 102, 12, 2943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1 && t0_value !== (t0_value = (/*project*/ ctx[0].type || /*project*/ ctx[0].client) + "")) set_data_dev(t0, t0_value);

    			if (/*project*/ ctx[0]["type-icon"]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_13(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(102:10) {#if project.type || project.client}",
    		ctx
    	});

    	return block;
    }

    // (106:12) {#if project["type-icon"]}
    function create_if_block_13(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", i_class_value = "mr-2 text-gray-500 fa-thin fa-" + /*project*/ ctx[0]["type-icon"]);
    			add_location(i, file$a, 106, 14, 3121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1 && i_class_value !== (i_class_value = "mr-2 text-gray-500 fa-thin fa-" + /*project*/ ctx[0]["type-icon"])) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(106:12) {#if project[\\\"type-icon\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (112:6) {#if directLinkVisible}
    function create_if_block_10(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_11, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*copied*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if_block.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "absolute hidden transition transform -translate-y-1/2 cursor-pointer lg:block -right-4 top-1/2 hover:opacity-80");
    			add_location(div, file$a, 112, 8, 3288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*copyToClipboard*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(112:6) {#if directLinkVisible}",
    		ctx
    	});

    	return block;
    }

    // (123:10) {:else}
    function create_else_block(ctx) {
    	let i;
    	let i_transition;
    	let current;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "absolute transition transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fa-thin fa-link");
    			add_location(i, file$a, 123, 12, 3734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, true);
    				i_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, false);
    			i_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching && i_transition) i_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(123:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (118:10) {#if copied}
    function create_if_block_11(ctx) {
    	let i;
    	let i_transition;
    	let current;

    	const block = {
    		c: function create() {
    			i = element("i");
    			this.h();
    		},
    		l: function claim(nodes) {
    			i = claim_element(nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", "absolute transition transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fa-thin fa-file-check");
    			add_location(i, file$a, 118, 12, 3531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, true);
    				i_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, false);
    			i_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching && i_transition) i_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(118:10) {#if copied}",
    		ctx
    	});

    	return block;
    }

    // (133:2) {#if open}
    function create_if_block$1(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div3;
    	let div2;
    	let t8;
    	let div4_transition;
    	let current;
    	let if_block0 = /*project*/ ctx[0].links && create_if_block_9(ctx);
    	let if_block1 = /*project*/ ctx[0].date && create_if_block_8(ctx);
    	let if_block2 = /*project*/ ctx[0].class && create_if_block_7(ctx);
    	let if_block3 = /*project*/ ctx[0].client && create_if_block_6(ctx);
    	let if_block4 = /*project*/ ctx[0].role && create_if_block_5(ctx);
    	let if_block5 = /*project*/ ctx[0].with && create_if_block_4(ctx);
    	let if_block6 = /*project*/ ctx[0].awards && create_if_block_3(ctx);
    	let if_block7 = /*project*/ ctx[0].media && create_if_block_2$1(ctx);
    	let each_value = /*project*/ ctx[0].description;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	let if_block8 = /*project*/ ctx[0].links && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			if (if_block8) if_block8.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", {});
    			var div4_nodes = children(div4);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true, style: true });
    			var div0_nodes = children(div0);
    			if (if_block0) if_block0.l(div0_nodes);
    			t0 = claim_space(div0_nodes);
    			if (if_block1) if_block1.l(div0_nodes);
    			t1 = claim_space(div0_nodes);
    			if (if_block2) if_block2.l(div0_nodes);
    			t2 = claim_space(div0_nodes);
    			if (if_block3) if_block3.l(div0_nodes);
    			t3 = claim_space(div0_nodes);
    			if (if_block4) if_block4.l(div0_nodes);
    			t4 = claim_space(div0_nodes);
    			if (if_block5) if_block5.l(div0_nodes);
    			t5 = claim_space(div0_nodes);
    			if (if_block6) if_block6.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t6 = claim_space(div4_nodes);
    			if (if_block7) if_block7.l(div4_nodes);
    			t7 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { style: true });
    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			t8 = claim_space(div2_nodes);
    			if (if_block8) if_block8.l(div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "flex flex-col w-full mb-4 lg:flex-row lg:flex-wrap");
    			set_style(div0, "padding-left", /*arrowW*/ ctx[7] + 12 + "px");
    			add_location(div0, file$a, 135, 8, 4068);
    			attr_dev(div1, "class", "w-full max-w-5xl px-8 mx-auto -mt-6");
    			add_location(div1, file$a, 134, 6, 4010);
    			set_style(div2, "padding-left", /*arrowW*/ ctx[7] + 12 + "px");
    			add_location(div2, file$a, 210, 8, 6344);
    			attr_dev(div3, "class", "w-full max-w-5xl px-8 pb-6 mx-auto");
    			add_location(div3, file$a, 209, 6, 6287);
    			add_location(div4, file$a, 133, 4, 3981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div0, t4);
    			if (if_block5) if_block5.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block6) if_block6.m(div0, null);
    			append_dev(div4, t6);
    			if (if_block7) if_block7.m(div4, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t8);
    			if (if_block8) if_block8.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*project*/ ctx[0].links) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].date) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].class) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div0, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].client) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div0, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].role) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div0, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].with) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div0, t5);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*project*/ ctx[0].awards) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_3(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div0, null);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*arrowW*/ 128) {
    				set_style(div0, "padding-left", /*arrowW*/ ctx[7] + 12 + "px");
    			}

    			if (/*project*/ ctx[0].media) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_2$1(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div4, t7);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*project*/ 1) {
    				each_value = /*project*/ ctx[0].description;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*project*/ ctx[0].links) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*project*/ 1) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_1$1(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div2, null);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*arrowW*/ 128) {
    				set_style(div2, "padding-left", /*arrowW*/ ctx[7] + 12 + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block8) if_block8.d();
    			if (detaching && div4_transition) div4_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(133:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (140:10) {#if project.links}
    function create_if_block_9(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_3 = /*project*/ ctx[0].links;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				each_value_3 = /*project*/ ctx[0].links;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(140:10) {#if project.links}",
    		ctx
    	});

    	return block;
    }

    // (141:12) {#each project.links as link}
    function create_each_block_3(ctx) {
    	let div;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				link: /*link*/ ctx[29],
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(link.$$.fragment);
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(link.$$.fragment, div_nodes);
    			t = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 141, 14, 4286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(link, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty[0] & /*project*/ 1) link_changes.link = /*link*/ ctx[29];
    			if (dirty[0] & /*project*/ 1) link_changes.dark = /*project*/ ctx[0].dark;
    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(141:12) {#each project.links as link}",
    		ctx
    	});

    	return block;
    }

    // (147:10) {#if project.date}
    function create_if_block_8(ctx) {
    	let div;
    	let icontext;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*project*/ ctx[0].date,
    				icon: "calendar-range",
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 147, 12, 4463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*project*/ ctx[0].date;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(147:10) {#if project.date}",
    		ctx
    	});

    	return block;
    }

    // (156:10) {#if project.class}
    function create_if_block_7(ctx) {
    	let div;
    	let icontext;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*project*/ ctx[0].class,
    				icon: "graduation-cap",
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 156, 12, 4718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*project*/ ctx[0].class;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(156:10) {#if project.class}",
    		ctx
    	});

    	return block;
    }

    // (165:10) {#if project.client}
    function create_if_block_6(ctx) {
    	let div;
    	let icontext;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*project*/ ctx[0].client,
    				icon: "sack-dollar",
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 165, 12, 4975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*project*/ ctx[0].client;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(165:10) {#if project.client}",
    		ctx
    	});

    	return block;
    }

    // (174:10) {#if project.role}
    function create_if_block_5(ctx) {
    	let div;
    	let icontext;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*project*/ ctx[0].role,
    				icon: "user-helmet-safety",
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 174, 12, 5228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*project*/ ctx[0].role;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(174:10) {#if project.role}",
    		ctx
    	});

    	return block;
    }

    // (183:10) {#if project.with}
    function create_if_block_4(ctx) {
    	let div;
    	let icontext;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*project*/ ctx[0].with,
    				icon: "users",
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 183, 12, 5486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*project*/ ctx[0].with;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(183:10) {#if project.with}",
    		ctx
    	});

    	return block;
    }

    // (188:10) {#if project.awards}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*project*/ ctx[0].awards;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				each_value_2 = /*project*/ ctx[0].awards;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(188:10) {#if project.awards}",
    		ctx
    	});

    	return block;
    }

    // (189:12) {#each project.awards as award}
    function create_each_block_2(ctx) {
    	let div;
    	let icontext;
    	let t;
    	let current;

    	icontext = new IconText({
    			props: {
    				text: /*award*/ ctx[26].text,
    				icon: /*award*/ ctx[26].icon,
    				dark: /*project*/ ctx[0].dark
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icontext.$$.fragment);
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(icontext.$$.fragment, div_nodes);
    			t = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "mb-2 lg:mr-6");
    			add_location(div, file$a, 189, 14, 5717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icontext, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icontext_changes = {};
    			if (dirty[0] & /*project*/ 1) icontext_changes.text = /*award*/ ctx[26].text;
    			if (dirty[0] & /*project*/ 1) icontext_changes.icon = /*award*/ ctx[26].icon;
    			if (dirty[0] & /*project*/ 1) icontext_changes.dark = /*project*/ ctx[0].dark;
    			icontext.$set(icontext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icontext);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(189:12) {#each project.awards as award}",
    		ctx
    	});

    	return block;
    }

    // (201:6) {#if project.media}
    function create_if_block_2$1(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*project*/ ctx[0].media;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "grid w-full gap-4 px-4 mx-auto my-16 cols-4 md:grid-cols-12 max-w-7xl");
    			add_location(div, file$a, 201, 8, 6018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1) {
    				each_value_1 = /*project*/ ctx[0].media;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(201:6) {#if project.media}",
    		ctx
    	});

    	return block;
    }

    // (205:10) {#each project.media as pic, i}
    function create_each_block_1$1(ctx) {
    	let asset;
    	let current;

    	asset = new Asset({
    			props: {
    				width: /*pic*/ ctx[23].size,
    				title: /*pic*/ ctx[23].alt,
    				src: /*pic*/ ctx[23].src,
    				i: /*i*/ ctx[25]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(asset.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(asset.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(asset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const asset_changes = {};
    			if (dirty[0] & /*project*/ 1) asset_changes.width = /*pic*/ ctx[23].size;
    			if (dirty[0] & /*project*/ 1) asset_changes.title = /*pic*/ ctx[23].alt;
    			if (dirty[0] & /*project*/ 1) asset_changes.src = /*pic*/ ctx[23].src;
    			asset.$set(asset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(asset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(asset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(asset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(205:10) {#each project.media as pic, i}",
    		ctx
    	});

    	return block;
    }

    // (212:10) {#each project.description as text}
    function create_each_block$3(ctx) {
    	let p;
    	let raw_value = /*text*/ ctx[20].value + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			p_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "max-w-3xl mb-4 font-sans text-base leading-relaxed md:text-lg lg:text-xl svelte-u4k8rp");
    			add_location(p, file$a, 212, 12, 6446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*project*/ 1 && raw_value !== (raw_value = /*text*/ ctx[20].value + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(212:10) {#each project.description as text}",
    		ctx
    	});

    	return block;
    }

    // (219:10) {#if project.links}
    function create_if_block_1$1(ctx) {
    	let launch;
    	let current;

    	launch = new Launch({
    			props: {
    				colour: /*project*/ ctx[0].dark
    				? "white"
    				: /*project*/ ctx[0].color,
    				href: /*project*/ ctx[0].links[0].href
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(launch.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(launch.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(launch, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const launch_changes = {};

    			if (dirty[0] & /*project*/ 1) launch_changes.colour = /*project*/ ctx[0].dark
    			? "white"
    			: /*project*/ ctx[0].color;

    			if (dirty[0] & /*project*/ 1) launch_changes.href = /*project*/ ctx[0].links[0].href;
    			launch.$set(launch_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(launch.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(launch.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(launch, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(219:10) {#if project.links}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let i;
    	let i_class_value;
    	let i_resize_listener;
    	let t0;
    	let h3;
    	let raw_value = /*project*/ ctx[0].title + "";
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div5_class_value;
    	let div5_id_value;
    	let div5_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = (/*project*/ ctx[0].type || /*project*/ ctx[0].client) && create_if_block_12(ctx);
    	let if_block1 = /*directLinkVisible*/ ctx[4] && create_if_block_10(ctx);
    	let if_block2 = /*open*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			h3 = element("h3");
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div5 = claim_element(nodes, "DIV", { class: true, id: true });
    			var div5_nodes = children(div5);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			i = claim_element(div0_nodes, "I", { class: true });
    			children(i).forEach(detach_dev);
    			t0 = claim_space(div0_nodes);
    			h3 = claim_element(div0_nodes, "H3", { class: true, style: true });
    			var h3_nodes = children(h3);
    			h3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			if (if_block0) if_block0.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			if (if_block1) if_block1.l(div3_nodes);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t3 = claim_space(div5_nodes);
    			if (if_block2) if_block2.l(div5_nodes);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(i, "class", i_class_value = "mr-3 fa-thin fa-xl fa-arrow-right transition cursor-pointer " + (/*hover*/ ctx[2] && !/*open*/ ctx[3]
    			? "transform translate-x-1"
    			: "") + " " + (/*open*/ ctx[3] ? "transform rotate-90" : ""));

    			add_render_callback(() => /*i_elementresize_handler*/ ctx[13].call(i));
    			add_location(i, file$a, 84, 10, 2225);
    			attr_dev(h3, "class", "font-serif text-2xl transition cursor-pointer md:text-3xl lg:text-4xl hover:text-blue-500");

    			set_style(h3, "color", /*hover*/ ctx[2] || /*open*/ ctx[3]
    			? "inherit"
    			: /*project*/ ctx[0].color);

    			add_location(h3, file$a, 91, 10, 2495);
    			attr_dev(div0, "class", "flex flex-row items-center order-2 md:order-1");
    			add_location(div0, file$a, 83, 8, 2155);
    			attr_dev(div1, "class", "flex flex-row items-center flex-shrink-0 order-1 mb-2 ml-9 md:order-2 md:mb-0 md:ml-0");
    			add_location(div1, file$a, 98, 8, 2765);
    			attr_dev(div2, "class", "flex flex-col items-start justify-start mb-4 cursor-pointer md:items-center md:justify-between md:flex-row");
    			add_location(div2, file$a, 77, 6, 1922);
    			attr_dev(div3, "class", "relative");
    			add_location(div3, file$a, 76, 4, 1893);
    			attr_dev(div4, "class", "w-full max-w-5xl px-8 py-6 mx-auto");
    			add_location(div4, file$a, 75, 2, 1840);

    			attr_dev(div5, "class", div5_class_value = "w-full transition border-b-2 border-white " + (/*open*/ ctx[3] && /*project*/ ctx[0].dark
    			? `bg-${/*project*/ ctx[0].bg} text-white`
    			: /*open*/ ctx[3] ? "bg-gray-50" : "bg-white"));

    			attr_dev(div5, "id", div5_id_value = /*project*/ ctx[0].id);
    			add_location(div5, file$a, 63, 0, 1497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i);
    			i_resize_listener = add_resize_listener(i, /*i_elementresize_handler*/ ctx[13].bind(i));
    			append_dev(div0, t0);
    			append_dev(div0, h3);
    			h3.innerHTML = raw_value;
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t2);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div5, t3);
    			if (if_block2) if_block2.m(div5, null);
    			/*div5_binding*/ ctx[16](div5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "mouseover", /*mouseover*/ ctx[8], false, false, false),
    					listen_dev(div2, "mouseout", /*mouseout*/ ctx[9], false, false, false),
    					listen_dev(div2, "click", /*click*/ ctx[1], false, false, false),
    					listen_dev(div5, "mouseover", /*mouseover_handler*/ ctx[14], false, false, false),
    					listen_dev(div5, "mouseout", /*mouseout_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*hover, open*/ 12 && i_class_value !== (i_class_value = "mr-3 fa-thin fa-xl fa-arrow-right transition cursor-pointer " + (/*hover*/ ctx[2] && !/*open*/ ctx[3]
    			? "transform translate-x-1"
    			: "") + " " + (/*open*/ ctx[3] ? "transform rotate-90" : ""))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if ((!current || dirty[0] & /*project*/ 1) && raw_value !== (raw_value = /*project*/ ctx[0].title + "")) h3.innerHTML = raw_value;
    			if (!current || dirty[0] & /*hover, open, project*/ 13) {
    				set_style(h3, "color", /*hover*/ ctx[2] || /*open*/ ctx[3]
    				? "inherit"
    				: /*project*/ ctx[0].color);
    			}

    			if (/*project*/ ctx[0].type || /*project*/ ctx[0].client) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*directLinkVisible*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*directLinkVisible*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*open*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*open*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*open, project*/ 9 && div5_class_value !== (div5_class_value = "w-full transition border-b-2 border-white " + (/*open*/ ctx[3] && /*project*/ ctx[0].dark
    			? `bg-${/*project*/ ctx[0].bg} text-white`
    			: /*open*/ ctx[3] ? "bg-gray-50" : "bg-white"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (!current || dirty[0] & /*project*/ 1 && div5_id_value !== (div5_id_value = /*project*/ ctx[0].id)) {
    				attr_dev(div5, "id", div5_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);

    			add_render_callback(() => {
    				if (!div5_transition) div5_transition = create_bidirectional_transition(div5, slide, {}, true);
    				div5_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			if (!div5_transition) div5_transition = create_bidirectional_transition(div5, slide, {}, false);
    			div5_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			i_resize_listener();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*div5_binding*/ ctx[16](null);
    			if (detaching && div5_transition) div5_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $whichOpen;
    	let $scrollY;
    	let $currentProject;
    	validate_store(whichOpen, "whichOpen");
    	component_subscribe($$self, whichOpen, $$value => $$invalidate(17, $whichOpen = $$value));
    	validate_store(scrollY, "scrollY");
    	component_subscribe($$self, scrollY, $$value => $$invalidate(18, $scrollY = $$value));
    	validate_store(currentProject, "currentProject");
    	component_subscribe($$self, currentProject, $$value => $$invalidate(19, $currentProject = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project", slots, []);
    	let { project } = $$props;
    	let hover, open, directLinkVisible, copied, container, arrowW;

    	function mouseover() {
    		$$invalidate(2, hover = true);
    	}

    	function mouseout() {
    		$$invalidate(2, hover = false);
    	}

    	const openProject = () => $$invalidate(3, open = true);
    	const closeProject = () => $$invalidate(3, open = false);

    	const click = () => {
    		$$invalidate(3, open = !open);

    		if (open) {
    			set_store_value(whichOpen, $whichOpen = [...$whichOpen, project.id], $whichOpen);

    			setTimeout(
    				() => {
    					window.scrollTo({
    						top: container.getBoundingClientRect().y + $scrollY,
    						left: 0,
    						behavior: "smooth"
    					});
    				},
    				500
    			);
    		} else {
    			set_store_value(whichOpen, $whichOpen = $whichOpen.filter(d => d !== project.id), $whichOpen);
    		}
    	};

    	function copyToClipboard() {
    		let timeout;
    		clearTimeout(timeout);
    		copy(`${window.location.host}?project=${project.id}`);
    		$$invalidate(5, copied = true);

    		timeout = setTimeout(
    			() => {
    				$$invalidate(5, copied = false);
    			},
    			1000
    		);
    	}

    	onMount(() => {
    		if ($currentProject === project.id) {
    			click();
    		}
    	});

    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	function i_elementresize_handler() {
    		arrowW = this.clientWidth;
    		$$invalidate(7, arrowW);
    	}

    	const mouseover_handler = () => $$invalidate(4, directLinkVisible = open ? true : false);
    	const mouseout_handler = () => $$invalidate(4, directLinkVisible = false);

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(6, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		slide,
    		fade,
    		copy,
    		whichOpen,
    		currentProject,
    		scrollY,
    		windowH,
    		IconText,
    		Link,
    		Launch,
    		Asset,
    		project,
    		hover,
    		open,
    		directLinkVisible,
    		copied,
    		container,
    		arrowW,
    		mouseover,
    		mouseout,
    		openProject,
    		closeProject,
    		click,
    		copyToClipboard,
    		$whichOpen,
    		$scrollY,
    		$currentProject
    	});

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("hover" in $$props) $$invalidate(2, hover = $$props.hover);
    		if ("open" in $$props) $$invalidate(3, open = $$props.open);
    		if ("directLinkVisible" in $$props) $$invalidate(4, directLinkVisible = $$props.directLinkVisible);
    		if ("copied" in $$props) $$invalidate(5, copied = $$props.copied);
    		if ("container" in $$props) $$invalidate(6, container = $$props.container);
    		if ("arrowW" in $$props) $$invalidate(7, arrowW = $$props.arrowW);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		project,
    		click,
    		hover,
    		open,
    		directLinkVisible,
    		copied,
    		container,
    		arrowW,
    		mouseover,
    		mouseout,
    		copyToClipboard,
    		openProject,
    		closeProject,
    		i_elementresize_handler,
    		mouseover_handler,
    		mouseout_handler,
    		div5_binding
    	];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				project: 0,
    				openProject: 11,
    				closeProject: 12,
    				click: 1
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<Project> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openProject() {
    		return this.$$.ctx[11];
    	}

    	set openProject(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeProject() {
    		return this.$$.ctx[12];
    	}

    	set closeProject(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get click() {
    		return this.$$.ctx[1];
    	}

    	set click(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    Project.$compile = {"vars":[{"name":"onMount","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"slide","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"fade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"copy","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"whichOpen","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"currentProject","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"scrollY","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"windowH","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"IconText","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Link","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Launch","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Asset","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"project","export_name":"project","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"hover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"open","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"directLinkVisible","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"copied","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"container","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"arrowW","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"mouseover","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"mouseout","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"openProject","export_name":"openProject","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"closeProject","export_name":"closeProject","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":false},{"name":"click","export_name":"click","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"copyToClipboard","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$whichOpen","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$scrollY","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$currentProject","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false}]};

    /* src/components/blocks/NotWork.svelte generated by Svelte v3.29.7 */

    const file$b = "src/components/blocks/NotWork.svelte";

    function create_fragment$c(ctx) {
    	let img;
    	let img_src_value;
    	let img_title_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", {
    				src: true,
    				title: true,
    				alt: true,
    				class: true
    			});

    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = "assets/media/not-work/" + /*pic*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "title", img_title_value = /*pic*/ ctx[0].title);
    			attr_dev(img, "alt", img_alt_value = /*pic*/ ctx[0].title);
    			attr_dev(img, "class", "mb-4 rounded animate-pop-delay-1");
    			add_location(img, file$b, 4, 0, 38);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pic*/ 1 && img.src !== (img_src_value = "assets/media/not-work/" + /*pic*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*pic*/ 1 && img_title_value !== (img_title_value = /*pic*/ ctx[0].title)) {
    				attr_dev(img, "title", img_title_value);
    			}

    			if (dirty & /*pic*/ 1 && img_alt_value !== (img_alt_value = /*pic*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotWork", slots, []);
    	let { pic } = $$props;
    	const writable_props = ["pic"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotWork> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("pic" in $$props) $$invalidate(0, pic = $$props.pic);
    	};

    	$$self.$capture_state = () => ({ pic });

    	$$self.$inject_state = $$props => {
    		if ("pic" in $$props) $$invalidate(0, pic = $$props.pic);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pic];
    }

    class NotWork extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { pic: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotWork",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pic*/ ctx[0] === undefined && !("pic" in props)) {
    			console.warn("<NotWork> was created without expected prop 'pic'");
    		}
    	}

    	get pic() {
    		throw new Error("<NotWork>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pic(value) {
    		throw new Error("<NotWork>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }
    NotWork.$compile = {"vars":[{"name":"pic","export_name":"pic","injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/blocks/Portfolio.svelte generated by Svelte v3.29.7 */
    const file$c = "src/components/blocks/Portfolio.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (67:2) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*$projects*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects, projectChildren*/ 17) {
    				each_value_1 = /*$projects*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(67:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if $filter === "not"}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	let each_value = markup["not-work"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "box-border max-w-5xl px-8 mx-auto md:masonry-2-col lg:masonry-3-col before:box-inherit after:box-inherit");
    			add_location(div, file$c, 59, 4, 1700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*markup*/ 0) {
    				each_value = markup["not-work"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(59:2) {#if $filter === \\\"not\\\"}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#each $projects as project, i}
    function create_each_block_1$2(ctx) {
    	let project;
    	let i = /*i*/ ctx[12];
    	let current;
    	const assign_project = () => /*project_binding*/ ctx[6](project, i);
    	const unassign_project = () => /*project_binding*/ ctx[6](null, i);
    	let project_props = { project: /*project*/ ctx[13] };
    	project = new Project({ props: project_props, $$inline: true });
    	assign_project();

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(project.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[12]) {
    				unassign_project();
    				i = /*i*/ ctx[12];
    				assign_project();
    			}

    			const project_changes = {};
    			if (dirty & /*$projects*/ 16) project_changes.project = /*project*/ ctx[13];
    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_project();
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(68:4) {#each $projects as project, i}",
    		ctx
    	});

    	return block;
    }

    // (63:6) {#each markup["not-work"] as pic, i}
    function create_each_block$4(ctx) {
    	let notwork;
    	let current;

    	notwork = new NotWork({
    			props: { pic: /*pic*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notwork.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(notwork.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notwork, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notwork.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notwork.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notwork, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(63:6) {#each markup[\\\"not-work\\\"] as pic, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let filter0;
    	let t0;
    	let filter1;
    	let t1;
    	let filter2;
    	let t2;
    	let div2;
    	let div1;

    	let t3_value = (/*$allOpen*/ ctx[1] || /*$somethingOpen*/ ctx[2]
    	? "Close"
    	: "Expand") + "";

    	let t3;
    	let t4;
    	let div1_class_value;
    	let div1_transition;
    	let t5;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	filter0 = new Filter({
    			props: { text: "Favourite work", val: "selected" },
    			$$inline: true
    		});

    	filter1 = new Filter({
    			props: { text: "All work", val: "all" },
    			$$inline: true
    		});

    	filter2 = new Filter({
    			props: { text: "Not work", val: "not" },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$filter*/ ctx[3] === "not") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			create_component(filter0.$$.fragment);
    			t0 = space();
    			create_component(filter1.$$.fragment);
    			t1 = space();
    			create_component(filter2.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = text("\n        All");
    			t5 = space();
    			if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div0 = claim_element(div3_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			claim_component(filter0.$$.fragment, div0_nodes);
    			t0 = claim_space(div0_nodes);
    			claim_component(filter1.$$.fragment, div0_nodes);
    			t1 = claim_space(div0_nodes);
    			claim_component(filter2.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			t3 = claim_text(div1_nodes, t3_value);
    			t4 = claim_text(div1_nodes, "\n        All");
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t5 = claim_space(div4_nodes);
    			if_block.l(div4_nodes);
    			div4_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "flex flex-row flex-wrap");
    			add_location(div0, file$c, 39, 4, 1102);
    			attr_dev(div1, "class", div1_class_value = "font-normal text-gray-300 transition cursor-pointer hover:opacity-80 " + (/*$filter*/ ctx[3] === "not" ? "hidden" : ""));
    			add_location(div1, file$c, 45, 6, 1349);
    			attr_dev(div2, "class", "flex-row flex-wrap hidden md:flex");
    			add_location(div2, file$c, 44, 4, 1295);
    			attr_dev(div3, "class", "flex flex-col w-full max-w-5xl px-8 mx-auto mb-4 md:flex-row md:justify-between");
    			add_location(div3, file$c, 36, 2, 997);
    			attr_dev(div4, "class", "w-full animate-pop-up-fast mb-60");
    			add_location(div4, file$c, 35, 0, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			mount_component(filter0, div0, null);
    			append_dev(div0, t0);
    			mount_component(filter1, div0, null);
    			append_dev(div0, t1);
    			mount_component(filter2, div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div4, t5);
    			if_blocks[current_block_type_index].m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*handleExpand*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$allOpen, $somethingOpen*/ 6) && t3_value !== (t3_value = (/*$allOpen*/ ctx[1] || /*$somethingOpen*/ ctx[2]
    			? "Close"
    			: "Expand") + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*$filter*/ 8 && div1_class_value !== (div1_class_value = "font-normal text-gray-300 transition cursor-pointer hover:opacity-80 " + (/*$filter*/ ctx[3] === "not" ? "hidden" : ""))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div4, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filter0.$$.fragment, local);
    			transition_in(filter1.$$.fragment, local);
    			transition_in(filter2.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filter0.$$.fragment, local);
    			transition_out(filter1.$$.fragment, local);
    			transition_out(filter2.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(filter0);
    			destroy_component(filter1);
    			destroy_component(filter2);
    			if (detaching && div1_transition) div1_transition.end();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $allOpen;
    	let $somethingOpen;
    	let $allClosed;
    	let $whichOpen;
    	let $filter;
    	let $projects;
    	validate_store(allOpen, "allOpen");
    	component_subscribe($$self, allOpen, $$value => $$invalidate(1, $allOpen = $$value));
    	validate_store(somethingOpen, "somethingOpen");
    	component_subscribe($$self, somethingOpen, $$value => $$invalidate(2, $somethingOpen = $$value));
    	validate_store(allClosed, "allClosed");
    	component_subscribe($$self, allClosed, $$value => $$invalidate(8, $allClosed = $$value));
    	validate_store(whichOpen, "whichOpen");
    	component_subscribe($$self, whichOpen, $$value => $$invalidate(9, $whichOpen = $$value));
    	validate_store(filter, "filter");
    	component_subscribe($$self, filter, $$value => $$invalidate(3, $filter = $$value));
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(4, $projects = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Portfolio", slots, []);
    	let projectChildren = [];
    	let openTimeout = [];

    	function handleExpand() {
    		openTimeout.forEach(n => clearTimeout(n));

    		if ($allOpen || $somethingOpen) {
    			set_store_value(allOpen, $allOpen = false, $allOpen);
    			set_store_value(allClosed, $allClosed = true, $allClosed);
    			set_store_value(whichOpen, $whichOpen = [], $whichOpen);
    			projectChildren.forEach(project => project.closeProject());
    		} else {
    			projectChildren.forEach((project, i) => openTimeout[i] = setTimeout(() => project.openProject(), i * 250));
    			set_store_value(allOpen, $allOpen = true, $allOpen);
    			set_store_value(allClosed, $allClosed = false, $allClosed);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	function project_binding($$value, i) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			projectChildren[i] = $$value;
    			$$invalidate(0, projectChildren);
    		});
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		filter,
    		projects,
    		Filter,
    		Project,
    		markup,
    		NotWork,
    		allClosed,
    		allOpen,
    		somethingOpen,
    		whichOpen,
    		projectChildren,
    		openTimeout,
    		handleExpand,
    		$allOpen,
    		$somethingOpen,
    		$allClosed,
    		$whichOpen,
    		$filter,
    		$projects
    	});

    	$$self.$inject_state = $$props => {
    		if ("projectChildren" in $$props) $$invalidate(0, projectChildren = $$props.projectChildren);
    		if ("openTimeout" in $$props) openTimeout = $$props.openTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		projectChildren,
    		$allOpen,
    		$somethingOpen,
    		$filter,
    		$projects,
    		handleExpand,
    		project_binding
    	];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }
    Portfolio.$compile = {"vars":[{"name":"fade","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"filter","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"projects","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Filter","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Project","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"markup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"NotWork","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"allClosed","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"allOpen","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"somethingOpen","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"whichOpen","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"projectChildren","export_name":null,"injected":false,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":true},{"name":"openTimeout","export_name":null,"injected":false,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":true},{"name":"handleExpand","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$allOpen","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$somethingOpen","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$allClosed","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$whichOpen","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$filter","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$projects","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false}]};

    /* src/components/blocks/Footer.svelte generated by Svelte v3.29.7 */
    const file$d = "src/components/blocks/Footer.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (15:2) {#each markup.footer.links as link}
    function create_each_block$5(ctx) {
    	let a;
    	let t0_value = /*link*/ ctx[0].text + "";
    	let t0;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, target: true, class: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, t0_value);
    			t1 = claim_space(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[0].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "mr-2");
    			add_location(a, file$d, 15, 4, 388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(15:2) {#each markup.footer.links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let a;
    	let t0_value = markup.footer["email-text"] + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let each_value = markup.footer.links;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			a = claim_element(div_nodes, "A", { href: true, target: true, class: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, t0_value);
    			a_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = markup.footer["email-link"]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "hidden mr-8 md:block");
    			add_location(a, file$d, 7, 2, 206);
    			attr_dev(div, "class", "fixed bottom-0 left-0 flex flex-row flex-wrap justify-center w-full px-12 py-8 bg-white md:justify-end");
    			add_location(div, file$d, 4, 0, 84);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*markup*/ 0) {
    				each_value = markup.footer.links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ markup });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }
    Footer.$compile = {"vars":[{"name":"markup","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false}]};

    /* src/components/App.svelte generated by Svelte v3.29.7 */

    const { window: window_1 } = globals;

    // (29:0) {#if $mounted}
    function create_if_block$3(ctx) {
    	let lead;
    	let t0;
    	let pics;
    	let t1;
    	let intro;
    	let t2;
    	let portfolio;
    	let t3;
    	let footer;
    	let current;
    	lead = new Lead({ $$inline: true });
    	pics = new Pics({ $$inline: true });
    	intro = new Intro({ $$inline: true });
    	portfolio = new Portfolio({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lead.$$.fragment);
    			t0 = space();
    			create_component(pics.$$.fragment);
    			t1 = space();
    			create_component(intro.$$.fragment);
    			t2 = space();
    			create_component(portfolio.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(lead.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(pics.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			claim_component(intro.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			claim_component(portfolio.$$.fragment, nodes);
    			t3 = claim_space(nodes);
    			claim_component(footer.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lead, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(pics, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(intro, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(portfolio, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro$1(local) {
    			if (current) return;
    			transition_in(lead.$$.fragment, local);
    			transition_in(pics.$$.fragment, local);
    			transition_in(intro.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lead.$$.fragment, local);
    			transition_out(pics.$$.fragment, local);
    			transition_out(intro.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lead, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(pics, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(intro, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(portfolio, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:0) {#if $mounted}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let head;
    	let t0;
    	let styles;
    	let t1;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	head = new Head({ $$inline: true });
    	styles = new Styles({ $$inline: true });
    	let if_block = /*$mounted*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t0 = space();
    			create_component(styles.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			claim_component(head.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			claim_component(styles.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(styles, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					}),
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$scrollY*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*$scrollY*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*$mounted*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*$mounted*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(styles.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(styles.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(styles, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $mounted;
    	let $currentProject;
    	let $scrollY;
    	let $windowH;
    	validate_store(mounted, "mounted");
    	component_subscribe($$self, mounted, $$value => $$invalidate(0, $mounted = $$value));
    	validate_store(currentProject, "currentProject");
    	component_subscribe($$self, currentProject, $$value => $$invalidate(5, $currentProject = $$value));
    	validate_store(scrollY, "scrollY");
    	component_subscribe($$self, scrollY, $$value => $$invalidate(1, $scrollY = $$value));
    	validate_store(windowH, "windowH");
    	component_subscribe($$self, windowH, $$value => $$invalidate(2, $windowH = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		set_store_value(mounted, $mounted = true, $mounted);
    		const queryString = window.location.search;
    		const urlParams = new URLSearchParams(queryString);
    		set_store_value(currentProject, $currentProject = urlParams.get("project"), $currentProject);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		scrollY.set($scrollY = window_1.pageYOffset);
    	}

    	function onwindowresize() {
    		windowH.set($windowH = window_1.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		mounted,
    		currentProject,
    		scrollY,
    		windowH,
    		Head,
    		Styles,
    		Lead,
    		Pics,
    		Intro,
    		Portfolio,
    		Footer,
    		$mounted,
    		$currentProject,
    		$scrollY,
    		$windowH
    	});

    	return [$mounted, $scrollY, $windowH, onwindowscroll, onwindowresize];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }
    App.$compile = {"vars":[{"name":"onMount","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"mounted","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"currentProject","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":true},{"name":"scrollY","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"windowH","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Head","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Styles","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Lead","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Pics","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Intro","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Portfolio","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Footer","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"$mounted","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$currentProject","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":false,"referenced":false,"writable":true,"referenced_from_script":false},{"name":"$scrollY","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false},{"name":"$windowH","export_name":null,"injected":true,"module":false,"mutated":true,"reassigned":true,"referenced":true,"writable":true,"referenced_from_script":false}]};

    const dev = !!undefined;

    const app = new App({
      target: document.querySelector("main"),
      hydrate: !dev,
    });

    if (dev) {
      undefined.dispose(() => {
        app.$destroy();
      });
      undefined.accept();
    }

    return app;

}());
//# sourceMappingURL=bundle.js.map
