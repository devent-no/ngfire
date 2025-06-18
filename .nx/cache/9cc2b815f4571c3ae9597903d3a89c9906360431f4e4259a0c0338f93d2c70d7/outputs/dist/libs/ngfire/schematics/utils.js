"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDependencies = exports.stringifyFormatted = exports.safeReadJSON = exports.getProject = exports.getWorkspace = void 0;
const schematics_1 = require("@angular-devkit/schematics");
///////////////
// WORKSPACE //
///////////////
function getWorkspace(host) {
    const path = '/angular.json';
    const configBuffer = path && host.read(path);
    if (!configBuffer) {
        throw new schematics_1.SchematicsException(`Could not find angular.json`);
    }
    const workspace = JSON.parse(configBuffer.toString());
    if (!workspace) {
        throw new schematics_1.SchematicsException('Could not parse angular.json');
    }
    return {
        path,
        workspace
    };
}
exports.getWorkspace = getWorkspace;
const getProject = (workspace, projectName = workspace.defaultProject) => {
    if (!projectName) {
        throw new schematics_1.SchematicsException('No Angular project selected and no default project in the workspace');
    }
    const project = workspace.projects[projectName];
    if (!project) {
        throw new schematics_1.SchematicsException('The specified Angular project is not defined in this workspace');
    }
    if (project.projectType !== 'application') {
        throw new schematics_1.SchematicsException(`Deploy requires an Angular project type of "application" in angular.json`);
    }
    return { project, projectName };
};
exports.getProject = getProject;
//////////////
// PACKAGES //
//////////////
function safeReadJSON(path, tree) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return JSON.parse(tree.read(path).toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException(`Error when parsing ${path}: ${e.message}`);
    }
}
exports.safeReadJSON = safeReadJSON;
const stringifyFormatted = (obj) => JSON.stringify(obj, null, 2);
exports.stringifyFormatted = stringifyFormatted;
const addDependencies = (host, deps, context) => {
    const packageJson = host.exists('package.json') && safeReadJSON('package.json', host);
    if (packageJson === undefined) {
        throw new schematics_1.SchematicsException('Could not locate package.json');
    }
    if (!packageJson.devDependencies)
        packageJson.devDependencies = {};
    if (!packageJson.dependencies)
        packageJson.dependencies = {};
    Object.keys(deps).forEach(depName => {
        const dep = deps[depName];
        const existingDeps = dep.dev ? packageJson.devDependencies : packageJson.dependencies;
        const existingVersion = existingDeps[depName];
        if (!existingVersion) {
            existingDeps[depName] = dep.version;
        }
        else {
            context.logger.log('info', `package "${depName}" already installed with version ${existingVersion}. No change applied.`);
        }
    });
    // Overwrite package.json
    const path = 'package.json';
    const content = JSON.stringify(packageJson, null, 2);
    if (host.exists(path)) {
        host.overwrite(path, content);
    }
    else {
        host.create(path, content);
    }
};
exports.addDependencies = addDependencies;
