import { LitElement, html, css } from "lit";

export class RandomNumberElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html` <h1>Random</h1>
      <p>This is the random page.</p>`;
  }
}
customElements.define("random-number-element", RandomNumberElement);
