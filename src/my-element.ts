import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { Chess } from "chess.js";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element")
export class MyElement extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  @property({ type: Chess })
  game = new Chess();

  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_uci`);

  render() {
    return html`
      <label>
        Material 3
        <md-checkbox checked></md-checkbox>
        <md-checkbox checked></md-checkbox>
      </label>

      <md-outlined-button>Back</md-outlined-button>
      <md-filled-button>Next</md-filled-button>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    this.ws.onopen = function (event: Event) {
      console.log(event);
    };

    this.ws.onmessage = function (event: MessageEvent) {
      console.log(event.data);
      const id = event.data["id"];
      console.log(id);
    };
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
