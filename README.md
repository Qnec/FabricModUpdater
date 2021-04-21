# FabricModUpdater

I couldn't find a tool for this so I just duct taped together a really crappy thing to do the job, I didn't even do most of the work.

Requires the mc-curseforge-api.
the source file contains a list of the project IDs you want the tool to download, and the file names that you want them to have. It follows the format of
```
FileName:253170
```
with each mod/project having one line.
If the FileName field is found empty, it will default to the name of the mod.
You can use `-v <version>` to provide a minecraft version to use when downloading mods, `-m <filepath>` to provide a mod list path, and `-f <folderpath>` to provide a folder in which the mods will be downloaded.
version defaults to whatever is in the mcVersion field of the config.json file that you should put in `~/.modUpdater/config.json`
mod list path defaults to `~/.modUpdater/mods.txt`
mod folder defaults to `./mods/`

This will download whatever the latest file is that is compatible with the minecraft version given. If a file already exists in the location that the mod will be downloaded to and that file was modified more recently than said latest file, the latest file will not be downloaded.
