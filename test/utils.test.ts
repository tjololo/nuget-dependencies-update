import { OutdatedPackage } from "../src/dotnet-command-manager";
import {removeIgnoredDependencies, escapeString} from "../src/utils"

test('ignored dependencies are removed from array', async () => {
    const array: OutdatedPackage[] = [
        {
            name: 'a',
            current: '1.0.0',
            wanted: '1.1.0',
            latest: '2.0.0',
        },
        {
            name: 'b',
            current: '1.0.0',
            wanted: '1.1.0',
            latest: '2.0.0',
        },
        {
            name: 'c',
            current: '1.0.0',
            wanted: '1.1.0',
            latest: '2.0.0',
        }
    ]
    const ignored = ['a', 'c']
    const result = await removeIgnoredDependencies(array, ignored)
    expect(result).toEqual([{
        name: 'b',
        current: '1.0.0',
        wanted: '1.1.0',
        latest: '2.0.0',
    }])
})

test('ignored dependencies handle empty dependencies list', async () => {
    const array: OutdatedPackage[] = []
    const ignored = ['a', 'c']
    const result = await removeIgnoredDependencies(array, ignored)
    expect(result).toEqual([])
})

test('ignored dependencies handle empty ignore list', async () => {
    const array: OutdatedPackage[] = [
        {
            name: 'a',
            current: '1.0.0',
            wanted: '1.1.0',
            latest: '2.0.0',
        }
    ]
    const ignored = []
    const result = await removeIgnoredDependencies(array, ignored)
    expect(result).toEqual([
        {
            name: 'a',
            current: '1.0.0',
            wanted: '1.1.0',
            latest: '2.0.0',
        }
    ])
})

const cases = [
    ["*", "\\*"],
    ["#", '\\#'],
    ['(', '\\('],
    [')', '\\)'],
    ['[', '\\['],
    [']', '\\]'],
    ['_', '\\_'],
    ['\\', '\\\\'],
    ['+', '\\+'],
    ['-', '\\-'],
    ['`', '\\`'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    // ['&', '&amp;']
]

test.each(cases)("given input: %s escapeString returns %s", async (input, expected) => {
    expect(await escapeString(input)).toBe(expected)
})