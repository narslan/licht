import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './views/chess.component';
@customElement('main-layout')
export class MainLayout extends LitElement {
  render() {
    return html`
        <slot></slot>
         `;
  }
}