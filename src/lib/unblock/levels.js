"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVELS = void 0;
// X is the target (always horizontal, row 2). Board 6x6, exit on the right.
exports.LEVELS = [
    {
        name: "Warm-up",
        blocks: [
            { id: "X", orient: "h", r: 2, c: 0, len: 2 },
            { id: "A", orient: "v", r: 1, c: 2, len: 2 },
            { id: "B", orient: "v", r: 0, c: 4, len: 3 },
            { id: "C", orient: "h", r: 4, c: 0, len: 2 },
            { id: "D", orient: "v", r: 3, c: 5, len: 2 },
        ],
    },
    {
        name: "Side lane",
        blocks: [
            { id: "X", orient: "h", r: 2, c: 0, len: 2 },
            { id: "A", orient: "v", r: 0, c: 2, len: 3 },
            { id: "B", orient: "v", r: 1, c: 3, len: 2 },
            { id: "C", orient: "h", r: 0, c: 4, len: 2 },
            { id: "D", orient: "v", r: 1, c: 5, len: 2 },
            { id: "E", orient: "h", r: 3, c: 3, len: 2 },
            { id: "F", orient: "v", r: 3, c: 0, len: 3 },
        ],
    },
    {
        name: "Tight squeeze",
        blocks: [
            { id: "X", orient: "h", r: 2, c: 1, len: 2 },
            { id: "A", orient: "v", r: 0, c: 0, len: 3 },
            { id: "B", orient: "v", r: 0, c: 3, len: 2 },
            { id: "C", orient: "v", r: 1, c: 4, len: 3 },
            { id: "D", orient: "h", r: 0, c: 4, len: 2 },
            { id: "E", orient: "h", r: 3, c: 0, len: 2 },
            { id: "F", orient: "v", r: 3, c: 2, len: 2 },
            { id: "G", orient: "h", r: 5, c: 3, len: 2 },
        ],
    },
    {
        name: "Long way round",
        blocks: [
            { id: "X", orient: "h", r: 2, c: 0, len: 2 },
            { id: "A", orient: "v", r: 0, c: 2, len: 2 },
            { id: "B", orient: "v", r: 2, c: 2, len: 2 },
            { id: "C", orient: "v", r: 0, c: 3, len: 3 },
            { id: "D", orient: "h", r: 4, c: 0, len: 2 },
            { id: "E", orient: "v", r: 3, c: 4, len: 2 },
            { id: "F", orient: "h", r: 0, c: 4, len: 2 },
            { id: "G", orient: "v", r: 0, c: 5, len: 3 },
            { id: "H", orient: "h", r: 5, c: 1, len: 3 },
        ],
    },
    {
        name: "Gridlock",
        blocks: [
            { id: "X", orient: "h", r: 2, c: 1, len: 2 },
            { id: "A", orient: "v", r: 0, c: 0, len: 2 },
            { id: "B", orient: "v", r: 0, c: 1, len: 2 },
            { id: "C", orient: "h", r: 0, c: 2, len: 2 },
            { id: "D", orient: "v", r: 1, c: 2, len: 3 },
            { id: "E", orient: "v", r: 0, c: 4, len: 2 },
            { id: "F", orient: "v", r: 2, c: 3, len: 2 },
            { id: "G", orient: "h", r: 3, c: 0, len: 3 },
            { id: "H", orient: "v", r: 3, c: 5, len: 3 },
            { id: "I", orient: "h", r: 5, c: 2, len: 2 },
        ],
    },
];
