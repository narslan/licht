import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

@customElement("pgn_fen_item-element")
export class PGNFENItem extends LitElement {
  @property({ attribute: false, type: String })
  beforeMove = "";
  @property({ attribute: false, type: String })
  afterMove = "";
  @property({ attribute: false, type: String })
  best = "";
  @property({ attribute: false, type: String })
  score = "";
  @property({ attribute: false, type: Number })
  index = "";

  getEngineMove() {
    if (this.best === "") {
      return html`
        <md-outlined-button
          @click=${{
            handleEvent: () => this._setBoard(),
            bubble: true,
          }}
        >
        </md-outlined-button>
      `;
    } else {
      return html`${this.best}, ${this.score}`;
    }
  }

  render() {
    return html`<p>${this.getEngineMove()}</p>`;
  }

  static styles = [
    typescaleStyles,
    css`
      :host {
        font-size: 0.2rem;
      }
    `,
  ];

  private _setBoard() {
    const options = {
      detail: this.afterMove,
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent("myclick", options));

    const fen = this.beforeMove;

    if (fen) {
      // Set board.

      // Talk to server to obtain engines idea .
      const ws = new WebSocket(`ws://localhost:8000/_hamle`);

      ws.onopen = () => {
        const fens = { action: "onOpen", data: fen };
        ws.send(JSON.stringify(fens));
      };

      ws.onmessage = (msg: MessageEvent) => {
        const { action, data } = msg.data.startsWith("{")
          ? (JSON.parse(msg.data) as {
              action: string;
              data: {
                best: string;
                cp: string;
              };
            })
          : { action: "", data: { best: "", cp: "" } };

        if (action === "onData") {
          this.best = data["best"];
          this.score = data["cp"];
          ws.close();
        }
      };
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen_item-element": PGNFENItem;
  }
}
