function createTag(tagName, styles = null) {
  const tag = document.createElement(tagName);
  if (styles && Array.isArray(styles)) tag.classList.add(...styles);
  return tag;
}

function setMeta(block) {
    const config = [...block.children];
    config.forEach(prop => {
        const [key, value] = [...prop.children];
        switch (key.textContent) {
            case 'overlay order':
                const overlays = value.textContent.split(', ');
                const guide = block.closest('.section').querySelector('.map-guide');
                if (overlays.length) overlays.reverse().forEach((o, i) => {
                    const oly = guide.querySelector(`.overlay[data-guide-id="${o.replaceAll(' ', '')}"]`);
                    oly.style.zIndex = i;
                });
                break;
            case 'info icon':
                const icon = value.querySelector('picture');
                if (icon) {
                    const btns = block.closest('.section').querySelector('.legend-btn');
                    if (btns) btns.appendChild(icon);
                }
                break;
            default:
                break;
        }
    })
}

function resetOverlays() {
    const overlays = document.querySelectorAll('[data-guide-active="true"]');
    overlays.forEach(overlay => overlay.setAttribute('data-guide-active', false))
    const buttons = document.querySelectorAll('.map-btn.active');
    buttons.forEach(btn => btn.classList.remove('active'));
}

function decorateArea([label, button, area], isReset) {
    const areaId = label.textContent.replaceAll(' ', '');
    const overlay = area.querySelector('picture');
    overlay?.classList.add('overlay');
    overlay?.setAttribute('data-guide-id', areaId);
    overlay?.setAttribute('data-guide-active', false);
    
    button.classList.add('map-btn');
    button.addEventListener('click', () => {
        if (isReset) resetOverlays();
        else {
            const area = document.querySelector(`[data-guide-id="${areaId}"]`);
            const active = JSON.parse(area.getAttribute('data-guide-active'));
            area.setAttribute('data-guide-active', !active);
            if (!active) button.classList.add('active');
            else button.classList.remove('active');
        }
    });

    const legend = createTag('div', ['map-legend']);
    const labelText = createTag('div', ['label']);
    labelText.innerText = label.textContent;
    legend.appendChild(labelText);
    legend.appendChild(button.cloneNode(true));

    return [overlay, button, legend];
}

function decorateLegend(info, btns) {
    const legendToggle = createTag('div', ['legend-btn', 'info-icon']);
    legendToggle.addEventListener('click', () => info.setAttribute('data-show-info', true));
    btns.appendChild(legendToggle);

    // add the close button to the legend items
    const close = createTag('div', ['map-legend']);
    const closeIcon = createTag('div', ['close-btn']);
    closeIcon.addEventListener('click', () => info.setAttribute('data-show-info', false));
    closeIcon.innerText = 'x';
    close.innerText = 'CLOSE';
    close.appendChild(closeIcon);
    info.closest('.map-info').appendChild(close);
}

export default function decorate(block) {
    if (block.classList.contains('meta')) {
        setMeta(block);
        return;
    }

    const [bgRow, ...areas] = [...block.children];
    const mapBg = bgRow.querySelector('picture');
    mapBg.classList.add('background');
    const background = mapBg.parentElement;
    background.classList.add('map-bgs');

    const btns = createTag('div', ['map-btns']);
    const info = createTag('div', ['map-info']);
    info.setAttribute('data-show-info', false);
    
    areas.forEach((area, areaIndex, arr) => {
        const [overlay, button, legend] = decorateArea(
            [...area.children],
            arr.length <= areaIndex + 1,
        );
        if (overlay) background.appendChild(overlay);
        btns.appendChild(button);
        info.appendChild(legend);
    });

    decorateLegend(info, btns);
    block.replaceChildren(background, btns, info);
}
