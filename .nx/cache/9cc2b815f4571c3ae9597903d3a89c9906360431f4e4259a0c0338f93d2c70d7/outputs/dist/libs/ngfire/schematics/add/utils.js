"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectOptions = exports.readRawWorkspaceJson = void 0;
const devkit_1 = require("@nrwl/devkit");
function readRawWorkspaceJson(tree) {
    const path = (0, devkit_1.getWorkspacePath)(tree);
    if (!path)
        throw new Error('No file angular.json or workspace.json found');
    if (!tree.exists(path))
        throw new Error(`No file ${path} found`);
    return (0, devkit_1.readJson)(tree, path);
}
exports.readRawWorkspaceJson = readRawWorkspaceJson;
function getProjectOptions(tree, projectName) {
    const workspacePath = (0, devkit_1.getWorkspacePath)(tree);
    if (!workspacePath)
        throw new Error('No workspace found. Should be either "angular.json" or "workspace.json"');
    const isAngular = workspacePath === 'angular.json';
    const workspace = readRawWorkspaceJson(tree);
    const project = projectName ? (0, devkit_1.names)(projectName).fileName : workspace.defaultProject;
    if (!project)
        throw new Error('No project provided');
    const config = workspace.projects[project];
    const projectRoot = `${(0, devkit_1.getWorkspaceLayout)(tree).libsDir}/${project}`;
    if (!config)
        return { isAngular, project, projectRoot };
    // project.json
    if (typeof config === 'string') {
        const projectConfigLocation = (0, devkit_1.joinPathFragments)(config, 'project.json');
        const projectConfig = (0, devkit_1.readJson)(tree, projectConfigLocation);
        return {
            isAngular,
            project,
            projectRoot: config,
            projectConfig,
            projectConfigLocation: projectConfigLocation,
        };
    }
    else {
        // workspace.json or angular.json
        return {
            isAngular,
            project,
            projectRoot: config.root,
            projectConfig: config,
            projectConfigLocation: workspacePath
        };
    }
}
exports.getProjectOptions = getProjectOptions;
