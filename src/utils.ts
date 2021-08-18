
const map = {
    '*': '\\*',
    '#': '\\#',
    '(': '\\(',
    ')': '\\)',
    '[': '\\[',
    ']': '\\]',
    _: '\\_',
    '\\': '\\\\',
    '+': '\\+',
    '-': '\\-',
    '`': '\\`',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
}

export const escapeString = async (
    string
): Promise<string> => {
    return string.replace(/[\*\(\)\[\]\+\-\\_`#<>]/g, m => map[m])
}