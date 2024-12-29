
import "@material/web/chips/chip-set.js";

import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./pgn_fen_item";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

@customElement("pgn_fen-element")
export class PGNFEN extends LitElement {
  @property({ type: Array })
  moves = [];

  render() {
    return html`
      <md-chip-set>
    
    ${this.moves.map(
      (move) => html`
       <pgn_fen_item-element
                    .beforeMove=${move.beforeMove}
                    .afterMove=${move.afterMove}
                    .index=${move.index}
                    .move=${move.move}>
                  </pgn_fen_item-element>`
    )}

      </md-chip-set>
    `;
  }

  static styles = [
    typescaleStyles,
    css`

    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen-element": PGNFEN;
  }
}
