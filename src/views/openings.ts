import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import { eco } from "./openings_data";
document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

import "@weblogin/trendchart-elements";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("openings-element")
export class OpeningsElement extends LitElement {

  render() {
    return html`
      <ul>
        ${eco.map(el => html`<li>${el.eco} ${el.name}</li>`)}
      </ul>
    `;

  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;


  }

  async disconnectedCallback() {
    super.disconnectedCallback();

  }

  static styles = [
    typescaleStyles,
    css`
      .chart{
      --point - inner - color=rgb(105 0 5);
    }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "openings-element": OpeningsElement;
  }
}
