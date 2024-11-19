import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { Chess } from "chess.js";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);
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

  @property({ type: String })
  engine_id?: string;

  @property({ type: Chess })
  game = new Chess();

  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_uci`);

  render() {
    return html`
      <p class="md-typescale-body-small">${this.engine_id}</p>
      <md-outlined-button>Back</md-outlined-button>
      <md-filled-button>Next</md-filled-button>
      <md-filled-button>Next</md-filled-button>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    this.ws.onopen = function (event: Event) {
      console.log(event);
    };
    const that = this;

    this.ws.onmessage = function (event: MessageEvent) {
      const { id } = event.data.startsWith("{")
        ? (JSON.parse(event.data) as {
            id: string;
          })
        : { id: "" };

      that.engine_id = id;
      console.log(id);
    };
  }

  static styles = [typescaleStyles, css``];
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
