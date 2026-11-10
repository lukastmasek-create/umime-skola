// Spouští se synchronně před vykreslením stránky, aby se předešlo probliknutí
// špatného motivu/velikosti písma při načtení (localStorage čteme jen tady,
// mimo React strom, protože musí doběhnout dřív než první render).
export const THEME_INIT_SCRIPT = `(function(){
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
    var font = localStorage.getItem('font');
    if (font === 'classic') root.setAttribute('data-font', font);
    var fontSize = localStorage.getItem('fontSize');
    if (fontSize === 'small' || fontSize === 'large') root.setAttribute('data-font-size', fontSize);
    var accent = localStorage.getItem('accent');
    if (accent && /^#[0-9a-f]{6}$/.test(accent)) {
      var st = root.style;
      st.setProperty('--brand-500', accent);
      st.setProperty('--brand-600', 'color-mix(in srgb, ' + accent + ' 80%, black)');
      st.setProperty('--brand-700', 'color-mix(in srgb, ' + accent + ' 60%, black)');
      st.setProperty('--brand-50', 'color-mix(in srgb, ' + accent + ' 12%, var(--surface))');
      st.setProperty('--brand-100', 'color-mix(in srgb, ' + accent + ' 24%, var(--surface))');
    }
    if (localStorage.getItem('motion') === 'off') root.setAttribute('data-motion', 'off');
  } catch (e) {}
})();`;
