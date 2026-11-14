"use strict";
// Pure sliding-block logic (6x6). No React, no DOM: testable with node.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxPos = exports.along = exports.EXIT_ROW = exports.TARGET_ID = exports.SIZE = void 0;
exports.cells = cells;
exports.canOccupy = canOccupy;
exports.slideRange = slideRange;
exports.moveBlock = moveBlock;
exports.isSolved = isSolved;
exports.minMoves = minMoves;
exports.SIZE = 6;
exports.TARGET_ID = "X";
exports.EXIT_ROW = 2;
var along = function (b) { return (b.orient === "h" ? b.c : b.r); };
exports.along = along;
var maxPos = function (b) {
    // target may slide until only its left cell is still on the board (exit)
    return b.id === exports.TARGET_ID ? exports.SIZE - b.len + 1 : exports.SIZE - b.len;
};
exports.maxPos = maxPos;
function cells(b, p) {
    if (p === void 0) { p = (0, exports.along)(b); }
    var out = [];
    for (var i = 0; i < b.len; i++)
        out.push(b.orient === "h" ? [b.r, p + i] : [p + i, b.c]);
    return out;
}
function canOccupy(blocks, id, p) {
    var self = blocks.find(function (b) { return b.id === id; });
    if (!self)
        return false;
    if (p < 0 || p > (0, exports.maxPos)(self))
        return false;
    var taken = new Set();
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var o = blocks_1[_i];
        if (o.id !== id)
            for (var _a = 0, _b = cells(o); _a < _b.length; _a++) {
                var _c = _b[_a], r = _c[0], c = _c[1];
                taken.add("".concat(r, ",").concat(c));
            }
    }
    for (var _d = 0, _e = cells(self, p); _d < _e.length; _d++) {
        var _f = _e[_d], r = _f[0], c = _f[1];
        if (r < 0 || r >= exports.SIZE || c < 0 || c >= exports.SIZE)
            continue; // off-board part is only ever the exit
        if (taken.has("".concat(r, ",").concat(c)))
            return false;
    }
    return true;
}
/** Inclusive range of positions block `id` may slide to right now. */
function slideRange(blocks, id) {
    var self = blocks.find(function (b) { return b.id === id; });
    var start = (0, exports.along)(self);
    var min = start;
    while (min - 1 >= 0 && canOccupy(blocks, id, min - 1))
        min--;
    var max = start;
    while (max + 1 <= (0, exports.maxPos)(self) && canOccupy(blocks, id, max + 1))
        max++;
    return { min: min, max: max };
}
function moveBlock(blocks, id, p) {
    return blocks.map(function (b) { return (b.id !== id ? b : b.orient === "h" ? __assign(__assign({}, b), { c: p }) : __assign(__assign({}, b), { r: p })); });
}
function isSolved(blocks) {
    var t = blocks.find(function (b) { return b.id === exports.TARGET_ID; });
    return !!t && t.c + t.len > exports.SIZE;
}
/** Breadth-first search: minimal number of slides to solve, or -1. Used by tests / tooling. */
function minMoves(start, limit) {
    if (limit === void 0) { limit = 500000; }
    var key = function (bs) { return bs.map(function (b) { return "".concat(b.id).concat((0, exports.along)(b)); }).join("|"); };
    var seen = new Set([key(start)]);
    var frontier = [start];
    var depth = 0;
    while (frontier.length) {
        var next = [];
        for (var _i = 0, frontier_1 = frontier; _i < frontier_1.length; _i++) {
            var state = frontier_1[_i];
            if (isSolved(state))
                return depth;
            for (var _a = 0, state_1 = state; _a < state_1.length; _a++) {
                var b = state_1[_a];
                var _b = slideRange(state, b.id), min = _b.min, max = _b.max;
                for (var p = min; p <= max; p++) {
                    if (p === (0, exports.along)(b))
                        continue;
                    var ns = moveBlock(state, b.id, p);
                    var k = key(ns);
                    if (seen.has(k))
                        continue;
                    seen.add(k);
                    if (seen.size > limit)
                        return -1;
                    next.push(ns);
                }
            }
        }
        frontier = next;
        depth++;
    }
    return -1;
}
