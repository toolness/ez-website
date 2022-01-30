/**
 * Find an element with the given HTML tag and selector, raising an exception
 * if it's not found.
 *
 * @param tagName The name of the element's HTML tag.
 * @param selector The selector for the element, not including its HTML tag.
 * @param parent The parent node to search within (defaults to `document`).
 */
export function getHTMLElement(tagName, selector, parent = document) {
    const finalSelector = `${tagName}${selector}`;
    const node = parent.querySelector(finalSelector);
    if (!node) {
        throw new Error(`Couldn't find any elements matching "${finalSelector}"`);
    }
    return node;
}
/**
 * Find all elements with the given HTML tag and selector, returning an
 * empty Array if none are found.
 *
 * @param tagName The name of the elements' HTML tag.
 * @param selector The selector for the elements, not including their HTML tag.
 * @param parent The parent node to search within (defaults to `document`).
 */
export function getAllHTMLElements(tagName, selector, parent = document) {
    const finalSelector = `${tagName}${selector}`;
    const nodes = parent.querySelectorAll(finalSelector);
    return Array.from(nodes);
}
// https://www.freecodecamp.org/news/javascript-debounce-example/
export function debounce(func, timeoutMs = 250) {
    let timeout;
    return () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            func();
        }, timeoutMs);
    };
}
//# sourceMappingURL=util.js.map