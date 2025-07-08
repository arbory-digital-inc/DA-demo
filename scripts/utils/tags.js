export default function createTag(tag, options = null) {
    const newTag = document.createElement(tag);
    if (options) {
        const attrs = Object.values(options);
        newTag.classList.add(attrs.map());
    }
    return newTag;
}
