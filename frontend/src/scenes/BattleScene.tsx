import Phaser from "phaser"

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene")
  }

  create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    this.cameras.main.setBackgroundColor("#222222")

    const title = this.add.text(centerX, 80, "BATTLE SCENE", {
      fontSize: "48px",
      color: "#d4af37",
      fontStyle: "bold",
    })
    title.setOrigin(0.5, 0)

    const btnStart = this.add.rectangle(centerX, centerY, 200, 60, 0x00AA00).setInteractive({ useHandCursor: true })
    this.add.text(centerX, centerY, "START GAME", { fontSize: "24px", color: "#fff" }).setOrigin(0.5)
    btnStart.on("pointerdown", () => this.scene.start("CompleteGame"))

    const btnBack = this.add.rectangle(centerX, centerY + 100, 200, 60, 0x8B0000).setInteractive({ useHandCursor: true })
    this.add.text(centerX, centerY + 100, "BACK", { fontSize: "24px", color: "#fff" }).setOrigin(0.5)
    btnBack.on("pointerdown", () => this.scene.start("MainMenuScene"))

    console.log("✅ BattleScene loaded!")
  }
}
