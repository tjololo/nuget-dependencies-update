import { info } from "@actions/core"
import { readdirSync, statSync } from "fs"
import { join } from "path"

export const getAllProjects = async (
    rootFolder: string,
    recursive: boolean,
    ignoreProjects: string[] = [],
    result: string[] = []
): Promise<string[]> => {
    const files: string[] = readdirSync(rootFolder)
    const regex = /^.+.csproj$/
    for (const fileName of files) {
        const file = join(rootFolder, fileName)
        if (statSync(file).isDirectory() && recursive) {
            try {
                result = await getAllProjects(file, recursive,ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else {
            if (regex.test(file)) {
                info(`project found : ${file}`)
                result.push(file)
            }
        }
    }
    return filterProjectList(result, ignoreProjects)
}

const filterProjectList = (
    projects: string[],
    ignoreProjects: string[]
): string[] => {
    return projects.filter(
        (project) => {
            return ignoreProjects.indexOf(project) === -1
        }
    )
}