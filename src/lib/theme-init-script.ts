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
    if (localStorage.getItem('motion') === 'off') root.setAttribute('data-motion', 'off');
  } catch (e) {}
})();`;
