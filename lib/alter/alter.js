// alter.js
// MIT licensed, see LICENSE file
// Copyright (c) 2013 Olov Lassus <olov.lassus@gmail.com>

var assert = require("assert");

// fragments is a list of {start: index, end: index, str: string to replace with}
function alter(str, fragments) {
    "use strict";

    var isArray = Array.isArray || function(v) {
        return Object.prototype.toString.call(v) === "[object Array]";
    };

    assert(typeof str === "string");
    assert(isArray(fragments));

    fragments = fragments.map(function(v, index) {
		v.originalIndex = index;
        return v;
    }); // copy before destructive sort

    fragments.sort(function(a, b) {
		var result = a.start - b.start;
		if( result === 0 ) {
			result = a.originalIndex - b.originalIndex;
		}
        return result;
    });

	// smart-filter for changes: If one change A full-overwrite one or more changes B -> remove B
	for( let i = 0, len = fragments.length ; i < len ; i++ ) {
		let frag = fragments[i]
			, nextFrag
		;

		do {
			if( nextFrag = fragments[i + 1] ) {
				if( nextFrag.start === frag.start ) {
					if( nextFrag.start === nextFrag.end ) {
						nextFrag = null;
					}
					else if( nextFrag.end === frag.end && nextFrag.originalIndex > frag.originalIndex || nextFrag.end > frag.end ) {
						fragments.splice(i, 1);//remove current fragment
						frag = nextFrag;
					}
					else {
						fragments.splice(i + 1, 1);//remove next fragment
					}
					len--;
				}
				else if( frag.end > nextFrag.start && frag.end >= nextFrag.end ) { // nextFrag.start is <= frag.start due of previous sorting
					fragments.splice(i + 1, 1);//remove next fragment
					len--;
				}
				else {
					nextFrag = null;
				}
			}
		}
		while( nextFrag );
	}

    var outs = [];

    var pos = 0;
	//console.log(fragments)
    for (var i = 0; i < fragments.length; i++) {
        var frag = fragments[i];


        assert(
			pos <= frag.start
			|| frag.start === frag.end//nothing to remove
		);
        assert(frag.start <= frag.end);
        outs.push(str.slice(pos, frag.start));
        outs.push(frag.str);
        pos = frag.end;
    }
    if (pos < str.length) {
        outs.push(str.slice(pos));
    }

    return outs.join("");
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = alter;
}
