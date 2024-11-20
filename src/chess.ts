import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { Chess } from "chess.js";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { wsConnect, Message, WsContext } from "./models";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

const hrefToWs = `ws://localhost:8000/_uci`;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("chess-element")
export class ChessElement extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  @property({ type: String })
  engine_id?: string;

  @property({ type: Chess })
  game = new Chess();

  @property({ type: WsContext })
  wsCtx = new WebSocket(hrefToWs);

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
    let wsContext: WsContext;
    wsContext.onMessage = function (event: MessageEvent) {
      console.log(event);
    };

    const that = this;

    this.wsCtx.onmessage = function (event: MessageEvent) {
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
    "chess-element": ChessElement;
  }
}
