// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/divider/divider.js";

import "chessboard-element";

@customElement("pgn_server-element")
export class PGNServer extends LitElement {
  @query("#database_id")
  _database_id: unknown;

  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_pgndb`);

  static styles = css``;

  render() {
    return html`
      <div id="database_id"></div>
    
      </div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    this.ws.onmessage = (msg: MessageEvent) => {
      const { action, data } = msg.data.startsWith("{")
        ? (JSON.parse(msg.data) as {
          action: string;
          data: {
            moves: string;
            db: string;
          };
        })
        : { action: "", data: { moves: "", db: "" } };

      if (action === "onConnect") {
        console.log(data);
      }
    };
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.ws.close();
  }

  firstUpdated() { }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_server-element": PGNServer;
  }
}
