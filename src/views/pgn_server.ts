// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Chess } from "chess.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/divider/divider.js";

import "chessboard-element";

@customElement("pgn_server-element")
export class PGNServer extends LitElement {
  @query("chess-board")
  _chessBoard: any;
  @query("#status")
  _status: any;
  @query("#pgn")
  _pgn: any;
  @query("#fen")
  _fen: any;
  @query("#parse")
  _parse: any;
  @query("#database_id")
  _database_id: any;

  @property({ type: String })
  orientation = "black";

  @property({ type: Number })
  count = 0;
  @property({ type: String })
  engine_id = "";
  @property({ type: Chess })
  game = new Chess();
  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_pgn`);
  @property({ type: Array })
  moves = [];

  static styles = css`
    #pgn {
      width: 800px;
    }

    md-list {
      border-radius: 8px;
      outline: 1px solid var(--md-sys-color-outline);
      max-width: 360px;
      overflow: hidden;
      width: 100%;
    }
  `;

  render() {
    return html`
      <div id="database_id"></div>
      <div id="chessboard">
        <div>
          <chess-board
            @drag-start="${this._onDragStart}"
            @drop="${this._onDrop}"
            @snap-end="${this._onSnapEnd}"
            style="width: 600px"
            position="start"
            orientation="${this.orientation}"
            move-speed="slow"
            draggable-pieces
          >
          </chess-board>
          <div id="fen"></div>

          <p>
            <button @click=${this._dispatchChangeOrientation}>
              Change Sides
            </button>
          </p>
        </div>
        <div
          style="display:flex; flex-direction: column; flex-wrap: wrap; width: 200px; "
        >
          <div id="status"></div>

          <div id="pgn" style="text-align: left;"></div>
          <code id="parse" style="text-align: left;"></code>
        </div>
      </div>
    `;
  }

  _dispatchChangeOrientation() {
    this.orientation = this.orientation === "black" ? "white" : "black";
  }

  private _onDragStart(e: CustomEvent) {
    const { piece } = e.detail;

    if (this.game.isGameOver()) {
      e.preventDefault();
      return;
    }
    // only pick up pieces for the side to move
    if (
      (this.game.turn() === "w" && piece.search(/^b/) !== -1) ||
      (this.game.turn() === "b" && piece.search(/^w/) !== -1)
    ) {
      e.preventDefault();
      return;
    }
  }

  private _onDrop(e: CustomEvent) {
    const { source, target, setAction } = e.detail;

    try {
      this.game.move({
        from: source,
        to: target,
        promotion: "q", // NOTE: always promote to a queen
      });

      this.updateStatus();
    } catch (error) {
      setAction("snapback");
    }
  }

  private _onSnapEnd() {
    this._chessBoard.setPosition(this.game.fen());
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
        this.engine_id = data.db;
        this._database_id.innerHTML = data.db;
        console.log(data.moves);
        this.moves = data.moves.split(" ").filter((word) => word.length > 0);

        const movesList = this.moves
          .map((element, index) => {
            return `<md-list-item> ${index + 1}. ${element} </md-list-item>`;
          })
          .join("");

        this._pgn.innerHTML = `<md-list style="max-width: 180px;">
          ${movesList}
        </md-list>`;
      } else if (action === "onMove") {
        if (data.moves.length == 4 || data.moves.length == 5) {
          const from = data.moves.slice(0, 2);
          const to = data.moves.slice(2, 4);

          try {
            this.game.move({
              from: from,
              to: to,
              promotion: "q", // NOTE: always promote to a queen
            });
            this.updateStatus();

            if (!this.game.isGameOver()) {
              //? the above line dubious, what should I do here? What is the requirement for the end of the game.
              const fen = { action: "onMove", data: this.game.fen() };
              this.ws.send(JSON.stringify(fen));
            }
          } catch (error) {
            //console.log("error from server", error);
          }
        }
      }
    };
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.ws.close();
  }

  private updateStatus() {
    let status = "";

    let moveColor = "White";
    if (this.game.turn() === "b") {
      moveColor = "Black";
    }

    if (this.game.isCheckmate()) {
      // checkmate?
      status = `Game over, ${moveColor} is in checkmate.`;
    } else if (this.game.isDraw()) {
      // draw?
      status = "Game over, drawn position";
    } else {
      // game still on
      status = `${moveColor} to move`;

      // check?
      if (this.game.isCheck()) {
        status += `, ${moveColor} is in check`;
      }
    }
    this._chessBoard.setPosition(this.game.fen());
    this._status.innerHTML = status;
    this._fen.innerHTML = this.game.fen();
  }

  firstUpdated() {
    this.updateStatus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_server-element": PGNServer;
  }
}
