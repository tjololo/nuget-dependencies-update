import { OutdatedPackage } from "./dotnet-command-manager"

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

export const removeIgnoredDependencies = async (
    dependencies: OutdatedPackage[],
    ignore: string[]
): Promise<OutdatedPackage[]> => {
    return dependencies.filter(
        (dependency) => {
            return ignore.indexOf(dependency.name) === -1
        }
    )
}