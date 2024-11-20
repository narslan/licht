// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Chess } from "chess.js";

import "chessboard-element";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("chess-element")
export class ChessElement extends LitElement {
  @query("chess-board")
  _chessBoard: any;
  @query("#status")
  _status: any;
  @query("#pgn")
  _pgn: any;
  @query("#fen")
  _fen: any;

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;
  @property({ type: String })
  engine_id = "";
  @property({ type: Chess })
  game = new Chess();
  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_uci`);

  render() {
    //TODO: This below seems so stupid. Sue me for it.
    const pathname = location.pathname.slice(1);
    let orientation = "";
    let otherOrientation = "";
    if (pathname === "") {
      orientation = "white";
      otherOrientation = "Black";
    } else if (pathname === "white") {
      orientation = "white";
      otherOrientation = "Black";
    } else {
      orientation = "black";
      otherOrientation = "White";
    }

    return html`
      <div style="display:flex ">
        <div>
          <chess-board
            @drag-start="${this._onDragStart}"
            @drop="${this._onDrop}"
            @snap-end="${this._onSnapEnd}"
            style="width: 1600px"
            position="start"
            orientation="${orientation}"
            draggable-pieces
          >
          </chess-board>
          <div id="fen"></div>
          <button
            @click="${() =>
              window.location.replace(
                `http://localhost:5173/${otherOrientation.toLowerCase()}`
              )}"
          >
            Play ${otherOrientation}
          </button>
        </div>
        <div
          style="display:flex; flex-direction: column; flex-wrap: wrap; width: 200px;  "
        >
          <div id="status"></div>

          <div id="pgn" style="text-align: left;"></div>
        </div>
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
            data: string;
          })
        : { action: "", data: "" };

      if (action === "onConnect") {
        this.engine_id = data;
      } else if (action === "onMove") {
        if (data.length == 4 || data.length == 5) {
          const from = data.slice(0, 2);
          const to = data.slice(2, 4);

          try {
            this.game.move({
              from: from,
              to: to,
              promotion: "q", // NOTE: always promote to a queen
            });

            this.updateStatus();
          } catch (error) {
            console.log("error from server", error);
          }
        }
      }
    };
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
      const fen = { action: "onMove", data: this.game.fen() };
      this.ws.send(JSON.stringify(fen));
      this.updateStatus();
    } catch (error) {
      setAction("snapback");
    }
  }

  private _onSnapEnd() {
    this._chessBoard.setPosition(this.game.fen());
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
    this._pgn.innerHTML = this.game.pgn();
  }

  firstUpdated() {
    this.updateStatus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chess-element": ChessElement;
  }
}