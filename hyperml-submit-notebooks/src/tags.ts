
/* taken from https://github.com/polynote/polynote */ 

type ContentElement = (Node | string | undefined)
export type Content = ContentElement | ContentElement[]

function appendContent(el: Node, content: Content) {
    if (!(content instanceof Array)) {
        content = [content];
    }

    for (let item of content) {
        if (typeof item === "string") {
            el.appendChild(document.createTextNode(item));
        } else if (item !== undefined) {
            el.appendChild(item);
        }
    }
}

type AllowedElAttrs<T extends HTMLElement> = Partial<Record<keyof T, string | boolean>>

export type TagElement<K extends keyof HTMLElementTagNameMap, T extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K]> = HTMLElementTagNameMap[K] & {
    attr(a: keyof T, b: string | boolean): TagElement<K, T>
    attrs(obj: AllowedElAttrs<HTMLElementTagNameMap[K]>): TagElement<K, T>
    withId(id: string): TagElement<K, T>
    click(handler: EventListenerOrEventListenerObject): TagElement<K, T>
    change(handler: EventListenerOrEventListenerObject): TagElement<K, T>
    listener(name: string, handler: EventListenerOrEventListenerObject): TagElement<K, T>
    withKey(key: string, value: any): TagElement<K, T>
    disable(): TagElement<K, T>
    addClass(cls: string): TagElement<K, T>
};

export function tag<T extends keyof HTMLElementTagNameMap>(
    name: T,
    classes: string[] = [],
    attributes?: AllowedElAttrs<HTMLElementTagNameMap[T]>,
    content: Content = []): TagElement<T> {

    const el: TagElement<T> = Object.assign(document.createElement(name), {
        attr(a: keyof HTMLElementTagNameMap[T], v: string | boolean) {
            if (typeof v === "boolean") {
                return el.withKey(a.toString(), v);
            } else {
                el.setAttribute(a.toString(), v);
                return el;
            }
        },
        attrs(obj: AllowedElAttrs<HTMLElementTagNameMap[T]>) {
            for (const a in obj) {
                if (obj.hasOwnProperty(a)) {
                    el.attr(a, obj[a]!);
                }
            }
            return el;
        },
        withId(id: string) {
            el.id = id;
            return el;
        },
        click(handler: EventListenerOrEventListenerObject) {
            return el.listener('click', handler);
        },
        change(handler: EventListenerOrEventListenerObject) {
            return el.listener('change', handler);
        },
        listener(name: string, handler: EventListenerOrEventListenerObject) {
            el.addEventListener(name, handler);
            return el
        },
        withKey(key: string, value: any) {
            return Object.assign(el, {[key]: value})
        },
        disable () {
            return el.withKey('disabled', true)
        },
        addClass(cls: string) {
            el.classList.add(cls);
            return el;
        }
    });

    el.classList.add(...classes);
    if (attributes) el.attrs(attributes);
    appendContent(el, content);

    return el;
}

export function blockquote(classes: string[], content: Content) {
    return tag('blockquote', classes, undefined, content);
}

export function para(classes: string[], content: Content) {
    return tag('p', classes, undefined, content);
}

export function span(classes: string[], content: Content) {
    return tag('span', classes, undefined, content);
}

export function img(classes: string[], src: string, alt: string) {
    return tag('img', classes, {src, alt}, []);
}

export function icon(classes: string[], iconName: string, alt?: string) {
    return span(classes, img(['icon'], `style/icons/fa/${iconName}.svg`, alt || iconName))
}

