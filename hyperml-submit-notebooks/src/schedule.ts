import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDisposable } from '@lumino/disposable';
import { caretRightIcon } from "@jupyterlab/ui-components";
import RequestHandler from './requests';
import {div, span, dropdown, checkbox, TagElement, DropdownElement} from './tags';
import { Dialog, showDialog, ToolbarButton } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { JSONObject } from '@lumino/coreutils';
import {CommandIDs} from './index';
import { PageConfig } from '@jupyterlab/coreutils';

/** 
 * Schedule Notebook extension
 * Adds button on notebook context menu and opens up a 
 * dialog for scheduling options 
 */
export class ScheduleNotebookExtension 
implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    private notebookPanel: NotebookPanel;
    constructor(app: JupyterFrontEnd) {
        this.app = app;
    }

    readonly app: JupyterFrontEnd;

    renderForm = (): void => {
        
        showDialog({
            title: 'Schedule Notebook',
            body: new ScheduleNotebook(),
            buttons: [Dialog.cancelButton(), Dialog.okButton()]
        }).then((result: any) => {

            if (result.value == null) {
                return;
            }
            var params = {
                notebook_path: this.notebookPanel.context.localPath,
                notebook_root: PageConfig.getOption('serverRoot'),
                resource_profile: result.value.resource_profile,
                container_image: result.value.container_image,
                include_folder: result.value.include_folder,
            }

            const onResponse = (response: any) =>  {
                if (response.failed || response.reason) {
                    // handle failure
                    console.log('API Error:', response.reason);
                    showDialog({
                        title: 'API failed',
                        body: response.reason,
                        buttons: [Dialog.okButton()]
                      });
              
                } else {
                    this.app.commands.execute(CommandIDs.open);
                }
            }

            RequestHandler.post('/api/hyperml/schedules', 
                                params,
                                onResponse);
            
        });

    }

    createNew(
        panel: NotebookPanel,
        context: DocumentRegistry.IContext<INotebookModel>
    ): IDisposable {
        this.notebookPanel = panel;
        const scheduleBtn = new ToolbarButton({
            label: 'Run in Background',
            icon: caretRightIcon,
            onClick: this.renderForm,
            className: 'hy-button',
            tooltip: 'Schedule Notebook in Background (hyperML)'
        });

        panel.toolbar.insertItem(9, 'scheduleNotebook', scheduleBtn);

        return scheduleBtn;
    }
}

export interface ScheduleParams extends JSONObject {
    resource_profile: string;
    container_image: string;
    include_folder: boolean;
}

/**
 * Schedule Notebook form content
 */
export class ScheduleNotebook extends Widget
implements Dialog.IBodyWidget<ScheduleParams> { 
    el: TagElement<"div">
    resourceSelector: DropdownElement;
    imageSelector: DropdownElement;
    includeFolder: boolean = false;

    constructor(){
        super();
        this.resourceSelector = dropdown(['hyperml-resource-select'], {'...': '...'});
        this.imageSelector = dropdown(['hyperml-image-select'], {'...': '...'});
        

        RequestHandler.get('/api/hyperml/resourceprofiles', null, (response: any) => {
            let resources = response.ResourceProfiles
            if (resources.length > 0) {
                var rsOptions = {} as Record<string, string>;

                resources.forEach((item: any) => {
                    var jsonKey  = item.ID as string
                    rsOptions[jsonKey] = item.Name as string;
                    
                });
            }  
            var s = this.node.getElementsByClassName('hyperml-resource-select')![0];
            this.resourceSelector = dropdown(['hyperml-resource-select', 'jp-mod-styled'], rsOptions);
            s.replaceWith(this.resourceSelector);
        });

        RequestHandler.get('/api/hyperml/containerimages', null, (response: any) => {
            let images = response.ContainerImages
            if (images.length > 0) {
                var imageOptions = {} as Record<string, string>;

                images.forEach((item: any) => {
                    
                    var jsonKey  = item.Name as string
                    imageOptions[jsonKey] = jsonKey;
                    
                });
            }  
            var s = this.node.getElementsByClassName('hyperml-image-select')![0];
            this.imageSelector = dropdown(['hyperml-image-select', 'jp-mod-styled'], imageOptions);
            s.replaceWith(this.imageSelector);
        });

        var foldercheck = checkbox([], 'Include Folder', false);
        foldercheck.change((evt: any)=> {
            console.log('received checkbox event:', evt.target.checked);
            this.includeFolder = evt.target.checked;
        });

        this.el = div(['hyml-sched-form'], [
            div([], span([], 'Choose a Resource Plan')),
            this.resourceSelector,
            div([], span([], 'Choose an Image')),
            this.imageSelector,
            div([], foldercheck),
            ]
        );

        this.node.appendChild(this.el);
        
    }
    showError(message: string): void {
        const alert = div([], span([''], message));
        this.node.appendChild(alert);
    }
    getValue(): ScheduleParams {
        const selected_profile = this.resourceSelector?.getSelectedValue();
        if (!selected_profile) {
            return null;
        }

        const selected_image = this.imageSelector?.getSelectedValue();
        if (!selected_image) {
            return null;
        }

        const sp: ScheduleParams = {
            resource_profile: selected_profile,
            container_image: selected_image,
            include_folder: this.includeFolder,
            
            // name of notebook
            // s3 location of upload?? 
        };
        return sp;
    }
}