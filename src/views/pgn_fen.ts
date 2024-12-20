import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

@customElement("pgn_fen-element")
export class PGNFEN extends LitElement {
  @property({ type: String })
  beforeMove = "";
  @property({ type: Number })
  index = 0;
  @property({ type: String })
  move = "";
  @property({ type: String })
  best = "";

  render() {
    return html`<md-list-item>
        <div slot="headline" @click="${this._setBoard}">
          ${this.index}. ${this.move}
        </div>
        <div slot="headline"></div>
        <div slot="supporting-text">${this.best}</div>
      </md-list-item>
      <md-divider></md-divider>`;
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
    const fen = this.beforeMove;
    console.log(fen);

    if (fen) {
      const ws = new WebSocket(`ws://localhost:8000/_hamle`);

      ws.onopen = () => {
        const fen = { action: "onOpen", data: this.beforeMove };
        ws.send(JSON.stringify(fen));
      };

      ws.onmessage = (msg: MessageEvent) => {
        const { action, data } = msg.data.startsWith("{")
          ? (JSON.parse(msg.data) as {
              action: string;
              data: {
                moves: string;
                db: string;
              };
            })
          : { action: "", data: { best: "" } };

        if (action === "onData") {
          this.best = data["best"];
          ws.close();
        }
      };
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen-element": PGNFEN;
  }
}
