import * as core from '@actions/core'
import { statSync } from 'fs'
import * as path from 'path'
import { DotnetCommandManager } from './dotnet-command-manager'
import { getAllProjects } from './dotnet-project-locator'
import { PrBodyHelper } from './pr-body'

async function execute(): Promise<void> {
    try {
        const recursive = core.getBooleanInput("recursive")
        const commentUpdated = core.getBooleanInput("comment-updated")
        const rootFolder = core.getInput("root-folder")
        const versionLimit = core.getInput("version-limit")
        core.startGroup("Find modules")
        const projects: string[] = await getAllProjects(rootFolder, recursive)
        core.endGroup()
        let body = ""
        for (const project of projects) {
            if (statSync(project).isFile()) {
                const dotnet = await DotnetCommandManager.create(project)

                core.startGroup(`dotnet restore ${project}`)
                await dotnet.restore()
                core.endGroup()

                core.startGroup(`dotnet list ${project}`)
                const outdatedPackages = await dotnet.listOutdated(versionLimit)
                core.endGroup()

                core.startGroup(`dotnet install new version ${project}`)
                await dotnet.addUpdatedPackage(outdatedPackages)
                core.endGroup()

                core.startGroup(`append to PR body  ${project}`)
                const prBodyHelper = new PrBodyHelper(project, commentUpdated)
                body += `${await prBodyHelper.buildPRBody(outdatedPackages)}\n`
            }
        }
        core.setOutput("body", body)
    } catch (e) {
        core.setFailed(e.message)
    }
}
execute()