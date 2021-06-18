
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    const outroing = new Set();
    let outros;
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    var google = {
    	sheet: [
    	],
    	doc: [
    		{
    			id: "1_xjhTkMC88_WEiW77tkBLsC9pqFn03aTAtIB4jLqLKs",
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
    	active: false,
    	kitId: ""
    };
    var typekit = {
    	active: false,
    	kitId: ""
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
    			add_location(script, file, 62, 4, 1917);
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
    			add_location(link, file, 69, 4, 2083);
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

    // (75:2) {#if config.google.fonts.active}
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
    		source: "(75:2) {#if config.google.fonts.active}",
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
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-12lcl8d\"]", document.head);
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
    			document.title = "DF Svelte Template";
    			attr_dev(meta0, "charset", "UTF-8");
    			add_location(meta0, file, 32, 2, 764);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1.0");
    			add_location(meta1, file, 33, 2, 791);
    			attr_dev(meta2, "http-equiv", "X-UA-Compatible");
    			attr_dev(meta2, "content", "ie=edge");
    			add_location(meta2, file, 34, 2, 866);
    			attr_dev(meta3, "name", "description");
    			attr_dev(meta3, "content", "");
    			add_location(meta3, file, 35, 2, 924);
    			attr_dev(meta4, "name", "news_keywords");
    			attr_dev(meta4, "content", "");
    			add_location(meta4, file, 36, 2, 965);
    			attr_dev(meta5, "property", "og:title");
    			attr_dev(meta5, "content", "");
    			add_location(meta5, file, 38, 2, 1009);
    			attr_dev(meta6, "property", "og:site_name");
    			attr_dev(meta6, "content", "");
    			add_location(meta6, file, 39, 2, 1051);
    			attr_dev(meta7, "property", "og:url");
    			attr_dev(meta7, "content", "");
    			add_location(meta7, file, 40, 2, 1097);
    			attr_dev(meta8, "property", "og:description");
    			attr_dev(meta8, "content", "description");
    			add_location(meta8, file, 41, 2, 1137);
    			attr_dev(meta9, "property", "og:type");
    			attr_dev(meta9, "content", "article");
    			add_location(meta9, file, 42, 2, 1196);
    			attr_dev(meta10, "property", "og:locale");
    			attr_dev(meta10, "content", "en_US");
    			add_location(meta10, file, 43, 2, 1244);
    			attr_dev(meta11, "property", "og:image");
    			attr_dev(meta11, "content", "");
    			add_location(meta11, file, 45, 2, 1293);
    			attr_dev(meta12, "property", "og:image:type");
    			attr_dev(meta12, "content", "image/jpeg");
    			add_location(meta12, file, 46, 2, 1335);
    			attr_dev(meta13, "property", "og:image:width");
    			attr_dev(meta13, "content", "1200");
    			add_location(meta13, file, 47, 2, 1392);
    			attr_dev(meta14, "property", "og:image:height");
    			attr_dev(meta14, "content", "600");
    			add_location(meta14, file, 48, 2, 1444);
    			attr_dev(meta15, "name", "twitter:card");
    			attr_dev(meta15, "content", "summary_large_image");
    			add_location(meta15, file, 50, 2, 1497);
    			attr_dev(meta16, "name", "twitter:site");
    			attr_dev(meta16, "content", "");
    			add_location(meta16, file, 51, 2, 1558);
    			attr_dev(meta17, "name", "twitter:creator");
    			attr_dev(meta17, "content", "");
    			add_location(meta17, file, 52, 2, 1600);
    			attr_dev(meta18, "name", "twitter:title");
    			attr_dev(meta18, "content", "");
    			add_location(meta18, file, 53, 2, 1645);
    			attr_dev(meta19, "name", "twitter:description");
    			attr_dev(meta19, "content", "");
    			add_location(meta19, file, 54, 2, 1688);
    			attr_dev(meta20, "name", "twitter:image:src");
    			attr_dev(meta20, "content", "");
    			add_location(meta20, file, 55, 2, 1737);
    			attr_dev(meta21, "name", "robots");
    			attr_dev(meta21, "content", "max-image-preview:large");
    			add_location(meta21, file, 57, 2, 1785);
    			attr_dev(link, "rel", "canonical");
    			attr_dev(link, "href", "");
    			add_location(link, file, 59, 2, 1845);
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

    /* src/components/App.svelte generated by Svelte v3.29.7 */

    function create_fragment$2(ctx) {
    	let head;
    	let t;
    	let styles;
    	let current;
    	head = new Head({ $$inline: true });
    	styles = new Styles({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(head.$$.fragment);
    			t = space();
    			create_component(styles.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(head.$$.fragment, nodes);
    			t = claim_space(nodes);
    			claim_component(styles.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(head, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(styles, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(styles.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(styles.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(head, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(styles, detaching);
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
    	validate_slots("App", slots, []);
    	let mounted = false;

    	onMount(() => {
    		mounted = true;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Head, Styles, mounted });

    	$$self.$inject_state = $$props => {
    		if ("mounted" in $$props) mounted = $$props.mounted;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }
    App.$compile = {"vars":[{"name":"onMount","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":false,"writable":false,"referenced_from_script":true},{"name":"Head","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"Styles","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":false,"referenced":true,"writable":false,"referenced_from_script":false},{"name":"mounted","export_name":null,"injected":false,"module":false,"mutated":false,"reassigned":true,"referenced":false,"writable":true,"referenced_from_script":true}]};

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
