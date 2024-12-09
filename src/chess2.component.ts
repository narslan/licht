// Must use ?inline because ?inline prevents vite from inserting the styles in
// a <style> the <head>
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Chess } from "chess.js";
import {
  INPUT_EVENT_TYPE,
  COLOR,
  Chessboard,
  BORDER_TYPE,
} from "cm-chessboard/src/Chessboard.js";
import {
  MARKER_TYPE,
  Markers,
} from "cm-chessboard/src/extensions/markers/Markers.js";
import {
  PROMOTION_DIALOG_RESULT_TYPE,
  PromotionDialog,
} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";
import { Accessibility } from "cm-chessboard/src/extensions/accessibility/Accessibility.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("chess2-element")
export class ChessElement2 extends LitElement {

  @query("#status")
  _status: any;
  @query("#pgn")
  _pgn: any;
  @query("#fen")
  _fen: any;
  @property({ type: String })
  orientation = "";

  @property({ type: Number })
  count = 0;
  @property({ type: String })
  engine_id = "";
  @property({ type: Chess })
  game = new Chess();
  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_uci`);
  @property({ type: Chessboard })
  board = new Chessboard(document.getElementById("board"), {
    position: this.game.fen(),
    assetsUrl: "./node_modules/cm-chessboard/assets/",
    style: {
      borderType: BORDER_TYPE.none,
      pieces: { file: "pieces/staunty.svg" },
      animationDuration: 300,
    },
    orientation: COLOR.white,
    extensions: [
      { class: Markers, props: { autoMarkers: MARKER_TYPE.square } },
      { class: PromotionDialog },
      { class: Accessibility, props: { visuallyHidden: true } },
    ],
  });


  static styles = css`

  `;

  render() {
    return html`
        <div id="status"></div>
    <div id="pgn"></div>
    <div id="fen"></div>

    `;
  }

  constructor() {
    super();
    this.game = new Chess();
  }


  _dispatchChangeOrientation() {
    this.orientation = this.orientation === "black" ? "white" : "black";

    // const name = this.orientation === "black" ? "white" : "black";
    // const options = {
    //   detail: { name },
    //   bubbles: true,
    //   composed: true,
    // };
    // console.log("options", options);

    // this.dispatchEvent(new CustomEvent("boardOrientation", options));
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

    this.board.enableMoveInput(this.inputHandler, COLOR.white);
  }


  makeEngineMove() {
    const fen = { action: "onMove", data: this.game.fen() };
    this.ws.send(JSON.stringify(fen));
  }
  inputHandler(event: any) {
    console.log("inputHandler", event);
    const cboard = event.chessboard;
    if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
      return; // ignore this event
    }
    if (event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
      cboard.removeLegalMovesMarkers();
    }
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
      console.log(this.game);

      // mark legal moves
      const moves = this.game.moves({
        square: event.squareFrom,
        verbose: true,
      });
      cboard.addLegalMovesMarkers(moves);
      return moves.length > 0;
    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
      const move = {
        from: event.squareFrom,
        to: event.squareTo,
        promotion: event.promotion,
      };
      const result = this.game.move(move);
      if (result) {
        cboard.state.moveInputProcess.then(() => {
          // wait for the move input process has finished
          cboard.setPosition(this.game.fen(), true).then(() => {
            // update position, maybe castled and wait for animation has finished
            this.makeEngineMove();
          });
        });
      } else {
        // promotion?
        let possibleMoves = this.game.moves({
          square: event.squareFrom,
          verbose: true,
        });
        for (const possibleMove of possibleMoves) {
          if (
            possibleMove.promotion &&
            possibleMove.to === event.squareTo
          ) {
            cboard.showPromotionDialog(
              event.squareTo,
              COLOR.white,
              (result: any) => {
                console.log("promotion result", result);
                if (
                  result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected
                ) {
                  this.game.move({
                    from: event.squareFrom,
                    to: event.squareTo,
                    promotion: result.piece.charAt(1),
                  });
                  cboard.setPosition(this.game.fen(), true);
                  this.makeEngineMove();
                } else {
                  // promotion canceled
                  cboard.enableMoveInput(this.inputHandler, COLOR.white);
                  cboard.setPosition(this.game.fen(), true);
                }
              }
            );
            return true;
          }
        }
      }
      return result;
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
      if (event.legalMove) {
        cboard.disableMoveInput();
      }
    }
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
    // this._chessBoard.setPosition(this.game.fen());
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
    "chess2-element": ChessElement2;
  }
}
