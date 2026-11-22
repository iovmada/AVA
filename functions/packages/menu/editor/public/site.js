for (const menu of document.querySelectorAll('[data-menu]')) {
  const filters = menu.querySelectorAll('[data-menu-filter]');
  const groups = menu.querySelectorAll('[data-menu-group]');

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      const category = filter.dataset.menuFilter;
      for (const option of filters) {
        option.setAttribute('aria-pressed', String(option === filter));
      }
      for (const group of groups) {
        group.hidden = group.dataset.menuGroup !== category;
      }
    });
  }
}
