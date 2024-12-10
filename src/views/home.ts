import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { Chess } from "chess.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./chess";
document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("home-element")
export class HomeElement extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  @property({ type: String })
  engine_id?: string;

  @property({ type: Chess })
  game = new Chess();

  @property({ type: WebSocket })
  ws = new WebSocket(`ws://localhost:8000/_home`);

  @property({ type: String })
  color = "white";

  render() {
    return html`
      <label>
        Material 3
        <md-checkbox checked></md-checkbox>
      </label>

      <md-outlined-button>Back</md-outlined-button>
      <md-filled-button>Next</md-filled-button>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    this.ws.onerror = function (event: Event) {
      console.log(event);
    };

    this.ws.onopen = function (event: Event) {
      console.log(event);
    };
    const that = this;

    this.ws.onmessage = function (msg: MessageEvent) {
      const { action, data } = msg.data.startsWith("{")
        ? (JSON.parse(msg.data) as {
            action: string;
            data: string;
          })
        : { action: "", data: "" };

      if (action === "onConnect") {
        that.engine_id = data;
      }
    };
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.ws.close();
  }

  static styles = [
    typescaleStyles,
    css`
      label {
        font-family: "Open Sans";
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "home-element": HomeElement;
  }
}
