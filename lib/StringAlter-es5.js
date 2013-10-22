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

	Record.prototype.sub = function(fragment) {var $D$1;function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};
		if( fragment ) {
			if( !this.subs ) {
				this.subs = [];
			}

			if( Array.isArray(fragment) ) {
				($D$1 = this.subs).push.apply($D$1, ITER$0(fragment));
			}
			else if( fragment instanceof Fragment ) {
				this.subs.push(fragment);
			}

			return null;
		}
		else {
			return this.subs;
		}
	}
return Record;})();
Record.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
Record.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
Record.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
Record.uniqueRE = new RegExp("\\[\\<\\d{" + (Record.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + Record.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (Record.uniqueEnd.length - 2) + "}\\>\\]", "g");

var Fragment = (function(){
	function Fragment(from, to) {var insertStr = arguments[2];if(insertStr === void 0)insertStr = "";var type = arguments[3];if(type === void 0)type = Fragment.Types.replace;
		this.record = new Record(from, to);
		this.type = type;

		this.data = insertStr;
		this.expressions = void 0;
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

	Fragment.prototype.extractData = function(recordsCache) {
		if( this.extracted ) {
			if( this.expressions ) {
				return this.expressions.length;
			}
			return 0;
		}

		var fragmentFrom = (fragmentTo = this.record).from, fragmentTo = fragmentTo.to;

		var data = this.data;
		var fragmentsLen;

		var minFrom = -1;
		var maxTo = -1;

		var isIsolate = true;

		if( data instanceof Record ) {
			this.expressions = [data];
			this.data = [];
			fragmentsLen = 1;
		}
		else {
			fragmentsLen = 0;
			var prevOffset = 0;
			var newData;

			data = data + "";

			data.replace(Record.uniqueRE, function(str, from, to, offset) {
				fragmentsLen++;

				from |= 0;
				to |= 0;

				if( !newData ) {//first found
					newData = [];
					this.expressions = [];
					minFrom = from;
					maxTo = to;
				}
				else {
					if( from < minFrom ) {
						minFrom = from;
					}
					if( to > maxTo ) {
						maxTo = to;
					}
				}

				if( isIsolate ) {
					if( from < fragmentFrom || to > fragmentTo ) {
						isIsolate = false;
					}
				}

				var recordKey = from + "|" + to;

				this.expressions.push(recordsCache[recordKey]);
				newData.push(data.substring(prevOffset, offset));

				prevOffset = offset + str.length;
			}.bind(this));

			if( newData ) {
				newData.push(data.substring(prevOffset));//tail
				this.data = newData;
			}
			else {
				this.data = data;
			}
		}

		this.isIsolate = isIsolate;
		this.minFrom = minFrom;
		this.maxTo = maxTo;
		this.extracted = true;

		return fragmentsLen;
	}
return Fragment;})();
Fragment.Types = {replace: 1, insert: 2, remove: 3 };

var StringAlter = (function(){function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();}throw new Error(v+' is not iterable')};
	function StringAlter(source) {var fragments = arguments[1];if(fragments === void 0)fragments = [];var offsets = arguments[2];if(offsets === void 0)offsets = [];var recordsCache = arguments[3];if(recordsCache === void 0)recordsCache = {};
		this._source = new String(source);//TODO:: [new get logic] after new get logic completed replace it to this._source = source
		this.reset(fragments, offsets, recordsCache);
	}

	StringAlter.prototype.reset = function() {var fragments = arguments[0];if(fragments === void 0)fragments = [];var offsets = arguments[1];if(offsets === void 0)offsets = [];var recordsCache = arguments[2];if(recordsCache === void 0)recordsCache = {};
		this._fragments = fragments;
		this._offsets = offsets;
		this._fragmentStates = {};
		this._fragmentStatesArray = [];
		this.__prevStateName = this.__currentStateName = void 0;
		this._fragmentsGroupId = 0;

		this._index = {
			indexFrom: []
//			, indexTo: []
//			, rangeFrom_count: []
//			, rangeTo_count: []

			, recordIndexFrom: []
		};
		this._records = recordsCache;
	}

	StringAlter.prototype._createFragment = function(from, to, data, type, options) {var $D$3;var $D$4;var $D$5;var $D$6;
		if( typeof data === "object" ) {
			assert(data instanceof Record);
		}
		else if(typeof data === "string") {

		}
		else {
			assert(false, "createFragment without fragment data")
		}

		from |= 0;
		to |= 0;

		var fragment = new Fragment(from, to, data + "", type);

		if( options ) {
			fragment.options = options;
		}

		fragment.__createdIndex = this._fragments.length;
		this._fragments.push(fragment);
		this._addRecordToIndex(fragment.record, from, to, fragment, this._index.indexFrom);

//		if( options && options.__newTransitionalSubLogic ) {// Transitional period
			$D$6 = (this._findFragmentRecords(from, to));$D$3 = GET_ITER$0($D$6);$D$4 = $D$3 === 0;$D$5 = ($D$4 ? $D$6.length : void 0);for( var record ; $D$4 ? ($D$3 < $D$5) : !($D$5 = $D$3["next"]())["done"]; ){record = ($D$4 ? $D$6[$D$3++] : $D$5["value"]);
				record.sub(fragment);
			};$D$3 = $D$4 = $D$5 = $D$6 = void 0;
//		}
	}

	StringAlter.prototype._addRecordToIndex = function(record) {var $D$7;var $D$8;var $D$9;var from = arguments[1];if(from === void 0)from = record.from;var to = arguments[2];if(to === void 0)to = record.to;var data = arguments[3];if(data === void 0)data = record;var index = arguments[4];if(index === void 0)index = this._index.recordIndexFrom;
		var key = from + "";
		var indexes = key.split("");
		var deep = indexes.length;
		var maxLimitName = "__maxTo" + deep;
		var minLimitName = "__minFrom" + deep;
		var currentIndexContainer = index;

		if( currentIndexContainer[maxLimitName] === void 0 || currentIndexContainer[maxLimitName] < to ) {
			currentIndexContainer[maxLimitName] = to;
		}
		if( currentIndexContainer[minLimitName] === void 0 || currentIndexContainer[minLimitName] > from ) {
			currentIndexContainer[minLimitName] = from;
		}
		$D$7 = GET_ITER$0(indexes);$D$8 = $D$7 === 0;$D$9 = ($D$8 ? indexes.length : void 0);for( var indexValue ; $D$8 ? ($D$7 < $D$9) : !($D$9 = $D$7["next"]())["done"]; ){indexValue = ($D$8 ? indexes[$D$7++] : $D$9["value"]);
			indexValue = indexValue | 0;
			if( !currentIndexContainer[indexValue] ) {
				currentIndexContainer = currentIndexContainer[indexValue] = [];
			}
			else {
				currentIndexContainer = currentIndexContainer[indexValue];
			}
			if( currentIndexContainer[maxLimitName] === void 0 || currentIndexContainer[maxLimitName] < to ) {
				currentIndexContainer[maxLimitName] = to;
			}
			if( currentIndexContainer[minLimitName] === void 0 || currentIndexContainer[minLimitName] > from ) {
				currentIndexContainer[minLimitName] = from;
			}
		};$D$7 = $D$8 = $D$9 = void 0;
		if( !currentIndexContainer.__value ) {
			currentIndexContainer.__value = [];
		}
		currentIndexContainer.__value.push(data);

//		key = to + "";
//		indexes = key.split("");
//		deep = indexes.length;
//		limitName = "__minFrom" + deep;
//		currentIndexContainer = this._index.indexTo;
//		if( currentIndexContainer[limitName] === void 0 || currentIndexContainer[limitName] > from ) {
//			currentIndexContainer[limitName] = from;
//		}
//		for( ii = 0, len = indexes.length ; ii < len ; ii++ ) {
//			let indexValue = indexes[ii] | 0;
//			if( !currentIndexContainer[indexValue] ) {
//				currentIndexContainer = currentIndexContainer[indexValue] = [];
//			}
//			else {
//				currentIndexContainer = currentIndexContainer[indexValue];
//			}
//			if( currentIndexContainer[limitName] === void 0 || currentIndexContainer[limitName] > from ) {
//				currentIndexContainer[limitName] = from;
//			}
//		}
//		if( !currentIndexContainer.__value ) {
//			currentIndexContainer.__value = [];
//		}
//		currentIndexContainer.__value.push(fragment);
	}

	StringAlter.prototype._findRecordFragments = function(from, to) {var $D$10;var $D$11;var $D$12;var doNotSort = arguments[2];if(doNotSort === void 0)doNotSort = false;
		var result = [];

		var fromPendingValue, toPendingValue;

		var toNumbers_fn = function(v)  {return v | 0};

		var fromKey = from + "";
		var fromKeys = fromKey.split("").map(toNumbers_fn);
		var fromDeep = fromKeys.length;
		var maxLimitName = "__maxTo" + fromDeep;

		var toKey = to + "";
		var toKeys = toKey.split("");
		var toDeep = toKeys.length;

//		if( fromDeep > toDeep ) {
//			throw new Error("'from' value must be <= 'to' value");
//		}
//		if( fromDeep > 9 || toDeep > 9 ) {
//			throw new Error("'from' or 'to' value > 999999999 unsuported");//for 999999999 index file size must be ~1Gib
//		}
		if( fromDeep < toDeep ) {
			toPendingValue = to;

			to = fromKey.replace(/\d/g, "9") | 0;

			fromPendingValue = to + 1;
		}

		var currentIndex, lastFromNumberIndex = fromDeep - 1;
		var index = this._index.indexFrom;
		var lastKey = fromKeys[lastFromNumberIndex];

		while( from <= to ) {
			if( !currentIndex ) {
				currentIndex = index;
				for( var jj = 0, jjKey ; jj < fromDeep - 1 ; jj++ ) {
					jjKey = fromKeys[jj] | 0;
					currentIndex = currentIndex[jjKey];
					if( currentIndex ) {
						if( currentIndex[maxLimitName] < from ) {
							//fast check: fragments in this index has changes outside current recort
							currentIndex = void 0;
						}
					}
					if( !currentIndex ) {
						break;
					}
				}
			}

			if( currentIndex ) {
				var currentIndexContainer = currentIndex[lastKey];

				if( currentIndexContainer && currentIndexContainer[maxLimitName] >= from ) {
					currentIndexContainer = currentIndexContainer.__value;
					if( currentIndexContainer ) {
						$D$10 = GET_ITER$0(currentIndexContainer);$D$11 = $D$10 === 0;$D$12 = ($D$11 ? currentIndexContainer.length : void 0);for( var frag ; $D$11 ? ($D$10 < $D$12) : !($D$12 = $D$10["next"]())["done"]; ){frag = ($D$11 ? currentIndexContainer[$D$10++] : $D$12["value"]);
							var fragTo = (frag.record).to;

							if( fragTo <= to ) {
								result.push(frag);
							}
						};$D$10 = $D$11 = $D$12 = void 0;
					}
				}
			}

			from++;
			lastKey = fromKeys[lastFromNumberIndex] = lastKey + 1;
			if( lastKey > 9 ) {
				fromKey = from + "";
				fromKeys = fromKey.split("").map(toNumbers_fn);
				lastKey = 0;
				currentIndex = void 0;
			}
		}

		if( fromPendingValue ) {
			result.push.apply(result, this._findRecordFragments(fromPendingValue, toPendingValue, true));
		}

		return doNotSort ? result : result.sort(function(a, b){return (a.__createdIndex - b.__createdIndex)});
	}

	StringAlter.prototype._findFragmentRecords = function(fragmentFrom, fragmentTo) {
		var result = [];

		var toNumbers_fn = function(v)  {return v | 0};

		var intValue = fragmentFrom;

		var fromKey = intValue + "";
		var fromKeys = fromKey.split("").map(toNumbers_fn);
		var fromDeep = fromKeys.length;
		var maxLimitName = "__maxTo" + fromDeep;
		var minLimitName = "__minFrom" + fromDeep;

		var index = this._index.recordIndexFrom;

		var currentIndex = index
			, stashedIndexes = []
			, currentDeep = 1
			, currentDeepDiff = fromDeep - currentDeep
		;

		function checkRecords(records) {var $D$13;var $D$14;var $D$15;
			if( !records ) {
				return;
			}

			$D$13 = GET_ITER$0(records);$D$14 = $D$13 === 0;$D$15 = ($D$14 ? records.length : void 0);for( var record ; $D$14 ? ($D$13 < $D$15) : !($D$15 = $D$13["next"]())["done"]; ){record = ($D$14 ? records[$D$13++] : $D$15["value"]);
				var from = record.from, to = record.to;
				if( from <= fragmentFrom && to >= fragmentTo ) {
					result.push(record);
				}
			};$D$13 = $D$14 = $D$15 = void 0;
		}

		while( intValue > 0 ) {
			var keyValue = fromKeys[currentDeep - 1];
			var indexValue;

			var decrementKeys = true;

			if( indexValue = currentIndex[keyValue] ) {
				if( indexValue[minLimitName] <= fragmentFrom && indexValue[maxLimitName] >= fragmentTo ) {
					if( currentDeep === fromDeep ) {
						checkRecords(indexValue.__value);
					}
					else {
						currentDeep++;
						currentDeepDiff = fromDeep - currentDeep;
						stashedIndexes.push(currentIndex);
						currentIndex = indexValue;

						decrementKeys = false;
					}
				}
			}

			if( decrementKeys ) {
				var updateKeys = true;

				if( currentDeepDiff ) {
					intValue = intValue - (1 + (fromKeys.slice(currentDeep).join("") | 0));
				}
				else {//max deep
					intValue--;
					updateKeys = (fromKeys[currentDeep - 1] = fromKeys[currentDeep - 1] - 1) < 0;
				}

				if( updateKeys ) {
					fromKeys = (intValue + "").split("").map(toNumbers_fn);

					if( fromDeep !== fromKeys.length ) {
						fromDeep = fromKeys.length;
						maxLimitName = "__maxTo" + fromDeep;
						minLimitName = "__minFrom" + fromDeep;
					}

					if( currentDeep > 1 ) {
						currentIndex = stashedIndexes.pop();
						currentDeep--;
						currentDeepDiff = fromDeep - currentDeep;
					}
				}
			}
		}

		return result;
	}

	StringAlter.prototype.hasChanges = function() {
		return !!(this._fragments.length || this._fragmentStatesArray.length);
	}

	/**
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {Record}
	 */
	StringAlter.prototype.get = function(from, to) {
		var recordKey = from + "|" + to;
		if( this._records[recordKey] ) {
			return this._records[recordKey];
		}

		var record = this._records[recordKey] = new Record(from, to);

		this._addRecordToIndex(record, from, to);

		var recordFragments = this._findRecordFragments(from, to);

		if( recordFragments && recordFragments.length ) {
			// [new get logic]
			record.sub(recordFragments);
		}
		record._source = this._source;//TODO:: [new get logic] after new get logic completed remove this line

		return record;
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
		return this.updateRecord({from: pos, to: pos}, offsets, true).from;
	}

	StringAlter.prototype.updateRecord = function($D$0) {var from = $D$0.from, to = $D$0.to;var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;var considerExtends = arguments[2];if(considerExtends === void 0)considerExtends = false;//TODO:: optimize function speed
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
						if( considerExtends || offset !== originalFrom ) {
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

	StringAlter.prototype.groupedFragments = function() {var fragments = arguments[0];if(fragments === void 0)fragments = this._fragments;
		var lastStart, lastEnd, groupFrag, groupFragIndex;
		for( var fragmentsLength = fragments.length - 1 ; fragmentsLength >= 0 ;  fragmentsLength-- ) {
			var frag = fragments[fragmentsLength];
			var from = (to = frag.record).from, to = to.to;
			var groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag.type !== Fragment.Types.insert || (frag.options || {}).extend
				;

			if( lastEnd &&
				(
					from > lastStart && to < lastEnd
						|| (groupFragExtend && currFragExtend && (from >= lastStart && to <= lastEnd))
					)
				) {
				groupFrag.sub(frag);
				fragments.splice(fragmentsLength, 1);
			}
			else if( lastEnd &&
				(
					from < lastStart && to > lastEnd
						|| (groupFragExtend && currFragExtend && (from <= lastStart && to >= lastEnd))
					)
				) {
				frag.sub(groupFrag);
				fragments.splice(groupFragIndex, 1);
				groupFrag = frag;
			}
			else {
				lastStart = from;
				lastEnd = to;
				groupFrag = frag;
				groupFragIndex = fragmentsLength;
			}
		}
		return fragments;
	}

	StringAlter.prototype.setState = function(newStateName) {
		if( !this._fragmentStates[newStateName] ) {
			this._fragmentStatesArray.push(this._fragmentStates[newStateName] = []);
		}
		if( !this._fragmentStates[this.__currentStateName] ) {
			this._fragmentStates[this.__currentStateName] = this._fragments;
		}
		this.__prevStateName = this.__currentStateName;
		this.__currentStateName = newStateName;
		this._fragments = this._fragmentStates[newStateName];
	}

	StringAlter.prototype.restoreState = function() {
		var frags = this._fragmentStates[this.__currentStateName = this.__prevStateName];
		if( frags ) {
			this._fragments = frags;
		}
	}

	StringAlter.prototype.apply = function() {var $D$2;var forcePreparation = arguments[0];if(forcePreparation === void 0)forcePreparation = false;
		var offsets = this._offsets;
		var fragments = this._fragments;
		var sourceString = this._source;
		var fragmentsLength = fragments.length;

		if( fragmentsLength && (fragments[0].originalIndex === void 0 || forcePreparation === true) ) {
			var fragmentsGroups = Object.create(null);
			for( var index = 0 ; index < fragmentsLength ;  index++ ) {
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
//					let prev = index ? fragments[index - 1] : {options: {priority : 1}};

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
		}

		// create sub fragments
		fragments = this.groupedFragments(fragments);
		fragmentsLength = fragments.length;

		var outsStr = "", outs = [];

		var pos = this.updatePosition(0, offsets)
			, clearPos = 0
			//, posOffset = 0
		;

		if( pos !== 0 ) {
			outsStr = sourceString.slice(0, pos);
		}

		var currentOffsets = offsets.slice();
		var postFragments = [];

		for (var index$0 = 0; index$0 < fragmentsLength; index$0++) {
			var frag$0 = fragments[index$0];
			var fragOptions = (frag$0.options || {});

			if( typeof fragOptions.before === "function" ) {
				fragOptions.before.call(frag$0);
			}

			var expressionsLength = frag$0.extractData(this._records);

			var from = (to = this.updateRecord(frag$0.record, currentOffsets)).from, to = to.to;
			if( frag$0.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, "'pos' (" + pos + ") shoulde be <= 'start' (" + from + ") or 'start' (" + from + ") == 'end' (" + to + ")"
			);
			assert(from <= to, "from (" + from + ") should be <= to (" + to + ")");

			if( fragOptions.applyChanges && expressionsLength ) {
				var anotherFrag = void 0;
				if(
					( frag$0.maxTo > frag$0.record.to && (anotherFrag = fragments[index$0 + 1]) && anotherFrag.record.from < frag$0.maxTo )
					|| ( frag$0.minFrom < frag$0.record.from && (anotherFrag = fragments[index$0 - 1]) && anotherFrag.record.to > frag$0.minFrom )
				) {
					postFragments.push(frag$0);
					continue;
				}
			}

			var subFragments = frag$0.sub();
			if( subFragments ) {
				outsStr += outs.join("");

				var subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, subFragments
					, this._offsets
					, this._records
				);
				sourceString = subAlter.apply();

				var offsetPos = this.updatePosition(clearPos, offsets);

				pos = offsetPos;

				offsets = this._offsets;
				currentOffsets = this._offsets.slice();
				from = ($D$2 = this.updateRecord(frag$0.record, offsets)).from, to = $D$2.to, $D$2;
				outs = [];
			}

			var string = void 0;
			if( fragOptions.__newTransitionalSubLogic && expressionsLength ) {// [new get logic]
				string = "";
				var data = frag$0.data
					, dataLength = data.length
				;
				for( var index$1 = 0 ; index$1 < expressionsLength ; index$1++ ) {
					if( dataLength ) {
						string += data[index$1];
					}

					var record = frag$0.expressions[index$1];

					if( record.__raw ) {
						string += record.__raw;
					}
					else {
						var sourceString$0 = record._source.substring(record.from, record.to);//this._source.substring(record.from, record.to);
						var subFragments$0 = record.sub();
						if( subFragments$0 ) {
							var alter = new StringAlter(sourceString$0, subFragments$0, [-record.from]);
							sourceString$0 = alter.apply(true);
						}
						string += (record.__raw = sourceString$0);
					}
				}
				string += data[expressionsLength];
			}
			else if( expressionsLength ) {//old logic
				string = "";
				var data$0 = frag$0.data
					, dataLength$0 = data$0.length
				;
				for( var index$2 = 0 ; index$2 < expressionsLength ; index$2++ ) {
					if( dataLength$0 ) {
						string += data$0[index$2];
					}
				
					var record$0 = frag$0.expressions[index$2];
					record$0 = this.updateRecord(record$0, currentOffsets);
					string += sourceString.substring(record$0.from, record$0.to);
				}
				string += data$0[expressionsLength];
			}
			else {
				string = frag$0.data;
			}

			{
				var transform = fragOptions.transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag$0, string);
				}
			}

			var offset = string.length - ( to - from );
			if( offset ) {
				var newIsAdding = to === from && !fragOptions.extend
					, newIndex = frag$0.record.from
					, value = offsets[newIndex] || 0
					, insertingValue = value | 0
					, addingValue = void 0
				;

				value += "";
				var index$3 = value.indexOf(".");
				if( index$3 !== -1 ) {//adding
					addingValue = +(value.substr(index$3 + 1));
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
			clearPos = ($D$2 = frag$0.record).to, $D$2;
		}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		sourceString = outsStr + outs.join("");

		this._fragmentStatesArray.unshift(postFragments);

		while( postFragments = this._fragmentStatesArray.shift() ) {
			if( postFragments.length ) {
				var subAlter$0 = new StringAlter(
					sourceString
					, postFragments
					, this._offsets
				);
				sourceString = subAlter$0.apply();
			}
		}

		this.reset();

		return sourceString;
	}
return StringAlter;})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
