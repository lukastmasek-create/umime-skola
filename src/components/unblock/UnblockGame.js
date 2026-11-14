"use client";
"use strict";
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
exports.UnblockGame = UnblockGame;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var levels_1 = require("@/lib/unblock/levels");
var logic_1 = require("@/lib/unblock/logic");
var questions_1 = require("@/lib/unblock/questions");
var WOOD = [
    ["#e7bc84", "#b9793f"],
    ["#d9a46a", "#a86a36"],
    ["#c58b52", "#8f5728"],
    ["#eccb9a", "#c08a4e"],
    ["#b8763c", "#7a4522"],
    ["#dcae78", "#9c6232"],
];
var CHERRY = ["#b4442c", "#6e2112"];
var cell = 100 / logic_1.SIZE;
function blockBg(b, idx) {
    var _a = b.id === logic_1.TARGET_ID ? CHERRY : WOOD[idx % WOOD.length], light = _a[0], dark = _a[1];
    var grain = b.orient === "h" ? "90deg" : "180deg";
    return "repeating-linear-gradient(".concat(grain, ", rgba(255,255,255,0.09) 0 2px, rgba(0,0,0,0.05) 2px 7px, transparent 7px 13px), linear-gradient(135deg, ").concat(light, ", ").concat(dark, ")");
}
function Lock(_a) {
    var open = _a.open;
    return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", width: "22", height: "22", "aria-hidden": true, fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: open ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2", fill: "currentColor", stroke: "none", opacity: "0.85" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 11V7a4 4 0 0 1 8 0" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2", fill: "currentColor", stroke: "none", opacity: "0.85" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" })] })) }));
}
function UnblockGame() {
    var _a = (0, react_1.useState)(0), levelIdx = _a[0], setLevelIdx = _a[1];
    var _b = (0, react_1.useState)(levels_1.LEVELS[0].blocks), blocks = _b[0], setBlocks = _b[1];
    var _c = (0, react_1.useState)(0), moves = _c[0], setMoves = _c[1];
    var _d = (0, react_1.useState)(null), round = _d[0], setRound = _d[1];
    var _e = (0, react_1.useState)(0), offset = _e[0], setOffset = _e[1];
    var _f = (0, react_1.useState)(null), unlockedId = _f[0], setUnlockedId = _f[1];
    var _g = (0, react_1.useState)(null), dialogId = _g[0], setDialogId = _g[1];
    var _h = (0, react_1.useState)(""), input = _h[0], setInput = _h[1];
    var _j = (0, react_1.useState)(false), wrong = _j[0], setWrong = _j[1];
    var _k = (0, react_1.useState)(0), wrongTotal = _k[0], setWrongTotal = _k[1];
    var _l = (0, react_1.useState)(null), drag = _l[0], setDrag = _l[1];
    var _m = (0, react_1.useState)("Tap a locked block to answer its question. Correct = it slides free."), hint = _m[0], setHint = _m[1];
    var _o = (0, react_1.useState)(false), won = _o[0], setWon = _o[1];
    var boardRef = (0, react_1.useRef)(null);
    // Random round only on the client (avoids hydration mismatch).
    (0, react_1.useEffect)(function () {
        setRound((0, questions_1.pickRound)());
    }, []);
    var reset = function (idx) {
        setLevelIdx(idx);
        setBlocks(levels_1.LEVELS[idx].blocks);
        setMoves(0);
        setWrongTotal(0);
        setOffset(0);
        setUnlockedId(null);
        setDialogId(null);
        setDrag(null);
        setWon(false);
        setRound((0, questions_1.pickRound)());
        setHint("Tap a locked block to answer its question. Correct = it slides free.");
    };
    var commitMove = function (id, target, from) {
        var next = (0, logic_1.moveBlock)(from, id, target);
        setBlocks(next);
        setMoves(function (m) { return m + 1; });
        setUnlockedId(null);
        if ((0, logic_1.isSolved)(next)) {
            setWon(true);
            setHint("Through the exit! Puzzle solved.");
        }
        else {
            setHint("Nice slide. Answer another question to move again.");
        }
    };
    var onBlockPointerDown = function (e, b) {
        if (won || dialogId || !boardRef.current)
            return;
        e.preventDefault();
        var size = boardRef.current.getBoundingClientRect().width;
        var px = size / logic_1.SIZE;
        var _a = (0, logic_1.slideRange)(blocks, b.id), min = _a.min, max = _a.max;
        var start = (0, logic_1.along)(b);
        var horiz = b.orient === "h";
        var unlocked = unlockedId === b.id;
        var sx = e.clientX;
        var sy = e.clientY;
        var moved = false;
        var d = 0;
        if (unlocked)
            setDrag({ id: b.id, d: 0 });
        var onMove = function (ev) {
            var delta = horiz ? ev.clientX - sx : ev.clientY - sy;
            if (Math.abs(delta) > 6)
                moved = true;
            if (!unlocked)
                return;
            d = Math.min(Math.max(delta / px, min - start), max - start);
            setDrag({ id: b.id, d: d });
        };
        var onUp = function () {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            if (!unlocked) {
                if (!moved) {
                    setDialogId(b.id);
                    setInput("");
                    setWrong(false);
                }
                else {
                    setHint("Locked! Tap the block to answer its question first.");
                }
                return;
            }
            setDrag(null);
            var target = Math.min(Math.max(Math.round(start + d), min), max);
            if (target !== start)
                commitMove(b.id, target, blocks);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    };
    var dialogIdx = dialogId ? blocks.findIndex(function (b) { return b.id === dialogId; }) : -1;
    var dialogQ = round && dialogIdx >= 0 ? (0, questions_1.questionFor)(round, dialogIdx, offset) : null;
    var submit = function () {
        if (!dialogQ || !dialogId)
            return;
        if ((0, questions_1.checkAnswer)(dialogQ, input)) {
            setUnlockedId(dialogId);
            setOffset(function (o) { return o + 1; });
            setDialogId(null);
            setInput("");
            setWrong(false);
            setHint("Correct! Block is free to slide once. Questions rotated.");
        }
        else {
            setWrong(true);
            setWrongTotal(function (n) { return n + 1; });
        }
    };
    var frame = {
        background: "linear-gradient(160deg, #6b4423, #3d2412 70%)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,220,160,0.25)",
    };
    var boardBg = {
        background: "repeating-linear-gradient(0deg, rgba(90,50,20,0.06) 0 1px, transparent 1px 11px), linear-gradient(135deg, #d8ad74, #b07d45)",
        boxShadow: "inset 0 4px 12px rgba(40,20,5,0.55), inset 0 0 0 2px #4a2a12",
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mx-auto flex w-full max-w-xl flex-col gap-6 text-[#f6e7cc] select-none", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-[#8a5a2b] bg-[#2a1808] px-4 py-2 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] uppercase tracking-widest text-[#d9a46a]", children: "Moves" }), (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold tabular-nums", "aria-live": "polite", children: moves })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-[#8a5a2b] bg-[#2a1808] px-4 py-2 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] uppercase tracking-widest text-[#d9a46a]", children: "Wrong" }), (0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold tabular-nums", children: wrongTotal })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return reset(levelIdx); }, className: "rounded-xl bg-gradient-to-b from-[#c98a4b] to-[#8a5524] px-5 py-3 font-semibold text-[#2a1606] shadow-md transition hover:brightness-110 active:scale-95", children: "Reset" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: levels_1.LEVELS.map(function (lv, i) { return ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: function () { return reset(i); }, className: "rounded-full px-3 py-1 text-sm font-medium transition ".concat(i === levelIdx ? "bg-[#f0c27a] text-[#2a1606]" : "bg-[#3d2412] text-[#e9cfa0] hover:bg-[#4f3018]"), children: [i + 1, ". ", lv.name] }, lv.name)); }) }), round && ((0, jsx_runtime_1.jsxs)("span", { className: "rounded-full border border-[#b4442c] bg-[#5a1f12] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ffd7b8]", children: [round.type, " round"] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "relative rounded-[22px] p-3.5 sm:p-4", style: frame, children: (0, jsx_runtime_1.jsxs)("div", { ref: boardRef, className: "relative aspect-square w-full rounded-lg", style: __assign(__assign({}, boardBg), { position: "relative", aspectRatio: "1 / 1" }), children: [blocks.map(function (b, idx) {
                            var pos = (drag === null || drag === void 0 ? void 0 : drag.id) === b.id ? (0, logic_1.along)(b) + drag.d : (0, logic_1.along)(b);
                            var left = b.orient === "h" ? pos : b.c;
                            var top = b.orient === "v" ? pos : b.r;
                            var isTarget = b.id === logic_1.TARGET_ID;
                            var unlocked = unlockedId === b.id;
                            var dragging = (drag === null || drag === void 0 ? void 0 : drag.id) === b.id;
                            var q = round && !isTarget ? (0, questions_1.questionFor)(round, idx, offset) : null;
                            return ((0, jsx_runtime_1.jsx)("div", { role: "button", tabIndex: 0, "aria-label": "Block ".concat(b.id).concat(unlocked ? " unlocked" : " locked, answer its question"), onPointerDown: function (e) { return onBlockPointerDown(e, b); }, onKeyDown: function (e) {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        if (!unlocked) {
                                            setDialogId(b.id);
                                            setInput("");
                                            setWrong(false);
                                        }
                                    }
                                }, className: "touch-none rounded-[9px] text-[#fff6e6] outline-none focus-visible:ring-4 focus-visible:ring-[#f0c27a] ".concat(unlocked ? "ring-4 ring-[#ffd76a]" : ""), style: {
                                    position: "absolute",
                                    left: "calc(".concat(left * cell, "% + 4px)"),
                                    top: "calc(".concat(top * cell, "% + 4px)"),
                                    width: b.orient === "h" ? "calc(".concat(b.len * cell, "% - 8px)") : "calc(".concat(cell, "% - 8px)"),
                                    height: b.orient === "v" ? "calc(".concat(b.len * cell, "% - 8px)") : "calc(".concat(cell, "% - 8px)"),
                                    background: blockBg(b, idx),
                                    boxShadow: dragging
                                        ? "0 16px 22px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)"
                                        : "0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25)",
                                    transition: dragging ? "none" : "left .2s ease, top .2s ease, box-shadow .2s",
                                    cursor: won ? "default" : unlocked ? "grab" : "pointer",
                                    zIndex: dragging ? 10 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }, children: isTarget ? ((0, jsx_runtime_1.jsx)("span", { className: "font-bold tracking-widest text-[#ffe2c4] drop-shadow", children: "KEY" })) : ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1 font-bold drop-shadow ".concat(unlocked ? "text-[#ffe9a8]" : "text-[#fff1d6]/90"), children: [(0, jsx_runtime_1.jsx)(Lock, { open: unlocked }), !unlocked && q && (0, jsx_runtime_1.jsx)("span", { className: "hidden text-xs opacity-80 sm:inline", children: q.type === "number" ? "#" : "Aa" })] })) }, b.id));
                        }), (0, jsx_runtime_1.jsx)("div", { "aria-hidden": true, className: "flex items-center justify-center rounded-r-md bg-[#2a1608] text-[10px] text-[#ffd7a0]", style: {
                                position: "absolute",
                                left: "100%",
                                top: "calc(".concat(logic_1.EXIT_ROW * cell, "% + 4px)"),
                                width: "14px",
                                height: "calc(".concat(cell, "% - 8px)"),
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
                            }, children: "\u25B6" })] }) }), (0, jsx_runtime_1.jsx)("p", { className: "min-h-[3rem] text-center text-sm text-[#e9cfa0]", role: "status", children: hint }), dialogQ && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4", role: "dialog", "aria-modal": "true", "aria-labelledby": "unblock-q", onKeyDown: function (e) { return e.key === "Escape" && setDialogId(null); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-sm rounded-2xl border-2 border-[#b07d45] bg-[#f4dcb4] p-6 text-[#2a1606] shadow-2xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-[#8a4a22]", children: dialogQ.type === "number" ? "Number question" : "Word question" }), (0, jsx_runtime_1.jsx)("h2", { id: "unblock-q", className: "mb-4 text-xl font-bold", children: dialogQ.prompt }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: function (e) {
                                e.preventDefault();
                                submit();
                            }, children: [(0, jsx_runtime_1.jsx)("input", { autoFocus: true, value: input, onChange: function (e) {
                                        setInput(e.target.value);
                                        setWrong(false);
                                    }, inputMode: dialogQ.type === "number" ? "decimal" : "text", placeholder: dialogQ.type === "number" ? "type a number" : "type a word", className: "w-full rounded-lg border-2 bg-white px-3 py-2 text-lg outline-none ".concat(wrong ? "animate-[unbshake_.3s] border-[#b4442c]" : "border-[#b07d45] focus:border-[#6e2112]") }), wrong && (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm font-semibold text-[#b4442c]", children: "Not quite. Try again." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return setDialogId(null); }, className: "flex-1 rounded-lg border-2 border-[#8a5a2b] px-4 py-2 font-semibold", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "flex-1 rounded-lg bg-[#6e2112] px-4 py-2 font-semibold text-[#ffe9d0] hover:brightness-110", children: "Answer" })] })] })] }) })), won && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", role: "dialog", "aria-modal": "true", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-sm rounded-2xl border-2 border-[#f0c27a] bg-[#3d2412] p-7 text-center shadow-2xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-3xl font-extrabold text-[#ffd76a]", children: "Solved!" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-[#e9cfa0]", children: [moves, " moves \u00B7 ", wrongTotal, " wrong answers"] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return reset(levelIdx); }, className: "flex-1 rounded-lg border-2 border-[#8a5a2b] px-4 py-2 font-semibold text-[#f6e7cc]", children: "Replay" }), levelIdx < levels_1.LEVELS.length - 1 && ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: function () { return reset(levelIdx + 1); }, className: "flex-1 rounded-lg bg-gradient-to-b from-[#f0c27a] to-[#c98a4b] px-4 py-2 font-bold text-[#2a1606]", children: "Next puzzle" }))] })] }) })), (0, jsx_runtime_1.jsx)("style", { children: "@keyframes unbshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}" })] }));
}
