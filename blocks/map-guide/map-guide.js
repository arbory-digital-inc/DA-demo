function createTag(tagName, styles = null) {
  const tag = document.createElement(tagName);
  if (styles && Array.isArray(styles)) tag.classList.add(...styles);
  return tag;
}

function useMeta(block) {
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
                    const btns = block.closest('.section').querySelector('.info-btn');
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

function decorateOverlay([label, button, area], type = 'btn') {
    const areaId = label.textContent.replaceAll(' ', '');
    const overlay = area.querySelector('picture');
    overlay?.classList.add('overlay');
    overlay?.setAttribute('data-guide-id', areaId);
    overlay?.setAttribute('data-guide-active', false);
    
    button.classList.add(type === 'close' ? 'close-btn' : 'map-btn');
    button.addEventListener('click', () => {
        if (type === 'reset') resetOverlays();
        else {
            const area = document.querySelector(`[data-guide-id="${areaId}"]`);
            const active = JSON.parse(area.getAttribute('data-guide-active'));
            area.setAttribute('data-guide-active', !active);
            if (!active) button.classList.add('active');
            else button.classList.remove('active');
        }
    });

    const legend = createTag('div', ['map-overlay']);
    const labelText = createTag('div', ['label']);
    labelText.innerText = label.textContent;
    legend.appendChild(labelText);
    legend.appendChild(button.cloneNode(true));
    const closeLegend = legend.querySelector('.close-btn');
    closeLegend?.addEventListener('click', () => {
        const guide = document.querySelector(`[data-show-info]`);
        guide.setAttribute('data-show-info', false);
    })

    return [overlay, button, legend];
}

function decorateLegend(block, btns) {
    const btn = createTag('div', ['info-btn']);
    btn.addEventListener('click', () => block.setAttribute('data-show-info', true));
    btns.appendChild(btn);
}

export default function decorate(block) {
    if (block.classList.contains('meta')) {
        useMeta(block);
        return;
    }

    block.setAttribute('data-show-info', false);
    const [bgRow, ...overlays] = [...block.children];
    const mapBg = bgRow.querySelector('picture');
    mapBg?.classList.add('background');
    const background = mapBg?.parentElement;
    background?.classList.add('map-bgs');

    const btns = createTag('div', ['map-btns']);
    const info = createTag('div', ['map-info']);
    
    overlays.forEach(overlay => {
        const type = overlay === overlays.at(-1) ? 'close' : overlay === overlays.at(-2) ? 'reset' : 'btn';
        const [bg, btn, label] = decorateOverlay([...overlay.children], type);
        if (bg) background.appendChild(bg);
        btns.appendChild(btn);
        info.appendChild(label);
    });

    decorateLegend(block, btns);
    block.replaceChildren(background, btns, info);
}
