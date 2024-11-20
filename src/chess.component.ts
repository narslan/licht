import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { wsConnect, Message, WsContext, makeBoard } from "./websocket.service";

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

  @property({ type: makeBoard(hrefToWs) })
  wsCtx?: WsContext;

  render() {
    return html`<div id="board"></div>`;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    const that = this;
    if (this.wsCtx) {
      this.wsCtx.onMessage = function (event: MessageEvent<string>) {
        const { id } = event.data.startsWith("{")
          ? (JSON.parse(event.data) as {
              id: string;
            })
          : { id: "" };
        that.engine_id = id;
        console.log(id);
      };
    }

    // this.wsCtx.onmessage = function (event: MessageEvent) {
    //   const { id } = event.data.startsWith("{")
    //     ? (JSON.parse(event.data) as {
    //         id: string;
    //       })
    //     : { id: "" };
  }

  static styles = [typescaleStyles, css``];
}

declare global {
  interface HTMLElementTagNameMap {
    "chess-element": ChessElement;
  }
}
