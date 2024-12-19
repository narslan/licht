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

  render() {
    return html`<md-list-item>
    <div slot="headline" @click="${this._setBoard}">${this.index}. ${this.move}</div>
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
      if (fen) {
        const event = new CustomEvent('myfen', {

          detail: {
        
            message: 'Something important happened'
        
          }
        
        });
        this.dispatchEvent(event);
      }
    }
}

declare global {
  interface HTMLElementTagNameMap {
    "pgn_fen-element": PGNFEN;
  }
}
