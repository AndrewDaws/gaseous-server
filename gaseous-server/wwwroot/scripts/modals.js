class Modal {
    constructor(contentUrl, buttons) {
        this.contentUrl = contentUrl;
        this.buttons = buttons;
        this.modalBackground = null;
        this.buttons = [];

        return;
    }

    async BuildModal() {
        // Create the modal background
        this.modalBackground = document.createElement('div');
        this.modalBackground.classList.add('modal-background');
        this.modalBackground.style.display = 'none';

        // Create the modal element
        this.modalElement = document.createElement('div');
        this.modalElement.classList.add('modal-window');

        // Load the modal template
        const templateResponse = await fetch('/pages/modals/modal.html');
        const templateContent = await templateResponse.text();

        // Load the content from the HTML file
        const response = await fetch("/pages/modals/" + this.contentUrl + ".html");
        const content = await response.text();

        // Set the content of the modal
        this.modalElement.innerHTML = templateContent;
        this.modalElement.querySelector('#modal-window-content').innerHTML = content;

        // Generate tabs
        const tabcontainer = this.modalElement.querySelector('#modal-tabs');
        const tabs = this.modalElement.querySelectorAll('[name="modalTab"]');
        if (tabs.length > 0) {
            let firstTab = true;
            tabs.forEach((tab) => {
                let newTab = document.createElement('div');
                newTab.id = 'tab-' + tab.id;
                newTab.classList.add('modal-tab-button');
                newTab.setAttribute('data-tabid', tab.id);
                newTab.innerHTML = tab.getAttribute('data-tabname');
                newTab.addEventListener('click', () => {
                    tabs.forEach((tab) => {
                        if (tab.getAttribute('id') !== newTab.getAttribute('data-tabid')) {
                            tab.style.display = 'none';
                            tabcontainer.querySelector('[data-tabid="' + tab.id + '"]').classList.remove('model-tab-button-selected');
                        } else {
                            tab.style.display = 'block';
                            tabcontainer.querySelector('[data-tabid="' + tab.id + '"]').classList.add('model-tab-button-selected');
                        }
                    });
                });
                if (firstTab) {
                    newTab.classList.add('model-tab-button-selected');
                    tab.style.display = 'block';
                    firstTab = false;
                } else {
                    tab.style.display = 'none';
                }
                tabcontainer.appendChild(newTab);
            });
        } else {
            tabcontainer.style.display = 'none';
        }

        // add the window to the modal background
        this.modalBackground.appendChild(this.modalElement);

        // Append the modal element to the document body
        document.body.appendChild(this.modalBackground);

        // Add event listener to close the modal when the close button is clicked
        this.modalElement.querySelector('#modal-close-button').addEventListener('click', () => {
            this.close();
        });

        // Add event listener to close the modal when clicked outside
        this.modalBackground.addEventListener('click', (event) => {
            if (event.target === this.modalBackground) {
                this.close();
            }
        });

        // Add event listener to close the modal when the escape key is pressed
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        return;
    }

    async open() {
        // hide the scroll bar for the page
        document.body.style.overflow = 'hidden';

        // buttons
        const buttonContainer = this.modalElement.querySelector('#modal-footer');
        if (this.buttons.length > 0) {
            this.buttons.forEach((button) => {
                buttonContainer.appendChild(button.render());
            });
        } else {
            const closeButton = document.createElement('button');
            closeButton.classList.add('modal-button');
            closeButton.classList.add('bluebutton');
            closeButton.innerHTML = 'OK';
            closeButton.addEventListener('click', () => {
                this.close();
            });
            buttonContainer.appendChild(closeButton);
        }

        // show the modal
        this.modalBackground.style.display = 'block';

        return;
    }

    close() {
        // Remove the modal element from the document body
        if (this.modalBackground) {
            this.modalBackground.remove();
            this.modalBackground = null;
        }

        // Show the scroll bar for the page
        if (document.getElementsByClassName('modal-window-body').length === 0) {
            document.body.style.overflow = 'auto';
        }
    }

    addButton(button) {
        this.buttons.push(button);
    }

    disableButtons() {
        this.buttons.forEach((button) => {
            button.button.disabled = true;
        });
    }

    enableButtons() {
        this.buttons.forEach((button) => {
            button.button.disabled = false;
        });
    }

    disableButton(buttonId) {
        this.buttons.forEach((button) => {
            if (button.text === buttonId) {
                button.button.disabled = true;
            }
        });
    }

    enableButton(buttonId) {
        this.buttons.forEach((button) => {
            if (button.text === buttonId) {
                button.button.disabled = false;
            }
        });
    }

    removeTab(tabId) {
        const tab = this.modalElement.querySelector('#tab-' + tabId);
        if (tab) {
            tab.style.display = 'none';
        }
    }
}

// type: 0 or null = normal, 1 = blue, 2 = red
class ModalButton {
    constructor(text, type, callingObject, callback) {
        this.text = text;
        this.type = type;
        this.callingObject = callingObject;
        this.callback = callback;

        return;
    }

    button = null;

