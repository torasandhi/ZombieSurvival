import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create() {
        console.log('MenuScene create')
        this.cameras.main.setBackgroundColor('#111111')

        // TITLE
        const titleText = this.add.text(
            512,
            180,
            'ZOMBIE SURVIVAL',
            {
                fontSize: '48px',
                color: '#ffffff'
            }
        ).setOrigin(0.5)

        // CREDIT
        this.add.text(
            512,
            240,
            'by Tora Sandhi Kamulian',
            {
                fontSize: '18px',
                color: '#aaaaaa'
            }
        ).setOrigin(0.5)

        // START BUTTON
        const startButton = this.add.text(
            512,
            380,
            '[ START GAME ]',
            {
                fontSize: '32px',
                color: '#00ff00'
            }
        ).setOrigin(0.5)

        startButton.setInteractive()

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene')
        })

        // TWEEN 1: TITLE FLOATING
        this.tweens.add({
            targets: titleText,
            y: 165,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })

        // TWEEN 2: BUTTON PULSE
        this.tweens.add({
            targets: startButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })
    }
}