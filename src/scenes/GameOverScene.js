import Phaser from 'phaser'

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene')
    }

    init(data) {
        this.finalScore = data.score ?? 0
        this.highScore = data.highScore ?? 0
    }

    create() {
        this.cameras.main.setBackgroundColor('#111111')

        // TITLE
        this.add.text(
            512,
            180,
            'GAME OVER',
            {
                fontSize: '64px',
                color: '#ff0000'
            }
        ).setOrigin(0.5)

        // CURRENT SCORE
        this.add.text(
            512,
            300,
            'Current Score: ' + this.finalScore,
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5)

        // HIGH SCORE
        this.add.text(
            512,
            360,
            'All-Time High: ' + this.highScore,
            {
                fontSize: '32px',
                color: '#ffff00'
            }
        ).setOrigin(0.5)

        // RESTART BUTTON
        const restartText = this.add.text(
            512,
            470,
            '[ RESTART ]',
            {
                fontSize: '32px',
                color: '#00ff00'
            }
        ).setOrigin(0.5)

        restartText.setInteractive()

        restartText.on('pointerdown', () => {
            this.scene.start('GameScene')
        })
    }
}