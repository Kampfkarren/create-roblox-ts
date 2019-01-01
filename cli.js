#!/usr/bin/env node
const fs = require("fs")
const init = require("init-package-json")
const npm = require("npm")
const path = require("path")

const selectedPathName = process.argv[2]

if(selectedPathName == "--help") {
	console.log("create-roblox-ts")
	console.log("Usage: create-roblox-ts [path]")
	console.log("If no path is specified, will use the current path.")
	return
}

const selectedPath = path.format(path.parse(selectedPathName || "."))
console.log("Using path", selectedPath)

if(!fs.existsSync(selectedPath)) {
	fs.mkdirSync(selectedPath, {
		recursive: true,
	})
}

const srcPath = path.resolve(selectedPath, "src")
if(!fs.existsSync(srcPath)) {
	fs.mkdirSync(srcPath)
}

const templatePath = path.resolve(__dirname, "template")
console.log("Copying files")
for(let templateFile of fs.readdirSync(templatePath)) {
	fs.copyFileSync(
		path.resolve(templatePath, templateFile),
		path.resolve(selectedPath, templateFile),
	)
}

const packagePath = path.resolve(selectedPath, "package.json")
let packagePromise = new Promise((resolve, reject) => {
	if(!fs.existsSync(packagePath)) {
		init(selectedPath, packagePath, {
			yes: true,
		}, (err, data) => {
			if(err) {
				console.error("An error occurred while trying to make package.json", err)
				reject()
				return
			}

			resolve()
		})
	} else {
		resolve()
	}
})

packagePromise.then(() => {
	console.log("package.json ready")
	npm.load((err) => {
		if(err) {
			console.error("Error loading NPM", err)
			return
		}

		npm.commands.install(selectedPath, ["rbx-types"], (err) => {
			if(err) {
				console.error("Error installing rbx-types", err)
				return
			}

			console.log("Finished!")
		})
	})
})
