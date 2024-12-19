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
  color = "white";
  @property({ type: String })
  beforeMove = "";
  @property({ type: Number })
  index = 0;
  @property({ type: String })
  move = "";

  render() {
    return html`<md-list-item"> ${this.index}. ${this.move} </md-list-item>
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
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen-element": PGNFEN;
  }
}
