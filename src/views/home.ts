import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/checkbox/checkbox.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { Chess } from "chess.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./chess";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);

import "@weblogin/trendchart-elements";

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
  @property({ type: Number, attribute: false })
  count = 0;

  @property({ type: String, attribute: false })
  engine_id?: string;

  @property({ type: Chess, attribute: false })
  game = new Chess();

  @property({ type: WebSocket, attribute: false })
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
      <tc-line
        class="chart"
        values="[26,22,20,24,30,34,18,29,33,41,38,45,32,25,19,28,22,18,19,24,22,21,32,34,36,40]"
        weight="3"
        point="11"
        style="width:400px;--shape-color:rgb(51 48 39); "
      ></tc-line>
      <tc-line
        class="chart"
        values="[26,22,20,24,30,34,18,29,33,41,38,45,32,25,19,28,22,18,19,24,22,21,32,34,36,40]"
        weight="3"
        point="11"
        style="width:400px;--shape-color:rgb(105 0 5);"
      ></tc-line>
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
        .chart{
        --point-inner-color=rgb(105 0 5);
        }
        
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "home-element": HomeElement;
  }
}