    render() {
        this.button = document.createElement('button');
        this.button.id = this.text;
        this.button.classList.add('modal-button');
        if (this.type) {
            switch (this.type) {
                case 1:
                    this.button.classList.add('bluebutton');
                    break;
                case 2:
                    this.button.classList.add('redbutton');
                    break;
            }
        }
        this.button.innerHTML = this.text;
        let callback = this.callback;
        let callingObject = this.callingObject;
        this.button.addEventListener('click', function () {
            callback(callingObject);
        });
        return this.button;
    }
}

class MessageBox {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.buttons = [];

        return;
    }

    async open() {
        // create the dialog
        this.msgDialog = await new Modal('messagebox');
        await this.msgDialog.BuildModal();

        // override the dialog size
        this.msgDialog.modalElement.style = 'width: 400px; height: unset; min-width: unset; min-height: 200px; max-width: unset; max-height: unset;';

        // set the title
        this.msgDialog.modalElement.querySelector('#modal-header-text').innerHTML = this.title;

        // set the message
        this.msgDialog.modalElement.querySelector('#messageText').innerHTML = this.message;

        // add buttons
        if (this.buttons) {
            for (let i = 0; i < this.buttons.length; i++) {
                this.msgDialog.addButton(this.buttons[i]);
            }
        }

        await this.msgDialog.open();
    }

    addButton(button) {
        this.buttons.push(button);
    }
}

class FileOpen {
    constructor(okCallback, cancelCallback, ShowFiles = false) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
        if (ShowFiles === null || ShowFiles === undefined) {
            this.ShowFiles = false;
        } else {
            this.ShowFiles = ShowFiles;
        }
        this.SelectedPath = '/';
    }

    async open() {
        // Create the modal
        this.dialog = await new Modal("filepicker");
        await this.dialog.BuildModal();

        // override the dialog size
        this.dialog.modalElement.style = 'width: 600px; height: 350px; min-width: unset; min-height: unset; max-width: unset; max-height: unset;';

        // setup the dialog
        this.dialog.modalElement.querySelector('#modal-header-text').innerHTML = "Select Path";
        this.dialog.modalElement.querySelector('#modal-body').setAttribute('style', 'overflow-x: auto; overflow-y: hidden; padding: 0px;');

        // load the first path
        this.filePickerBox = this.dialog.modalElement.querySelector('#fileSelector');
        let fileOpenItem = new FileOpenFolderItem(this, "/", this.ShowFiles);
        await fileOpenItem.open();
        this.filePickerBox.append(fileOpenItem.Item);

        // setup the path text display
        this.pathBox = this.dialog.modalElement.querySelector('#selectedPath');

        // add ok button
        let okButton = new ModalButton("OK", 1, this, async function (callingObject) {
            if (callingObject.okCallback) {
                callingObject.okCallback();
            }
            callingObject.dialog.close();
        });
        this.dialog.addButton(okButton);

        // add cancel button
        let cancelButton = new ModalButton("Cancel", 2, this, async function (callingObject) {
            if (callingObject.cancelButton) {
                callingObject.cancelCallback();
            }
            callingObject.dialog.close();
        });
        this.dialog.addButton(cancelButton);

        // show the dialog
        this.dialog.open();
    }

    async close() {
        this.dialog.close();
    }
}

class FileOpenFolderItem {
    constructor(ParentObject, Path, ShowFiles) {
        this.ParentObject = ParentObject;
        this.Path = Path;
        this.ShowFiles = ShowFiles;
        this.Item = null;
    }

    async open() {
        const response = await fetch('/api/v1.1/FileSystem?path=' + encodeURIComponent(this.Path) + '&showFiles=' + this.ShowFiles).then(async response => {
            if (!response.ok) {
                // handle the error
                console.error("Error fetching profile");
            } else {
                const pathList = await response.json();

                // create the item
                let item = document.createElement('li');
                item.classList.add('filepicker-item');

                // set the item
                this.Item = item;

                // add the paths to the item
                pathList['directories'].forEach((path) => {
                    let pathItem = document.createElement('div');
                    pathItem.classList.add('filepicker-path');
                    pathItem.innerHTML = path.name;
                    pathItem.addEventListener('click', async () => {
                        this.Item.querySelectorAll('.filepicker-path').forEach((path) => {
                            path.classList.remove('filepicker-path-selected');
                        });
                        pathItem.classList.add('filepicker-path-selected');
                        let fileOpenItem = new FileOpenFolderItem(this.ParentObject, path.path, this.ShowFiles);
                        await fileOpenItem.open();

                        // remove all items after this one
                        while (this.ParentObject.filePickerBox.lastChild !== this.Item) {
                            this.ParentObject.filePickerBox.removeChild(this.ParentObject.filePickerBox.lastChild);
                        }

                        this.ParentObject.filePickerBox.append(fileOpenItem.Item);
                        fileOpenItem.Item.scrollIntoView();

                        this.ParentObject.pathBox.innerHTML = path.path;
                        this.ParentObject.SelectedPath = path.path;
                    });
                    item.appendChild(pathItem);
                });
            }
        });
    }
}