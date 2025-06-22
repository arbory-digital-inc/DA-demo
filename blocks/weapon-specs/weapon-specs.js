// these first two functions could be utils
function createTag(tagName, styles = null) {
  const tag = document.createElement(tagName);
  if (styles && Array.isArray(styles)) tag.classList.add(...styles);
  return tag;
}

// removes useless wrappers
function cleanup(el) {
    el.firstElementChild.replaceWith(...el.firstElementChild.childNodes);
}

export default function decorate(block) {
    // this block requires a section to support multiblock layout
    const section = block.closest('.section');

    // create a wrapper if one isn't already present
    if (!section.querySelector('.weapon-specs-table')) {
        const specs = section.querySelectorAll('.weapon-specs-wrapper');
        if (!specs.length) return;
        const table = createTag('div', ['weapon-specs-table']);
        specs.forEach(spec => table.appendChild(spec.firstElementChild));
        section.replaceChildren(table);
    }

    // remove useless wrappers (in this case)
    if (block.children.length === 1) cleanup(block);

    // adjustments spec table uses a variant style
    if (block.classList.contains('adjust-spec')) {
        const adjTable = createTag('div', ['adjust-table']);
        const tableContent = [...block.children].slice(1);
        tableContent.forEach(spec => adjTable.appendChild(spec));
        cleanup(block);
        block.lastElementChild.appendChild(adjTable);
        [...adjTable.children].forEach((r, i) => {
            r.classList.add(['title', 'head'][i] ?? 'row');
            // handle additional content
            if (r.classList.contains('row') && r.children.length === 1) {
                r.firstElementChild.classList.add('addition');
                block.lastElementChild.appendChild(r.firstElementChild);
                r.remove();
            }
        });
        // style arrows text - might want to only check rows
        const textContent = adjTable.querySelectorAll('p');
        textContent.forEach((text) => {
            if (text.textContent.includes('⇧')) text.classList.add('increase');
            if (text.textContent.includes('⇩')) text.classList.add('decrease');
        });
    }

    // custom cols authoring pattern 'col-{index 0 width}-{index 1 width}'
    if (block.className.split(' ').some(c => c.includes('col-'))) {
        const cols = [...block.classList].find((s) => s.includes('col-')).split('-');
        cols.shift();
        [...block.children].forEach((c, i) => c.style.width = `${cols[i]}%`);
    }
}
