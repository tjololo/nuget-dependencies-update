import * as locator from '../src/dotnet-project-locator'

test('locate projects recursivly', async () => {
    const expected = [
        "test/fixtures/root/project1.csproj",
        "test/fixtures/root/sub-folder/project2.csproj"
    ]
    const actual = await locator.getAllProjects("test/fixtures/root", true)
    expect(actual).toEqual(expected)
})

test('locate projects recursivly with ignore', async () => {
    const ignoreProject = ["test/fixtures/root/project1.csproj"]
    const expected = [
        "test/fixtures/root/sub-folder/project2.csproj"
    ]
    const actual = await locator.getAllProjects("test/fixtures/root", true, ignoreProject)
    expect(actual).toEqual(expected)
})

test('locate projects not recursivly', async () => {
    const expected = [
        "test/fixtures/root/project1.csproj",
    ]
    const actual = await locator.getAllProjects("test/fixtures/root", false)
    expect(actual).toEqual(expected)
})