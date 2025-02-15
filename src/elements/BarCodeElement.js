import DocElement from './DocElement';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import * as utils from '../utils';

/**
 * Barcode doc element. Currently only Code-128 is supported.
 * @class
 */
export default class BarCodeElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementImage'), id, 80, 80, rb);
        this.elBarCode = null;
        this.content = '';
        this.format = 'CODE128';
        this.displayValue = false;
        this.barWidth = '2';
        this.errorCorrectionLevel = 'M';
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_colspan = '';
        this.spreadsheet_addEmptyRow = false;
        this.setInitialData(initialData);
        this.name = this.rb.getLabel('docElementBarCode');
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        if (this.content !== '') {
            this.updateBarCode();
        }
        this.updateDisplay();
        this.updateStyle();
    }

    setValue(field, value) {
        super.setValue(field, value);
        if (field === 'content' ||field === 'format' || field === 'displayValue' || field === 'barWidth' ||
                field === 'height' || field === 'errorCorrectionLevel') {
            this.updateBarCode();
            this.updateDisplay();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'x', 'y', 'height', 'content', 'format', 'displayValue', 'barWidth', 'errorCorrectionLevel',
            'printIf', 'removeEmptyElement',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_colspan', 'spreadsheet_addEmptyRow'
        ];
    }

    getElementType() {
        return DocElement.type.barCode;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(x);
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = this.rb.toPixel(width);
            this.el.style.height = this.rb.toPixel(height);
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['N', 'S'];
    }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroBarCodeElement' });
        this.elBarCode = utils.createElement('canvas', { id: `rbro_el_barcode${this.id}` } );
        this.el.append(this.elBarCode);
        this.appendToContainer();
        this.updateBarCode();
        super.registerEventHandlers();
    }

    remove() {
        super.remove();
    }

    updateBarCode() {
        if (this.format === 'QRCode') {
            this.widthVal = this.heightVal;
            this.width = '' + this.widthVal;
            let content = this.content;
            if (content === '') {
                content = 'https://www.reportbro.com';
            }
            let options = {
                width: this.widthVal,
                margin: 0,
                errorCorrectionLevel : this.errorCorrectionLevel
            };
            QRCode.toCanvas(this.elBarCode, content, options);
        } else {
            let valid = false;
            let options = {
                format: this.format, height: this.displayValue ? (this.heightVal - 22) : this.heightVal,
                margin: 0, displayValue: this.displayValue, width: 2
            };
            const barWidthVal = utils.convertInputToNumber(this.barWidth);
            if (barWidthVal) {
                options.width = barWidthVal;
            }
            if (this.content !== '' && this.content.indexOf('${') === -1) {
                try {
                    JsBarcode('#' + this.elBarCode.id, this.content, options);
                    valid = true;
                } catch (ex) {
                }
            }
            if (!valid) {
                // in case barcode cannot be created because of invalid input use default content appropriate
                // for selected format
                let content = '';
                if (this.format === 'CODE39' || this.format === 'CODE128') {
                    content = '12345678';
                } else if (this.format === 'EAN13') {
                    content = '5901234123457';
                } else if (this.format === 'EAN8') {
                    content = '96385074';
                } else if (this.format === 'EAN5') {
                    content = '12345';
                } else if (this.format === 'EAN2') {
                    content = '12';
                } else if (this.format === 'ITF14') {
                    content = '12345678901231';
                } else if (this.format === 'MSI' ||this.format === 'MSI10' || this.format === 'MSI11' ||
                        this.format === 'MSI1010' || this.format === 'MSI1110' || this.format === 'pharmacode') {
                    content = '1234';
                }
                // clear width and height which is set on canvas element when QR code is generated
                this.elBarCode.style.width = '';
                this.elBarCode.style.height = '';
                JsBarcode('#' + this.elBarCode.id, content, options);
            }
            this.widthVal = this.elBarCode.clientWidth;
            this.width = '' + this.widthVal;
        }
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'content', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'BarCodeElement';
    }
}
