import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("home-component")
export class HomeComponent extends LitElement {
  @property() name = "12334";
  protected render() {
    return html` <p @boardOrientation=${this._orientationListener}>
        <slot></slot>
      </p>
      <p>Login: ${this.name}</p>
        <p>Login: ${this.name}</p>
        <p>Login: ${this.name}</p>
          <p>Login: ${this.name}</p>
      `;
  }
  private _orientationListener(e: CustomEvent) {
    this.name = e.detail.name;
    console.log("event fired");
    
  }
}
