const cf = require("mc-curseforge-api");
const fs = require("fs");
const {exec} = require("child_process");
const {spawn} = require("child_process");
const homedir = require('os').homedir();

var mcVersion = "1.16.5";
var sourceFile = homedir + "/.modUpdater/mods.txt";
var configFile = homedir + "/.modUpdater/config.json";
var modFolder = "./mods/";

async function updateMods(data, callback) {
  returnValue = 0;
  console.log("Version: " + mcVersion + "\nMod list: " + sourceFile + "\nConfiguration file: " + configFile + "\nMod folder:" + modFolder);
  //await execute("rm",["-rf",homedir + "/.modUpdater/oldMods/*"],()=>{console.log("rm oldmods");});
  //await execute("rm",["-rf",homedir + "/.modUpdater/newMods/*"],()=>{console.log("rm newmods");});
  //await execute("mv", [modFolder + "*", homedir + "/.modUpdater/oldMods/"],()=>{console.log("mv oldMods");});
  for(var i = 0; i < data.length; i++) {
    console.log("Mod list line " + i + ": " + data[i]);
    var id;
    var fileName;
    if(data[i].split(":").length < 2) {
      id=data[i];
      fileName = "";
    } else {
      var id = data[i].split(":")[1];
      fileName = data[i].split(":")[0];
    }
    var mod = await cf.getMod(parseInt(id))
    console.log("Mod Name: " + mod.name);
    //console.log(i);
    var files = await mod.getFiles();
    var newFile = {};
    for(var j = 0; j < files.length; j++) {
      var file = files[j];
      if(file.id == mod.defaultFileId) {
        newFile = file;
      }
    }
    if(!newFile.minecraft_versions.includes(mcVersion)) {
      for(var j = 0; j < files.length; j++) {
        var file = files[j];
        if(!newFile.minecraft_versions.includes(mcVersion) || ((Date.parse(newFile.timestamp) < Date.parse(file.timestamp)) && file.minecraft_versions.includes(mcVersion))) {
          newFile = file;
        }
      }
    }
    if(!newFile.minecraft_versions.includes(mcVersion)) {
      returnValue = 1;
    }
    console.log("Mod file URL: " + newFile.download_url);
    if(fileName == "") {
      fileName = mod.name.replace(/\s+/g, '');
    }
    var lastDownloaded = fs.statSync(modFolder + fileName + ".jar").mtime;
    if(!(Date.parse(newFile.timestamp) < lastDownloaded)) {
      await execute("wget", [newFile.download_url, "-O", modFolder + fileName + ".jar"],()=>{});
      console.log("Downloading new version.");
    } else {
      console.log("Newest version already downloaded.");
    }
  }
  await callback(returnValue);
}

fs.readFile(configFile, 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  data = JSON.parse(data);
  mcVersion = data.mcVersion;
  for(var i = 0; i < process.argv.length; i++) {
    if(process.argv[i] == "-m") {
      sourceFile = process.argv[i+1].replace("~", homedir);
    } if(process.argv[i] == "-f") {
      modFolder = process.argv[i+1].replace("~", homedir);
    } if(process.argv[i] == "-v") {
      mcVersion = process.argv[i+1];
    }
  }
  //console.log(mcVersion);
  fs.readFile(sourceFile, 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    data = data.split("\n");
    newData = [];
    for(var i = 0; i < data.length; i++) {
      if(data[i] != "") {
        newData.push(data[i]);
      }
    }
    //console.log("yeet");
    updateMods(newData, finishUp)
  });
});

async function finishUp(code) {
  if(code == 1) {
    console.log("could not obtain all mod files suitable for specified version, not committing. You should probably do something.");
  } else if(code == 0) {
    //execute("rm", ["-rf",modFolder + "*"],()=>{console.log("rm modFolder");});
    //await execute("cp", ["-R",homedir + "/.modUpdater/newMods/*",modFolder],()=>{console.log("cp modFolder")});
    //console.log("cp -R " + homedir + "/.modUpdater/newMods/* " + modFolder);
    console.log("done");
  }
}

async function execute(command, args, closeFunction) {
  var process = spawn(command, args)
  process.on("close", closeFunction);
}
