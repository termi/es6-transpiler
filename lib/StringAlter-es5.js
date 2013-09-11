"use strict";

var assert = this["assert"] || function(expect, msg) {
	if( expect != true ) {
		throw new Error(msg || "");
	}
};

var Record = (function(){
	function Record(from, to) {
		this.from = from;
		this.to = to;
	}

	Record.prototype.toString = function() {
		return Record.uniqueStart + "[" + this.from + "]" + Record.uniqueSeparator + "[" + this.to + "]" + Record.uniqueEnd;
	}
return Record;})();
Record.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
Record.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
Record.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
Record.uniqueRE = new RegExp("\\[\\<\\d{" + (Record.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + Record.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (Record.uniqueEnd.length - 2) + "}\\>\\]", "g");

var Fragment = (function(){
	function Fragment(from, to) {var insertStr = arguments[2];if(insertStr === void 0)insertStr = "";var type = arguments[3];if(type === void 0)type = Fragment.Types.replace;
		this.record = new Record(from, to);
		this.str = insertStr;
		this.type = type;
	}
	
	Fragment.prototype.sub = function(fragment) {
		if( fragment instanceof Fragment ) {
			if( !this.subs ) {
				this.subs = [];
			}
			this.subs.unshift(fragment);
			
			return null;
		}
		else {
			return this.subs;
		}
	}
return Fragment;})();
Fragment.Types = {replace: 1, insert: 2, remove: 3 };

var StringAlter = (function(){
	function StringAlter(source) {var fragments = arguments[1];if(fragments === void 0)fragments = [];var offsets = arguments[2];if(offsets === void 0)offsets = [];
		this._source = source;
		this._fragments = fragments;
		this._offsets = offsets;

		this._fragmentsGroupId = 0;
	}

	StringAlter.prototype._createFragment = function(from, to, data, type, options) {
		if( typeof data === "object" ) {
			assert(data instanceof Record);
		}
		else if(typeof data === "string") {
			
		}
		else {
			assert(false, "createFragment without fragment data")
		}

		var fragment = new Fragment(from, to, data + "", type);

		if( options ) {
			fragment.options = options;
		}

		this._fragments.push(fragment);
	}
	
	StringAlter.prototype.reset = function() {
		this._fragments = [];
		this._offsets = [];
	}

	StringAlter.prototype.hasChanges = function() {
		return !!this._fragments.length;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @returns {Record}
	 */
	StringAlter.prototype.get = function(from, to) {
		return new Record(from, to);
	}

	/**
	 *
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.insert = function(to, data, options) {
		this._createFragment(to, to, data, Fragment.Types.insert, options);
		return this;
	}

	/**
	 * TODO: tests
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.insertAfter = function(to, data) {var options = arguments[2];if(options === void 0)options = {};
		options.after = true;
		return this.insert(to, data, options);
	}

	/**
	 * TODO: tests
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.insertBefore = function(to, data) {var options = arguments[2];if(options === void 0)options = {};
		options.before = true;
		return this.insert(to, data, options);
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.remove = function(from, to, options) {
		this._createFragment(from, to, "", Fragment.Types.remove, options);
		return this;
	}

	/**
	 * TODO: tests
	 * @param srcFrom
	 * @param srcTo
	 * @param destination
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.move = function(srcFrom, srcTo, destination, options) {
		this.remove(srcFrom, srcTo);
		this.insert(destination, this.get(srcFrom, srcTo), options);
		return this;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.replace = function(from, to, data, options) {
		if( from == to ) {
			return this.insert(from, data, options);
		}
		else {
			this._createFragment(from, to, data, Fragment.Types.replace, options);
		}
		return this;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param start
	 * @param end
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.wrap = function(from, to, start, end) {var options = arguments[4];if(options === void 0)options = {};
		options.group = ++this._fragmentsGroupId;

		var firstInsertOptions = Object.create(options);
		firstInsertOptions.reverse = true;

		this.insert(from, start, firstInsertOptions);//TODO::insertBefore 
		this.insert(to, end, options);//TODO::insertAfter
		return this;
	}
	

	/**
	 *
	 * @param pos
	 * @param offsets
	 * @returns {*}
	 */
	StringAlter.prototype.updatePosition = function(pos, offsets) {
		if( !offsets.length ) {
			return pos;
		}
		return this.updateRecord({from: pos, to: pos}, offsets).from;
	}
	
	StringAlter.prototype.updateRecord = function($D$0) {var from = $D$0.from, to = $D$0.to;var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;
		if( offsets && offsets.length ) {
			var positionOffset = 0;
			var originalFrom = from + positionOffset, originalTo = to + positionOffset;

			for( var offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
				// Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
				offset = offset | 0;

				var offsetValue = offsets[offset];
				var extendValue = offsetValue | 0;
				var addingValue = void 0;

				if( offsetValue > extendValue ) {
					offsetValue += "";
					var index = offsetValue.indexOf(".");
					if( index !== -1 ) {//adding
						addingValue = +(offsetValue.substr(index + 1));
					}
				}

				if( offset <= originalTo ) {// must be <=
					if( offset <= originalFrom) {// must be <=
						if( offset !== originalFrom ) {
							from += extendValue;
						}
						if( addingValue ) {
							from += addingValue;
						}
					}

					to += extendValue;
					if( offset !== originalTo && addingValue ) {
						to += addingValue;
					}

				}
				else {
					break;
				}
			}
		}

		return new Record(from, to);
	}

	StringAlter.prototype.apply = function() {var $D$2;
		var offsets = this._offsets;
		var fragments = this._fragments;
		var sourceString = this._source;

		if( fragments.length && fragments[0].originalIndex === void 0 ) {
			var fragmentsGroups = Object.create(null);
			fragments = fragments.map(function(v, index, arr) {
				var group = (v.options || {}).group;

				if( group ) {
					var prev = index ? arr[index - 1] : {options: {priority : 1}};

					if( fragmentsGroups[group] !== void 0 ) {
						delete fragmentsGroups[group];
						v.options.priority = ((prev.options || {}).priority || 0) + (v.options.priority || 0) + 1;
					}
					else {
						fragmentsGroups[group] = null;
						v.options.priority = ((prev.options || {}).priority || 0) - (v.options.priority || 0) - 1;
					}
				}

				v.originalIndex = index;
				return v;
			});

			fragments.sort(function(a, b) {var $D$1;// TODO:: needs to be rewritten

				var aStart = ($D$1 = a.record).from, aEnd = $D$1.to;
				var bStart = ($D$1 = b.record).from, bEnd = $D$1.to;
				var result = aStart - bStart;

				if( result === 0 ) {
					var aReverse = ($D$1 = a.options || {}).reverse, aPriority = $D$1.priority, aExtend = $D$1.extend, aBefore = $D$1.before, aAfter = $D$1.after;
					var bReverse = ($D$1 = b.options || {}).reverse, bPriority = $D$1.priority, bExtend = $D$1.extend, bBefore = $D$1.before, bAfter = $D$1.after;

					if( aBefore === true || bAfter === true ) {
						return -1;
					}
					if( aAfter === true || bBefore === true ) {
						return 1;
					}

					if( aReverse && bReverse && aStart === aEnd && bStart === bEnd ) {
						result = -1;
					}
					else  {
						result = 1;
					}
					result = result * (a.originalIndex - b.originalIndex)
//						TODO:: * (aExtend ? -1 : 1) * (bExtend ? -1 : 1)
					;

					if( aPriority === bPriority ) {

					}
					else if( aPriority !== void 0 || bPriority !== void 0 ) {
						aPriority = aPriority || 0;
						bPriority = bPriority || 0;
						if( aPriority <= bPriority ) {
							if( result > 0 === !!aExtend ) {
								result = result * -1;
							}
						}
						else {
							if( result < 0 === !!aExtend ) {
								result = result * -1;
							}
						}
					}
				}
				else {
					result = 0;
				}

				if( result === 0 ) {
					result = aEnd - bEnd;
				}

				return (result === 0 ? ( (result = aStart - bStart) === 0 ? a.originalIndex - b.originalIndex : result) : result);
			});
		}

		// create sub fragments
		var lastStart, lastEnd, groupFrag;
		for( var len = fragments.length - 1 ; len >= 0 ;  len-- ) {
			var frag = fragments[len];
			var start = ($D$2 = frag.record).from, end = $D$2.to;
			var groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag.type !== Fragment.Types.insert || (frag.options || {}).extend
			;

			if( lastEnd &&
				(
					start > lastStart && end < lastEnd
					|| (groupFragExtend && currFragExtend && (start === lastStart || end === lastEnd))
				)
			) {
				groupFrag.sub(frag);
				fragments.splice(len, 1);
			}
			else {
				lastStart = start;
				lastEnd = end;
				groupFrag = frag;
			}
		}

		var outsStr = "", outs = [];

		var pos = this.updatePosition(0, offsets)
			, clearPos = 0
			, posOffset = 0
		;

		if( pos !== 0 ) {
			outsStr = sourceString.slice(0, pos);
		}

		var currentOffsets = offsets.slice();

		for (var i = 0; i < fragments.length; i++) {
			var frag$0 = fragments[i];

			var from = ($D$2 = this.updateRecord(frag$0.record, currentOffsets)).from, to = $D$2.to;
			if( frag$0.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, "'pos' (" + pos + ") shoulde be <= 'start' (" + from + ") or 'start' (" + from + ") == 'end' (" + to + ")"
			);
			assert(from <= to, "from (" + from + ") should be <= to (" + to + ")");

			var subFragments = frag$0.sub();
			if( subFragments ) {
				outsStr += outs.join("");

				var subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, subFragments
					, this._offsets
				);
				sourceString = subAlter.apply();

				var offsetPos = this.updatePosition(clearPos, offsets);
				
				pos = offsetPos;
				
				offsets = this._offsets;
				currentOffsets = this._offsets.slice();
				from = ($D$2 = this.updateRecord(frag$0.record, offsets)).from, to = $D$2.to, $D$2;
				outs = [];
			}

			var string = frag$0.str.replace(Record.uniqueRE, (function(str, from, to)  {
				to |= 0;

				var newRecord = this.updateRecord(new Record(from | 0, to), currentOffsets);

				return sourceString.substring(newRecord.from, newRecord.to);
			}).bind(this));

			{
				var transform = (frag$0.options || {}).transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag$0, string);
				}
			}


			var offset = string.length - ( to - from );
			if( offset ) {
				var newIsAdding = to === from
					, newIndex = frag$0.record.from
					, value = offsets[newIndex] || 0
					, insertingValue = value | 0
					, addingValue = void 0
				;

				value += "";
				var index = value.indexOf(".");
				if( index !== -1 ) {//adding
					addingValue = +(value.substr(index + 1));
				}
				else {
					addingValue = 0;
				}

				if( newIsAdding ) {
					addingValue += offset;
				}
				else {
					insertingValue += offset;
				}

				if( addingValue ) {
					value = (insertingValue + "." + addingValue);
				}
				else {
					value = insertingValue;
				}

				offsets[newIndex] = value;
			}

			if( pos !== from ) {
				outs.push(sourceString.slice(pos, from));
			}
			outs.push(string);

			pos = to;
			clearPos = (frag$0.record).to, (frag$0.record);
		}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		this.reset();

		return outsStr + outs.join("");
	}
return StringAlter;})();

if( typeof module === "object" && module ) {
	module.exports = StringAlter;
}
