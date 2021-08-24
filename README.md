# nuget-dependencies-update
Automate update of nuget dependencies in your dotnet project

## Steps in the action

1. locate all csproj files under the root folder, looks in subfolders if not disabled
2. run ```dotnet restore``` on the project
3. run ```dotnet list``` to determin if there are newer versions available
4. remove dependencies that should be ignored from updatelist
5. update dependencies with ```dotnet add```
6. generate PR body

## Usage

```yaml
name: Update dependencies
on: 
  schedule:
    - cron: '0 8 * * 4' # every thursday @ AM 8:00


jobs:
  build:
    name: "Update all nugets to latest version"
    runs-on: ubuntu-latest
    steps:
    - name: checkout code
      uses: actions/checkout@v2
      
    - name: Setup .NET Core
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: 5.0.x

    - name: update packages
      id: update
      uses: tjololo/nuget-dependencies-update@v1
      with:
        version-limit: 'minor'
        comment-updated: true
        ignore: |
          StackExchange.Redis.Extensions.Newtonsoft

    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v3
      with:
        title: "Updated nuget dependencies"
        body: ${{ steps.update.outputs.body }}
        reviewers: tjololo
        labels: dependencies
```

### Action inputs
| Name | Description | Default |
| ---- | ----------- | ------- |
| `root-folder` | relative path from repository root where the action should look for csproj file(s) | `.` |
| `recursive` | wether or not the action should look for csproj files in sub-folders and update all of them | `true` |
| `comment-updated` | wheter or not the dependencies that are update should be included in the body output | `false` |
| `version-limit` | Limit if update should update to latest major, minor or patch version. [latest,minor,patch] | `latest` |
| `ignore` | Dependencies to ignore during update. Multiple nugets separated by newline | '' |
| `ignore-project` | If recursive mode is enabled you can specify paths for projects to ignore. Multiple projects separated by newline | '' |


### Action outputs
* `body` - Markdown formated text that can be used in a commit or PR


Example output with comment updated set to true:

# Project: hello\-dotnet.csproj 
### Merging this PR will update the following dependencies
- StackExchange.Redis.Extensions.AspNetCore 7.0.0 -> 7.1.1

After merging this PR all dependencies that are not ignored will be updated to the latest version.