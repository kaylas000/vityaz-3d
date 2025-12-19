import Phaser from "phaser"

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene")
  }

  create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    this.cameras.main.setBackgroundColor("#1a1a2e")

    const title = this.add.text(centerX, 100, "VITYAZ", { fontSize: "64px", color: "#d4af37", fontStyle: "bold" })
    title.setOrigin(0.5)

    const btnPlay = this.add.rectangle(centerX, centerY - 50, 200, 60, 0x00AA00).setInteractive({ useHandCursor: true })
    this.add.text(centerX, centerY - 50, "PLAY", { fontSize: "24px", color: "#fff" }).setOrigin(0.5)
    btnPlay.on("pointerdown", () => this.scene.start("BattleScene"))

    const btnExit = this.add.rectangle(centerX, centerY + 50, 200, 60, 0x8B0000).setInteractive({ useHandCursor: true })
    this.add.text(centerX, centerY + 50, "EXIT", { fontSize: "24px", color: "#fff" }).setOrigin(0.5)
    btnExit.on("pointerdown", () => window.close())

    console.log("✅ MainMenuScene loaded!")
  }
}
