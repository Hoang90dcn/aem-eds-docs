/**
 * Tabs Component
 */

export function createTabs({
  container,
  tabs = [],
  activeIndex = 0,
  onChange = () => {},
}) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'featured-products__tabs-wrapper';

  const buttons = [];

  function setActive(index) {
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
    });

    activeIndex = index;
  }

  tabs.forEach((tab, index) => {
    const button = document.createElement('button');

    button.type = 'button';

    button.className = 'featured-products__tab';

    button.textContent = tab.title;

    if (index === activeIndex) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      if (index === activeIndex) {
        return;
      }

      setActive(index);

      onChange(index);
    });

    buttons.push(button);

    wrapper.append(button);
  });

  container.append(wrapper);

  return {
    update(index) {
      setActive(index);
    },

    destroy() {
      buttons.forEach((button) => {
        button.replaceWith(button.cloneNode(true));
      });
    },
  };
}