import { ILayoutRestorer, } from "@jupyterlab/application";
import { IDocumentManager, } from "@jupyterlab/docmanager";
import { Widget, StackedPanel, DockPanel, Panel } from "@lumino/widgets";
import { ICommandPalette, IThemeManager } from "@jupyterlab/apputils";
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.open = 'bg-notebooks:open';
})(CommandIDs || (CommandIDs = {}));
/**
 * Initialization data for the hyperml-submit-notebooks extension.
 */
const extension = {
    id: 'hyperml-submit-notebooks',
    autoStart: true,
    activate: activate,
    requires: [IDocumentManager, ICommandPalette, ILayoutRestorer],
    optional: [IThemeManager]
};
class NotebookStatus extends Widget {
    constructor() {
        super();
        this.node.append(document.createElement("div"));
    }
}
function createStatusRecord() {
    let ns = new NotebookStatus();
    let panel2 = new Panel();
    panel2.addWidget(ns);
    return panel2;
}
function createWrapper(content, title) {
    let wrapper = new StackedPanel();
    wrapper.addClass('content-wrapper');
    wrapper.addWidget(content);
    wrapper.title.label = title;
    return wrapper;
}

function activate(app, docManager, palette, restorer, themeManager) {
    console.log('JupyterLab extension hyperml-submit-notebooks is activated!');
    console.log('themeManager:', themeManager);
    const open_command = "hyperml:open";
    app.commands.addCommand(open_command, {
        execute: (args) => {
            let dockPanel = new DockPanel();
            dockPanel.id = 'hyperml-bg-notebooks';
            dockPanel.title.label = "hyperML Notebooks";
            let ns = createStatusRecord();
            let wrapper = createWrapper(ns, 'Scheduled Notebooks');
            dockPanel.addWidget(wrapper);
            app.shell.add(dockPanel, 'main');
            app.shell.activateById(dockPanel.id);
        },
        isEnabled: () => true,
        label: CommandIDs.open,
    });
    console.log('palette:', palette);
    palette.addItem({ command: open_command, category: "Console" });
}
export default extension;
//# sourceMappingURL=index.js.map