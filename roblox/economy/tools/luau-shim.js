// Minimal Luau -> Lua 5.3 source shim (compound assignment, interpolated strings) for running pure-logic tests.
function shim(src) {
  // interpolated strings
  src = src.replace(/`([^`\n]*)`/g, (m, body) => {
    const parts = []; let i = 0, lit = '';
    while (i < body.length) {
      if (body[i] === '{') { const j = body.indexOf('}', i); parts.push(JSON.stringify(lit)); lit = ''; parts.push('tostring(' + body.slice(i + 1, j) + ')'); i = j + 1; }
      else lit += body[i++];
    }
    parts.push(JSON.stringify(lit));
    return '(' + parts.join(' .. ') + ')';
  });
  // compound assignment
  const re = /([A-Za-z_][\w]*(?:\.[A-Za-z_]\w*|\[[^\]\n]*\])*)\s*(\+|-|\*|\/|\.\.)=(?!=)\s*/g;
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex, depth = 0;
    while (i < src.length) {
      const c = src[i];
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (depth === 0) break; depth--; }
      else if (depth === 0 && (c === '\n' || c === ';')) break;
      else if (depth === 0 && /^\s(end|else|elseif|return|local|break)\b/.test(src.slice(i, i + 9))) break;
      else if (c === '"' || c === "'") { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } }
      i++;
    }
    const rhs = src.slice(re.lastIndex, i);
    out += src.slice(last, m.index) + `${m[1]} = ${m[1]} ${m[2]} (${rhs})`;
    last = i; re.lastIndex = i;
  }
  return out + src.slice(last);
}
module.exports = shim;
