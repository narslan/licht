import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './routes';
@customElement('main-layout')
export class MainLayout extends LitElement {
  render() {
    return html`
      
        <div slot="drawer">
          <a href="/">Hello world</a>
          <a href="/chess">Chess</a>
          <a href="/homews">Home ws</a>
        </div>
        <slot></slot>
         `;
  }
}