export function a(classes: string[], href: string, contentOrPreventNavigate: Content | boolean, contentWhenPreventNavigate?: Content) {
    const preventNavigate = typeof(contentOrPreventNavigate) === "boolean" ? contentOrPreventNavigate : false;
    const content = typeof(contentOrPreventNavigate) === "boolean" ? contentWhenPreventNavigate : contentOrPreventNavigate;
    const a = tag("a", classes, {href: href}, content);
    if (preventNavigate) {
        a.addEventListener("click", (evt: MouseEvent) => {
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

export function div(classes: string[], content: Content) {
    return tag('div', classes, undefined, content);
}

export function button(classes: string[], attributes: Record<string, string>, content: Content): TagElement<"button"> {
    if (!("type" in attributes)) {
        attributes["type"] = "button"
    }
    return tag('button', classes, attributes, content);
}

export function iconButton(classes: string[], title: string, iconName: string, alt: string): TagElement<"button"> {
    classes.push('icon-button');
    return button(classes, {title: title}, icon([], iconName, alt));
}

export function textbox(classes: string[], placeholder: string, value: string = "") {
    const input = tag('input', classes, {type: 'text', placeholder: placeholder}, []);
    if (value) {
        input.value = value;
    }
    input.addEventListener('keydown', (evt: KeyboardEvent) => {
        if (evt.key === 'Escape' || evt.key == 'Cancel') {
            input.dispatchEvent(new CustomEvent('Cancel', { detail: { key: evt.key, event: evt }}));
        } else if (evt.key === 'Enter' || evt.key === 'Accept') {
            input.dispatchEvent(new CustomEvent('Accept', { detail: { key: evt.key, event: evt}}));
        }
    });
    return input;
}


export interface DropdownElement extends TagElement<"select"> {
    setSelectedValue(value: string): void
    getSelectedValue(): string
}

export function dropdown(classes: string[], options: Record<string, string>, value?: string): DropdownElement {
    let opts: TagElement<"option">[] = [];

    for (const value in options) {
        if (options.hasOwnProperty(value)) {
            opts.push(tag('option', ['jp-mod-styled'], {value: value}, [options[value]]));
        }
    }

    const select = tag('select', classes, {}, opts);
    const dropdown =  Object.assign(select, {
        setSelectedValue(value: string) {
            const index = opts.findIndex(opt => opt.value === value);
            if (index !== -1) {
                select.selectedIndex = index;
            }
        },
        getSelectedValue() {
            if (select.selectedIndex === -1) {
                return;
            }
            return select.options[select.selectedIndex].value;
            
        }
    });

    if (value) dropdown.setSelectedValue(value);
    return dropdown;

}

// create element that goes into a FakeSelect (but not the FakeSelect itself)
export function fakeSelectElem(classes: string[], buttons: TagElement<"button">[]) {
    classes.push("dropdown");
    return div(classes, [
        icon(['marker'], 'angle-down'),
    ].concat(buttons));
}

export function checkbox(classes: string[], label: string, value: boolean = false) {
    const attrs = {type:'checkbox', checked: value};
    return tag('label', classes, {}, [
        tag('input', [], attrs, []),
        span([], [label])
    ]);
}

export function h2(classes: string[], content: Content) {
    return tag('h2', classes, {}, content)
}

export function h3(classes: string[], content: Content) {
    return tag('h3', classes, {}, content);
}

export function h4(classes: string[], content: Content) {
    return tag('h4', classes, {}, content);
}

/**
 * - header: An array of strings representing the table header labels
 * - classes: An array of strings representing class names for the th/td elements of each column
 * - rows: An array of arrays, where each inner array is a row of content elements of each column
 *         Can also be an array of objects, where each object has keys specifying a class name from
 *         the classes array.
 * - rowHeading: If true, first element of each row will be a <th scope="row"> rather than <td>.
 * - addToTop: If true, addRow will add rows to the top of the body, otherwise to the bottom.
 */
interface TableContentSpec {
    header?: string[],
    classes: string[],
    rows?: (TagElement<any>[] | Record<string, string>)[],
    rowHeading?: boolean,
    addToTop?: boolean
}

export interface TableRowElement extends TagElement<"tr"> {
    row: TableRow
    propCells: Record<string, TagElement<any>>
    updateValues(props: Record<string, Content>): void
}

export interface TableElement extends TagElement<"table"> {
    addRow(row: Content[] | TableRow, whichBody?: TagElement<"tbody">): TableRowElement
    findRows(props: Record<string, string>, tbody?: TagElement<"tbody">): TableRowElement[]
    findRowsBy(fn: (row: TableRow) => boolean, tbody?: TagElement<"tbody">): TableRowElement[]
    addBody(rows?: TableRow[]): TagElement<"tbody">
}

/**
 * Creates a table element with an addRow function which appends a row.
 */
type TableRow = Record<string, Content>
export function table(classes: string[], contentSpec: TableContentSpec): TableElement {
    const colClass = (col: number) => contentSpec.classes? contentSpec.classes[col]: '';
    const heading = contentSpec.header ? [tag('thead', [], {}, [
            tag('tr', [], {}, contentSpec.header.map((c, i) => tag('th', [colClass(i)], {}, [c])))
        ])] : [];

    function mkTR(row: Content[] | TableRow): TableRowElement {
        const contentArrays: Content[] =
            row instanceof Array ? row : contentSpec.classes.map(cls => row[cls]).map(content => content instanceof Array ? content : [content]);

        const propCells: Record<string, TagElement<any>> = {};
        const cells = contentArrays.map((c, i) => {
            const cell = i === 0 && contentSpec.rowHeading ? tag('th', [colClass(i)], {scope: 'row'}, c) : tag('td', [colClass(i)], {}, c);
            propCells[contentSpec.classes[i]] = cell;
            return cell;
        });

        const tr = tag('tr', [], {}, cells) as TableRowElement;
        return Object.assign(tr, {
            row: {
                ...row,
                __el: tr
            },
            propCells: propCells,
            updateValues(props: Record<string, Content>) {
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
                    parentNode.insertBefore(tr, nextSibling);   // re-trigger the highlight animation
                }
            }
        });
    }

    const body = tag(
        'tbody', [], {},
        contentSpec.rows? contentSpec.rows.map(mkTR) : []
    );

    const table = tag('table', classes, {}, [
        ...heading, body
    ]) as TableElement;

    return Object.assign(table, {
        addRow(row: Content[] | TableRow, whichBody?: TagElement<"tbody">) {
            const tbody = whichBody ? whichBody : body;
            const rowEl = mkTR(row);
            if (contentSpec.addToTop)
                tbody.insertBefore(rowEl, tbody.firstChild);
            else
                tbody.appendChild(rowEl);
            return rowEl;
        },
        findRows(props: Record<string, string>, tbody?: TagElement<"tbody">) {
            return table.findRowsBy((row: TableRow) => {
                for (const prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        if (row[prop] !== props[prop])
                            return false;
                    }
                }
                return true;
            }, tbody);
        },
        /*findRowsBy(fn: (row: TableRow) => boolean, tbody?: TagElement<"tbody">) {
            const [searchEl, selector] = tbody ? [tbody, 'tr'] : [table, 'tbody tr'];
            const matches: TagElement<"tr">[] = [];
            [...searchEl.querySelectorAll(selector)].forEach((tr: TableRowElement) => {
                if (fn(tr.row)) {
                    matches.push(tr);
                }
            });
            return matches;
        },*/
        addBody(rows?: TableRow[]) {
            const newBody = tag(
                'tbody', [], {},
                contentSpec.rows? contentSpec.rows.map(mkTR) : []
            );

            table.appendChild(newBody);

            if (rows) {
                rows.forEach(row => table.addRow(row, newBody));
            }
            return newBody;
        }
    });
}

export function details(classes: string[], summary: Content, content: Content) {
    const el = tag('details', classes, {}, [
        tag('summary', [], {}, summary)
    ]);
    appendContent(el, content);
    return el;
}