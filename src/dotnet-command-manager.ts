import { error } from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'


export class DotnetCommandManager {
    private dotnetPath: string
    private projectfile: string

    constructor(projectfile: string, dotnetPath: string) {
        this.projectfile = projectfile
        this.dotnetPath = dotnetPath
    }

    static async create(projectfile: string): Promise<DotnetCommandManager> {
        const dotnetPath = await io.which('dotnet', true)
        return new DotnetCommandManager(projectfile, dotnetPath)
    }

    async restore(): Promise<void> {
        const result = await this.exec(['restore', this.projectfile])
        if (result.exitCode !== 0) {
            error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
        }
    }

    async listOutdated(versionLimit: string): Promise<OutdatedPackage[]> {
        let versionFlag = ""
        switch (versionLimit) {
            case "minor":
                versionFlag = "--highest-minor"
                break
            case "patch":
                versionFlag = "--highest-patch"
                break
        }
        const result = await this.exec(['list', this.projectfile, 'package', versionFlag, '--outdated'])
        if (result.exitCode !== 0) {
            error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
        }
        const outdated = this.parseListOutput(result.stdout)
        if (versionFlag !== "") {
            const latestsVersions = await this.listOutdated("latest")
            for (const i in latestsVersions) {
                const wanted = (await outdated).filter(x => x.name === latestsVersions[i].name)[0]
                latestsVersions[i].wanted = wanted ? wanted.wanted : latestsVersions[i].current
            }
            return latestsVersions
        }
        return outdated
    }

    async addUpdatedPackage(outdatedPackages: OutdatedPackage[]): Promise<void> {
        for (const outdatedPackage of outdatedPackages) {
            const result = await this.exec(['add', this.projectfile, 'package', outdatedPackage.name, '-v', outdatedPackage.wanted])
            if (result.exitCode !== 0) {
                error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
                throw new Error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
            }
        }
    }

    async exec(args: string[]): Promise<DotnetOutput> {
        args = args.filter(x => x !== "")
        const env = {}
        for (const key of Object.keys(process.env)) {
            env[key] = process.env[key]
        }
        const stdout: string[] = []
        const stderr: string[] = []

        const options = {
            cwd: '.',
            env,
            ignoreReturnCode: true,
            listeners: {
                stdout: (data: Buffer) => stdout.push(data.toString()),
                stderr: (data: Buffer) => stderr.push(data.toString())
            }
        }
        const resultcode = await exec.exec(`"${this.dotnetPath}"`, args, options)
        const result = new DotnetOutput(resultcode)
        result.stdout = stdout.join('')
        result.stderr = stderr.join('')
        return result
    }

    private async parseListOutput(output: string): Promise<OutdatedPackage[]> {
        const lines = output.split('\n')
        const packages: OutdatedPackage[] = []
        const regex = /^\s+>\s(.*?)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s*$/
        for (const line of lines) {
            const match = regex.exec(line)
            if (match) {
                packages.push({
                    name: match[1],
                    current: match[2],
                    wanted: match[4],
                    latest: match[4]
                })
            }
        }
        return packages
    }
}

export class OutdatedPackage {
    name: string
    current: string
    wanted: string
    latest: string

    constructor(name: string, current: string, wanted: string, latest: string) {
        this.name = name
        this.current = current
        this.wanted = wanted
        this.latest = latest
    }
}

export class DotnetOutput {
    stdout = ''
    stderr = ''
    exitCode = 0

    constructor(exitCode: number) {
        this.exitCode = exitCode
    }

}