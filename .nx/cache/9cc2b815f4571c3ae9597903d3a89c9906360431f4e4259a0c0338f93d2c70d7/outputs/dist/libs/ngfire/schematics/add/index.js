"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngSchematic = exports.nxGenerator = exports.addFiles = void 0;
const devkit_1 = require("@nrwl/devkit");
const utils_1 = require("./utils");
const path_1 = require("path");
async function addFiles(tree, options, dirname) {
    const templateOptions = {
        ...options,
        ...(0, devkit_1.names)(options.project),
        offset: (0, devkit_1.offsetFromRoot)(options.projectRoot),
        template: ''
    };
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(dirname, 'files'), options.path, templateOptions);
    await (0, devkit_1.formatFiles)(tree);
}
exports.addFiles = addFiles;
// Just return the tree
async function nxGenerator(tree, options) {
    const projectOptions = (0, utils_1.getProjectOptions)(tree, options.project);
    const allOptions = { ...projectOptions, ...options };
    await addFiles(tree, allOptions, __dirname);
    const installTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {
        ngfire: "0.0.48",
        firebase: "9.9.0",
    }, {
        'firebase-tools': "11.7.0",
    });
    return installTask;
}
exports.nxGenerator = nxGenerator;
exports.ngSchematic = (0, devkit_1.convertNxGenerator)(nxGenerator);
