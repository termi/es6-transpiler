"use strict";

function traverse(root, options) {
    options = options || {};
    const pre = options.pre;
    const post = options.post;
    const cleanup = options.cleanup;

    function visit(node, parent) {
        if (!node || typeof node.type !== 'string') {
            return;
        }

        let res = undefined;
        if (pre) {
            res = pre(node, parent);
        }

        if (res !== false) {
            for (let prop in node) {
                if (prop[0] === "$") {
                    if (cleanup) {
                        delete node[prop];
                    }
                    continue;
                }

                const child = node[prop];

	            if( typeof child === 'object' ) {
		            if (Array.isArray(child)) {
			            for (let i = 0; i < child.length; i++) {
				            visit(child[i], node);
			            }
		            } else {
			            visit(child, node);
		            }
	            }
            }
        }

        if (post) {
            post(node, parent);
        }
    }

    visit(root, null);
};
module.exports = traverse;
