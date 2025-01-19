// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/divider/divider.js";

import "chessboard-element";

interface PGNRow {
    date: string;
    event: string;
    player1: string;
    player2: string;
    result: string;
    site: string;
    eco: string;
    moves: string;
}

@customElement("pgn_server-element")
export class PGNServer extends LitElement {
    @query("#database_id")
    _database_id: unknown;

    @property({ type: WebSocket })
    ws = new WebSocket(`ws://localhost:8000/_pgndb`);
    @property({ type: Array  })
    pagans = [];

    
    @property({ attribute: false })
    header = ["Date", "Event", "White", "Black", "Result", "Site", "Eco"];
    
    static styles = css``;
   
    
  render() {
    return html`
<div id="database_id"></div>
<div id="pgn_table">
<table>
<thead>
<tr>
${this.header.map(i => html`<th>${i}</th>`)}
</tr>
</thead>
<tbody>

${this.pagans?.map(i => html`
          <tr>
          <td>${i["date"]}</td>
          <td>${i["event"]}</td>
          <td>${i["player1"]}</td>
          <td>${i["player2"]}</td>
          <td>${i["result"]}</td>
          <td>${i["site"]}</td>
          <td>${i["eco"]}</td>
          </tr>
          `)}
    </tbody>
  </table>


</div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    this.ws.onmessage = (msg: MessageEvent) => {
      const { db, pgns } = msg.data.startsWith("{")
        ? (JSON.parse(msg.data) as {
            db: string;
            pgns: [];
        })
        : { db: "", pgns: [] };
        console.log(pgns);
        this.db = db;
        this.pagans = pgns;
        
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
