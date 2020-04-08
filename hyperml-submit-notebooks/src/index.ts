import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  Widget, StackedPanel, //DockPanel
} from "@lumino/widgets";
 
import {
  ICommandPalette, IThemeManager, showDialog, Dialog
} from "@jupyterlab/apputils";
import { PageConfig } from '@jupyterlab/coreutils';


import {div, button, span, TagElement} from './tags';

import RequestHandler from './requests';
import { ScheduleNotebookExtension
} from './schedule';


export namespace CommandIDs {
  export const open = 'background-notebooks:open';
}



/**
 * Initialization data for the hyperml-submit-notebooks extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'hyperml-submit-notebooks',
  autoStart: true,
  activate: activate,
  requires: [ICommandPalette, ILayoutRestorer],
  optional: [IThemeManager]
};

class NotebookStatus {
  el: TagElement<"div">
  notebook: any;
  private downButton: TagElement<"button">;
  private logButton: TagElement<"button">;
  private description: TagElement<"div">;

  constructor(notebook: any) {
    this.notebook = notebook;

    let action = div([], ''); 
    let statusStyle = 'hy-nb-phase-complete';
    this.logButton = button(["hy-button-secondary"], {}, "View Log").click(evt=> this.showLog());
    if (notebook.Phase === 'Shutdown' || notebook.Phase === 'Failed') {

      this.downButton = button(['hy-button'], {}, "Download").click(evt=> this.download());
      action = div(['hyml-top-pad-half', 'hy-button-group'], [this.downButton, this.logButton]);
      statusStyle = 'hy-nb-phase-complete';
    } else { 
      action = div(['hyml-top-pad-half'], [button(['hy-button-secondary'], {}, "Cancel"), , this.logButton]);
      statusStyle = 'hy-nb-phase-active';
    }
    
    if (notebook.Params && notebook.Params.OutputPath) {
      this.description = div([], [div(['hy-lh-1-half'],notebook.Params.OutputPath), div(['hy-text-secondary'],notebook.ContainerImage.Name)]);
    } else {
      this.description = div([], notebook.ContainerImage.Name);
    }

    this.el = div(['hyml-status-row'], [
                    div(['hyml-notebook-id', 'hyml-row-border-right', 'hyml-text-center'], notebook.ID.toString()),
                    div(['hyml-notebook-status', 'hyml-row-border-right', 'hyml-text-center'], [span([statusStyle], notebook.Phase)]),
                    div(['hyml-notebook-type', 'hyml-row-border-right', 'hyml-text-center'], notebook.POD.PodType),
                    div(['hyml-nb-status-desc'], [
                      this.description,
                      action,
                    ]),
                  ]);
  }

  /* Download output from notebook job run */
  download(){
    if ((!this.notebook.Params) && (!this.notebook.Params.OutputPath)) {
      showDialog({
        title: 'Download Failed',
        body: 'This notebook has no output to download. Please check the log to see if the job completed successfully.',
        buttons: [Dialog.okButton()]
      });
    } else {
      let cb = (response: any) => {
        console.log('got resp:', response);
      }
      let remote_path = this.notebook.Params.OutputPath
      let local_path = PageConfig.getOption('serverRoot')
      if (!remote_path) {
        let download_path = '/api/hyperml/storage?remote_path=' + remote_path + '&local_path=' + local_path
        RequestHandler.get(download_path,{}, cb)
      }
    }

  }
  /* Display failure reason from notebook record */
  showLog(){
    console.log('reason:', this.notebook);
    if (!this.notebook || !this.notebook.POD.FailureReason) {
      showDialog({
        title: 'Request Status',
        body: 'No log available for this request',
        buttons: [Dialog.okButton()]
      }); 
    } else {

      showDialog({
        title: 'Request Status',
        body: this.notebook.POD.FailureReason
      }); 
    }
  }
}

class NotebookStatusTable extends Widget {
  
  readonly toolbarEl: TagElement<"div">;
  el: TagElement<"div">;
  data: [];

  constructor(data: any) {
    super();
    this.toolbarEl = div (["hy-button-group", "hy-half-pad", "hy-border-bottom-1"], 
                      [
                        button(["hy-button"], {}, 
                          [
                            span([], 'Refresh')
                          ]
                        ).click(evt => this.refresh(evt))
                      ]);
  
    getNotebooks(this.buildList);
    this.el = div(['hyml-nb-status-main'], [this.toolbarEl])
    this.node.append(this.el);
  }

  buildList = (data: any): void => {

    let list = document.createElement("div");
    data.notebooks.sort(function(a:any , b:any){return -(a.ID - b.ID)});
    this.data = data.notebooks;
    
    data.notebooks.forEach((item: any)=> {
      let ns = new NotebookStatus(item);
      list.appendChild(ns.el);
    });

    this.el = div(['hyml-nb-status-table'], [
      //this.toolbarEl,
      list,
    ])
    this.node.append(this.el);
  }

  refresh(evt: any) {
    console.log('refresh event', evt);
    getNotebooks(this.buildList);
  }
}


function getNotebooks(cb: (data: any)=>void): any {
  RequestHandler.get('/api/hyperml/schedules', null, cb) 
}

function activate(app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer, 
  themeManager: IThemeManager | null,
  ) {
  
  const scheduleExtension = new ScheduleNotebookExtension(app);
  app.docRegistry.addWidgetExtension('Notebook', scheduleExtension);
  app.contextMenu.addItem({
    selector: '.jp-notebook',
    command: 'notebook:schedule',
    rank: -0.5 //?
  });

  app.commands.addCommand(CommandIDs.open, {
    execute: (args) => {
        let statuses = new NotebookStatusTable([]);
        let s = new StackedPanel();
        s.addWidget(statuses);
        s.id = 'hyperml-notebooks'
        s.title.label = 'Background Notebooks'
        s.addClass('hyml-statuses')

        s.title.closable=true;
        app.shell.add(s, 'main');
        app.shell.activateById(s.id);

    },
    isEnabled: () => true,
    label: CommandIDs.open,

  });

  palette.addItem({command: CommandIDs.open, category: "Console"});

}
export default extension;

 