import { DotnetCommandManager, DotnetOutput, OutdatedPackage } from "../src/dotnet-command-manager"
import { readFileSync } from "fs"


test(`list returns list of dependencies eligable for update minor`, async () => {
    const dcm = await DotnetCommandManager.create("test/fixtures/root/test.csproj")
    jest.spyOn(dcm, "exec").mockImplementation(async (args): Promise<DotnetOutput> => {
        if (args[3] === "--highest-minor") {
            const output = new DotnetOutput(0)
            output.stdout = readFileSync("test/fixtures/dotnet-list-minor.out", "utf8")
            return output
        } else {
            const output = new DotnetOutput(0)
            output.stdout = readFileSync("test/fixtures/dotnet-list-latest.out", "utf8")
            return output
        }
    })
    const expected: OutdatedPackage[] = [
        {
            name: "StackExchange.Redis.Extensions.AspNetCore",
            current: "6.1.0",
            wanted: "6.4.5",
            latest: "7.1.1",
        },
        {
            name: "StackExchange.Redis.Extensions.Newtonsoft",
            current: "7.0.1",
            wanted: "7.1.1",
            latest: "7.1.1",
        }
    ]
    const outdated = await dcm.listOutdated("minor")
    expect(outdated).toEqual(expected)
})

test(`list returns list of dependencies eligable for update on patch`, async () => {
    const dcm = await DotnetCommandManager.create("test/fixtures/root/package.json")
    jest.spyOn(dcm, "exec").mockImplementation(async (args): Promise<DotnetOutput> => {
        if (args[3] === "--highest-patch") {
            const output = new DotnetOutput(0)
            output.stdout = readFileSync("test/fixtures/dotnet-list-patch.out", "utf8")
            return output
        } else {
            const output = new DotnetOutput(0)
            output.stdout = readFileSync("test/fixtures/dotnet-list-latest.out", "utf8")
            return output
        }
    })
    const expected: OutdatedPackage[] = [
        {
            name: "StackExchange.Redis.Extensions.AspNetCore",
            current: "6.1.0",
            wanted: "6.1.4",
            latest: "7.1.1",
        },
        {
            name: "StackExchange.Redis.Extensions.Newtonsoft",
            current: "7.0.1",
            wanted: "7.0.4",
            latest: "7.1.1",
        }
    ]
    const outdated = await dcm.listOutdated("patch")
    expect(outdated).toEqual(expected)
})