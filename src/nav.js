export function initNav(
  jump,
  { document: doc = document, window: win = window, history: hist = history } = {},
) {
  const links = doc.querySelectorAll('#mainNav a');

  for (const link of links) {
    if (link.hash) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        hist.pushState(null, '', link.hash);
        jump(link.hash);
      });
    }
  }

  if (win.location.hash) {
    jump(win.location.hash);
  }
}
