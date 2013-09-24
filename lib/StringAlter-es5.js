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
	 * @param {Array=} offsets
	 * @returns {*}
	 */
		StringAlter.prototype.updatePosition = function(pos) {var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;
		if( !offsets.length ) {
			return pos;
		}
		return this.updateRecord({from: pos, to: pos}, offsets).from;
	}

	StringAlter.prototype.updateRecord = function($D$0) {var from = $D$0.from, to = $D$0.to;var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;//TODO:: optimize function speed
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

	StringAlter.prototype.apply = function() {var $D$1;
		var offsets = this._offsets;
		var fragments = this._fragments;
		var sourceString = this._source;

		if( fragments.length && fragments[0].originalIndex === void 0 ) {
			var fragmentsGroups = Object.create(null);
			for( var index = 0, fragmentsLength = fragments.length ; index < fragmentsLength ;  index++ ) {
				var frag = fragments[index];

				var fragmentOptions = frag.options || {};

				if( fragmentOptions["inactive"] === true ) {//TODO: tests
					fragments.splice(index, 1);
					index--;
					fragmentsLength--;

					continue;
				}

				var group = fragmentOptions.group;

				if( group ) {
					var prev = index ? fragments[index - 1] : {options: {priority : 1}};

					if( fragmentsGroups[group] !== void 0 ) {
						delete fragmentsGroups[group];
						fragmentOptions.priority = (fragmentOptions.priority || 0) + (fragmentOptions.priority || 0) + 1;
					}
					else {
						fragmentsGroups[group] = null;
						fragmentOptions.priority = (fragmentOptions.priority || 0) - (fragmentOptions.priority || 0) - 1;
					}
				}

				frag.originalIndex = index;
			}

			fragments.sort(function(a, b) {// TODO:: needs to be rewritten

				var aStart = (aEnd = a.record).from, aEnd = aEnd.to;
				var bStart = (bEnd = b.record).from, bEnd = bEnd.to;
				var result = aStart - bStart;

				if( result === 0 ) {
					var aReverse = (aAfter = a.options || {}).reverse, aPriority = aAfter.priority, aExtend = aAfter.extend, aBefore = aAfter.before, aAfter = aAfter.after;
					var bReverse = (bAfter = b.options || {}).reverse, bPriority = bAfter.priority, bExtend = bAfter.extend, bBefore = bAfter.before, bAfter = bAfter.after;

					if( aBefore === true || bBefore === true ) {
						if( aBefore === bBefore ) {
							return (a.originalIndex - b.originalIndex);
						}
						return bBefore ? 1 : -1;
					}
					if( bAfter === true || bAfter === true ){
						if( bAfter === aAfter ) {
							return (a.originalIndex - b.originalIndex);
						}
						return bAfter ? -1 : 1;
					}

					if( aReverse === true || bReverse === true ) {//TODO:: replace reverse with before
						if( aStart === aEnd && bStart === bEnd ) {
							if( aReverse === bReverse ) {
								result = -1;
//								result = 1;
							}
							else {
								return aReverse ? -1 : 1
							}
						}
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
//			console.log(fragments)
		}

		// create sub fragments
		var lastStart, lastEnd, groupFrag;
		for( var fragmentsLength$0 = fragments.length - 1 ; fragmentsLength$0 >= 0 ;  fragmentsLength$0-- ) {
			var frag$0 = fragments[fragmentsLength$0];
			var start = (end = frag$0.record).from, end = end.to;
			var groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag$0.type !== Fragment.Types.insert || (frag$0.options || {}).extend
				;

			if( lastEnd &&
				(
					start > lastStart && end < lastEnd
						|| (groupFragExtend && currFragExtend && (start === lastStart || end === lastEnd))
					)
				) {
				groupFrag.sub(frag$0);
				fragments.splice(fragmentsLength$0, 1);
			}
			else {
				lastStart = start;
				lastEnd = end;
				groupFrag = frag$0;
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

		for (var index$0 = 0; index$0 < fragments.length; index$0++) {(function(){
			var frag$1 = fragments[index$0];
			var fragOptions = (frag$1.options || {});

			var from = (to = this.updateRecord(frag$1.record, currentOffsets)).from, to = to.to;
			if( frag$1.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, "'pos' (" + pos + ") shoulde be <= 'start' (" + from + ") or 'start' (" + from + ") == 'end' (" + to + ")"
			);
			assert(from <= to, "from (" + from + ") should be <= to (" + to + ")");

			var subFragments = frag$1.sub();
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
				from = ($D$1 = this.updateRecord(frag$1.record, offsets)).from, to = $D$1.to, $D$1;
				outs = [];
			}

			var string = frag$1.str.replace(Record.uniqueRE, (function(str, from, to)  {
				to |= 0;

				var record = new Record(from | 0, to);

				if( from < clearPos && fragOptions.applyChanges ) {
					outsStr += outs.join("");
					outs = [];
					record = this.updateRecord(record, offsets);

					return outsStr.substring(record.from, record.to);
				}
				else {
					record = this.updateRecord(record, currentOffsets);

					return sourceString.substring(record.from, record.to);
				}
			}).bind(this));

			{
				var transform = fragOptions.transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag$1, string);
				}
			}


			var offset = string.length - ( to - from );
			if( offset ) {
				var newIsAdding = to === from
					, newIndex = frag$1.record.from
					, value = offsets[newIndex] || 0
					, insertingValue = value | 0
					, addingValue = void 0
					;

				value += "";
				var index$1 = value.indexOf(".");
				if( index$1 !== -1 ) {//adding
					addingValue = +(value.substr(index$1 + 1));
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
			clearPos = ($D$1 = frag$1.record).to, $D$1;
		}).call(this);}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		this.reset();

		return outsStr + outs.join("");
	}
return StringAlter;})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
