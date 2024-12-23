import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./pgn_fen_item";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

@customElement("pgn_fen-element")
export class PGNFEN extends LitElement {
  @property({ type: Array })
  moves = [];
  @property({ type: String })
  best = "";
  /*  @property({ type: Number })
  index = 0;
  @property({ type: String })
  move = "";
  @property({ type: String })
  best = "";*/
  // @property({ type: ChessBoardElement })
  // board = new ChessBoardElement();

  render() {
    return html`
      <md-list>
        ${this.moves.map((move) => html`
          <md-list-item>
          
          <div slot="headline">${move.move}</div>
          <div slot="supporting-text">
          <pgn_fen_item-element .beforeMove=${move.beforeMove} .afterMove=${move.afterMove} ></pgn_fen_item-element>
          </div>
        </md-list-item>
        <md-divider></md-divider>
          `  )  }
      </md-list>
    `;
  }

  static styles = [
    typescaleStyles,
    css`
      :host {
        font-size: 0.2rem;
      }
      md-list {
        width: 100px;
      }
    `,
  ];

  
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen-element": PGNFEN;
  }
}
