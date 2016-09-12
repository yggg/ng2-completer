import { ContentChildren, Directive, ElementRef, EventEmitter, Host, Input, OnDestroy, OnInit, Output, Renderer } from "@angular/core";

import {CompleterItem} from "../components/ng2-completer/completer-item";
import { CtrCompleter, CompleterDropdown } from "./ctr-completer";


export interface CtrRowElement {
    setHighlited(selected: boolean): void;
    getNativeElement(): any;
    getDataItem(): CompleterItem;
}

export class CtrRowItem {
    constructor(public row: CtrRowElement, public index: number) { }
}

@Directive({
    selector: "[ctrDropdown]",
})
export class CtrDropdown implements CompleterDropdown, OnDestroy, OnInit {

    private rows: CtrRowItem[] = [];
    private currHighlited: CtrRowItem;
    private isScrollOn: boolean;

    constructor( @Host() private completer: CtrCompleter, private el: ElementRef, private renderer: Renderer) {
        this.completer.registerDropdown(this);
    }

    public ngOnInit() {
        let css = getComputedStyle(this.el.nativeElement);
        this.isScrollOn = css.maxHeight && css.overflowY === "auto";
    }

    public ngOnDestroy() {
        this.completer.registerDropdown(null);
    }

    public registerRow(row: CtrRowItem) {
        this.rows.push(row);
    }

    public highlightRow(index: number) {

        let highlited = this.rows.find(row => row.index === index);

        if (index < 0) {
            if (this.currHighlited) {
                this.currHighlited.row.setHighlited(false);
            }
            this.currHighlited = undefined;
            return;
        }

        if (!highlited) {
            return;
        }

        if (this.currHighlited) {
            this.currHighlited.row.setHighlited(false);
        }

        this.currHighlited = highlited;
        this.currHighlited.row.setHighlited(true);
    }

    public clear() {
        this.rows = [];
    }

    public selectCurrent() {
        console.log("select", this.currHighlited.row.getDataItem());
    }

    public nextRow() {
        let nextRowIndex = 0;
        if (this.currHighlited) {
            nextRowIndex = this.currHighlited.index + 1;
        }
        this.highlightRow(nextRowIndex);
        if (this.isScrollOn && this.currHighlited) {
            let row = this.currHighlited.row.getNativeElement();
            if (this.dropdownHeight() < row.getBoundingClientRect().bottom) {
                this.dropdownScrollTopTo(this.dropdownRowOffsetHeight(row));
            }
        }
    }

    public prevRow() {
        let nextRowIndex = -1;
        if (this.currHighlited) {
            nextRowIndex = this.currHighlited.index - 1;
        }
        this.highlightRow(nextRowIndex);
        if (this.isScrollOn && this.currHighlited) {
            let rowTop = this.dropdownRowTop();
            if (rowTop < 0) {
                this.dropdownScrollTopTo(rowTop - 1);
            }
        }
    }

    private dropdownScrollTopTo(offset: any) {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollTop + offset;
    }

    private dropdownRowTop() {
        return this.currHighlited.row.getNativeElement().getBoundingClientRect().top -
            (this.el.nativeElement.getBoundingClientRect().top +
                parseInt(getComputedStyle(this.el.nativeElement).paddingTop, 10));
    }

    private dropdownHeight() {
        return this.el.nativeElement.getBoundingClientRect().top +
            parseInt(getComputedStyle(this.el.nativeElement).maxHeight, 10);
    }

    private dropdownRowOffsetHeight(row: any) {
        let css = getComputedStyle(row);
        return row.offsetHeight +
            parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
    }
}
