import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import "./../templates/example"
@customElement('litplayground-element')
export class LitPlayground extends LitElement {
    static styles = css`
        :host {
        display: block;
        background-color: lightgray;
        padding: 8px;
        }
        
        :host(.blue) {
        background-color: aliceblue;
        color: darkgreen;
        }
    `;
    
    protected render() {
        return html`<example1-element class="blue"></example1-element>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "litplayground-element": LitPlayground;
  }
}
