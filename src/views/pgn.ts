// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Chess } from "chess.js";
import "chessboard-element";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("pgn-view")
export class PGNView extends LitElement {
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

  static styles = css`
    #pgn {
      width: 800px;
    }
  `;

  render() {
    return html`
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
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    //  this.ws.close();
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
			
			
			
			// this._parse.innerHTML = JSON.stringify(result, null, 2);
  }

  firstUpdated() {
    this.updateStatus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn-view": PGNView;
  }
}
