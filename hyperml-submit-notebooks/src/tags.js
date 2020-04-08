function appendContent(el, content) {
    if (!(content instanceof Array)) {
        content = [content];
    }
    for (let item of content) {
        if (typeof item === "string") {
            el.appendChild(document.createTextNode(item));
        }
        else if (item !== undefined) {
            el.appendChild(item);
        }
    }
}

export function tag(name, classes = [], attributes, content = []) {
    const el = Object.assign(document.createElement(name), {
        attr(a, v) {
            if (typeof v === "boolean") {
                return el.withKey(a.toString(), v);
            }
            else {
                el.setAttribute(a.toString(), v);
                return el;
            }
        },
        attrs(obj) {
            for (const a in obj) {
                if (obj.hasOwnProperty(a)) {
                    el.attr(a, obj[a]);
                }
            }
            return el;
        },
        withId(id) {
            el.id = id;
            return el;
        },
        click(handler) {
            return el.listener('click', handler);
        },
        change(handler) {
            return el.listener('change', handler);
        },
        listener(name, handler) {
            el.addEventListener(name, handler);
            return el;
        },
        withKey(key, value) {
            return Object.assign(el, { [key]: value });
        },
        disable() {
            return el.withKey('disabled', true);
        },
        addClass(cls) {
            el.classList.add(cls);
            return el;
        }
    });
    el.classList.add(...classes);
    if (attributes)
        el.attrs(attributes);
    appendContent(el, content);
    return el;
}
export function blockquote(classes, content) {
    return tag('blockquote', classes, undefined, content);
}
export function para(classes, content) {
    return tag('p', classes, undefined, content);
}
export function span(classes, content) {
    return tag('span', classes, undefined, content);
}
export function img(classes, src, alt) {
    return tag('img', classes, { src, alt }, []);
}
export function icon(classes, iconName, alt) {
    return span(classes, img(['icon'], `style/icons/fa/${iconName}.svg`, alt || iconName));
}
export function a(classes, href, contentOrPreventNavigate, contentWhenPreventNavigate) {
    const preventNavigate = typeof (contentOrPreventNavigate) === "boolean" ? contentOrPreventNavigate : false;
    const content = typeof (contentOrPreventNavigate) === "boolean" ? contentWhenPreventNavigate : contentOrPreventNavigate;
    const a = tag("a", classes, { href: href }, content);
    if (preventNavigate) {
        a.addEventListener("click", (evt) => {
            evt.preventDefault();
            return false;
        });
    }
    return a;
}
// This is supposed to create an inline SVG so we can style it with CSS. I'm not sure why it doesn't work though...
// export function icon(classes: string[], iconName: string, alt: string) {
//     const use = document.createElement("use");
//     const svgLoc = `/style/icons/fa/${iconName}.svg`;
//     use.setAttribute('href', svgLoc);
//     const svg = document.createElement("svg");
//     svg.appendChild(use);
//     return span(classes, svg);
// }
export function div(classes, content) {
    return tag('div', classes, undefined, content);
}
export function button(classes, attributes, content) {
    if (!("type" in attributes)) {
        attributes["type"] = "button";
    }
    return tag('button', classes, attributes, content);
}
export function iconButton(classes, title, iconName, alt) {
    classes.push('icon-button');
    return button(classes, { title: title }, icon([], iconName, alt));
}
export function textbox(classes, placeholder, value = "") {
    const input = tag('input', classes, { type: 'text', placeholder: placeholder }, []);
    if (value) {
        input.value = value;
    }
    input.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape' || evt.key == 'Cancel') {
            input.dispatchEvent(new CustomEvent('Cancel', { detail: { key: evt.key, event: evt } }));
        }
        else if (evt.key === 'Enter' || evt.key === 'Accept') {
            input.dispatchEvent(new CustomEvent('Accept', { detail: { key: evt.key, event: evt } }));
        }
    });
    return input;
}
export function dropdown(classes, options, value) {
    let opts = [];
    for (const value in options) {
        if (options.hasOwnProperty(value)) {
            opts.push(tag('option', [], { value: value }, [options[value]]));
        }
    }
    const select = tag('select', classes, {}, opts);
    const dropdown = Object.assign(select, {
        setSelectedValue(value) {
            const index = opts.findIndex(opt => opt.value === value);
            if (index !== -1) {
                select.selectedIndex = index;
            }
        },
        getSelectedValue() {
            return select.options[select.selectedIndex].value;
        }
    });
    if (value)
        dropdown.setSelectedValue(value);
    return dropdown;
}
// create element that goes into a FakeSelect (but not the FakeSelect itself)
export function fakeSelectElem(classes, buttons) {
    classes.push("dropdown");
    return div(classes, [
        icon(['marker'], 'angle-down'),
    ].concat(buttons));
}
export function checkbox(classes, label, value = false) {
    const attrs = { type: 'checkbox', checked: value };
    return tag('label', classes, {}, [
        tag('input', [], attrs, []),
        span([], [label])
    ]);
}
export function h2(classes, content) {
    return tag('h2', classes, {}, content);
}
export function h3(classes, content) {
    return tag('h3', classes, {}, content);
}
export function h4(classes, content) {
    return tag('h4', classes, {}, content);
}
export function table(classes, contentSpec) {
    var _a, _b;
    const colClass = (col) => { var _a, _b; return _b = (_a = contentSpec.classes) === null || _a === void 0 ? void 0 : _a[col], (_b !== null && _b !== void 0 ? _b : ''); };
    const heading = contentSpec.header ? [tag('thead', [], {}, [
            tag('tr', [], {}, contentSpec.header.map((c, i) => tag('th', [colClass(i)], {}, [c])))
        ])] : [];
    function mkTR(row) {
        const contentArrays = row instanceof Array ? row : contentSpec.classes.map(cls => row[cls]).map(content => content instanceof Array ? content : [content]);
        const propCells = {};
        const cells = contentArrays.map((c, i) => {
            const cell = i === 0 && contentSpec.rowHeading ? tag('th', [colClass(i)], { scope: 'row' }, c) : tag('td', [colClass(i)], {}, c);
            propCells[contentSpec.classes[i]] = cell;
            return cell;
        });
        const tr = tag('tr', [], {}, cells);
        return Object.assign(tr, {
            row: Object.assign(Object.assign({}, row), { __el: tr }),
            propCells: propCells,
            updateValues(props) {
                for (const prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        const value = props[prop];
                        tr.row[prop] = value;
                        const cell = tr.propCells[prop];
                        cell.innerHTML = "";
                        appendContent(cell, value);
                    }
                }
                const nextSibling = tr.nextSibling;
                const parentNode = tr.parentNode;
                if (parentNode) {
                    parentNode.removeChild(tr);
                    parentNode.insertBefore(tr, nextSibling); // re-trigger the highlight animation
                }
            }
        });
    }
    const body = tag('tbody', [], {}, (_b = (_a = contentSpec.rows) === null || _a === void 0 ? void 0 : _a.map(mkTR), (_b !== null && _b !== void 0 ? _b : [])));
    const table = tag('table', classes, {}, [
        ...heading, body
    ]);
    return Object.assign(table, {
        addRow(row, whichBody) {
            const tbody = (whichBody !== null && whichBody !== void 0 ? whichBody : body);
            const rowEl = mkTR(row);
            if (contentSpec.addToTop)
                tbody.insertBefore(rowEl, tbody.firstChild);
            else
                tbody.appendChild(rowEl);
            return rowEl;
        },
        findRows(props, tbody) {
            return table.findRowsBy((row) => {
                for (const prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        if (row[prop] !== props[prop])
                            return false;
                    }
                }
                return true;
            }, tbody);
        },
        findRowsBy(fn, tbody) {
            const [searchEl, selector] = tbody ? [tbody, 'tr'] : [table, 'tbody tr'];
            const matches = [];
            [...searchEl.querySelectorAll(selector)].forEach((tr) => {
                if (fn(tr.row)) {
                    matches.push(tr);
                }
            });
            return matches;
        },
        addBody(rows) {
            var _a, _b;
            const newBody = tag('tbody', [], {}, (_b = (_a = contentSpec.rows) === null || _a === void 0 ? void 0 : _a.map(mkTR), (_b !== null && _b !== void 0 ? _b : [])));
            table.appendChild(newBody);
            if (rows) {
                rows.forEach(row => table.addRow(row, newBody));
            }
            return newBody;
        }
    });
}
export function details(classes, summary, content) {
    const el = tag('details', classes, {}, [
        tag('summary', [], {}, summary)
    ]);
    appendContent(el, content);
    return el;
}
//# sourceMappingURL=tags.js.map