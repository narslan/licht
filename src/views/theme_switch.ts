import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("theme-switch")
export class ThemeSwitch extends LitElement {

  @property({ type: String, reflect: true })
  theme = 'light';
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html` <p>theme switch</p>      `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "theme-switch": ThemeSwitch;
  }
}
