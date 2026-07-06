import Phaser from 'phaser'

// CHANGED: Removed all import.meta.glob logic. Vite will copy the public/assets folder automatically, so we can load them directly.

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene')
    }

    preload() {
        console.log('GameScene preload')

        // CHANGED: Replaced glob object lookups with standard Phaser template strings using relative paths.
        for (let i = 0; i <= 19; i++) {
            this.load.image(`player_idle_${i}`, `assets/player/idle/survivor-idle_shotgun_${i}.png`)
        }

        // CHANGED: Applied relative paths.
        for (let i = 0; i <= 19; i++) {
            this.load.image(`player_move_${i}`, `assets/player/move/survivor-move_shotgun_${i}.png`)
        }

        // CHANGED: Applied relative paths.
        for (let i = 0; i <= 16; i++) {
            this.load.image(`enemy_idle_${i}`, `assets/enemies/skeleton/idle/skeleton-idle_${i}.png`)
        }

        // CHANGED: Applied relative paths.
        for (let i = 0; i <= 16; i++) {
            this.load.image(`enemy_move_${i}`, `assets/enemies/skeleton/move/skeleton-move_${i}.png`)
        }

        // CHANGED: Loaded bullet image directly with a relative path.
        this.load.image('bullet', 'assets/bullets/bullets.png')

        // CHANGED: Removed fallback variables and leading slashes.
        this.load.audio('snd_bgm', 'assets/audio/snd_bgm.mp3')
        this.load.audio('snd_enemyDeath', 'assets/audio/snd_enemyDeath.mp3')
        this.load.audio('snd_gun', 'assets/audio/snd_gun.mp3')

        this.load.on('loaderror', (file) => {
            console.log('FAILED:', file.src)
        })
    }

    create() {
        this.cameras.main.setBackgroundColor('#222222')

        this.snd_bgm = null
        this.snd_enemyDeath = null
        this.snd_gun = null

        try {
            if (this.cache.audio.exists('snd_bgm')) {
                this.snd_bgm = this.sound.add('snd_bgm', {
                    loop: true,
                    volume: 0.3
                })
                this.snd_bgm.play()
            } else {
                console.warn('snd_bgm not found in cache')
            }
        } catch (error) {
            console.warn('Unable to play bgm', error)
        }

        try {
            if (this.cache.audio.exists('snd_enemyDeath')) {
                this.snd_enemyDeath = this.sound.add('snd_enemyDeath', {
                    volume: 0.5
                })
            }
        } catch (error) {
            console.warn('Unable to add enemyDeath sound', error)
        }

        try {
            if (this.cache.audio.exists('snd_gun')) {
                this.snd_gun = this.sound.add('snd_gun', {
                    volume: 0.4
                })
            }
        } catch (error) {
            console.warn('Unable to add gun sound', error)
        }

        this.player = this.physics.add.sprite(
            512,
            384,
            'player_idle_0'
        )

        this.player.setScale(0.25)
        this.player.setCollideWorldBounds(true)

        this.player.body.setSize(
            this.player.width * 0.35,
            this.player.height * 0.5
        )

        this.playerHP = 100
        this.canTakeDamage = true

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        })

        this.bullets = this.physics.add.group()
        this.enemies = this.physics.add.group()
        this.physics.add.collider(
            this.enemies,
            this.enemies
        )
        
        this.enemyParticles = this.add.particles(0, 0, 'bullet', {
            speed: { min: 50, max: 200 },
            scale: { start: 0.03, end: 0 },
            lifespan: 300,
            quantity: 10,
            emitting: false
        })

        this.score = 0

        this.enemySpawnDelay = 2000
        this.enemySpeed = 100
        this.maxEnemySpeed = 300

        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        })

        this.hpText = this.add.text(20, 50, 'HP: 100', {
            fontSize: '24px',
            color: '#ff4444'
        })

        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            this.hitEnemy,
            null,
            this
        )

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.hitPlayer,
            null,
            this
        )

        this.input.on('pointerdown', (pointer) => {
            this.shoot(pointer)
        })

        if (!this.anims.exists('player_idle')) {
            this.anims.create({
                key: 'player_idle',
                frames: Array.from({ length: 20 }, (_, i) => ({
                    key: `player_idle_${i}`
                })),
                frameRate: 12,
                repeat: -1
            })
        }

        if (!this.anims.exists('player_move')) {
            this.anims.create({
                key: 'player_move',
                frames: Array.from({ length: 20 }, (_, i) => ({
                    key: `player_move_${i}`
                })),
                frameRate: 14,
                repeat: -1
            })
        }

        if (!this.anims.exists('enemy_move')) {
            this.anims.create({
                key: 'enemy_move',
                frames: Array.from({ length: 17 }, (_, i) => ({
                    key: `enemy_move_${i}`
                })),
                frameRate: 10,
                repeat: -1
            })
        }

        this.player.play('player_idle')

        this.spawnTimer = this.time.addEvent({
            delay: this.enemySpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })
    }

    update() {
        let isMoving = false

        this.player.setVelocity(0)

        if (this.keys.left.isDown) {
            this.player.setVelocityX(-200)
            isMoving = true
        }

        if (this.keys.right.isDown) {
            this.player.setVelocityX(200)
            isMoving = true
        }

        if (this.keys.up.isDown) {
            this.player.setVelocityY(-200)
            isMoving = true
        }

        if (this.keys.down.isDown) {
            this.player.setVelocityY(200)
            isMoving = true
        }

        if (isMoving) {
            if (this.player.anims.currentAnim?.key !== 'player_move') {
                this.player.play('player_move')
            }
        } else {
            if (this.player.anims.currentAnim?.key !== 'player_idle') {
                this.player.play('player_idle')
            }
        }

        const pointer = this.input.activePointer

        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        )

        this.player.setRotation(angle)

        this.enemies.getChildren().forEach((enemy) => {
            const chaseAngle = Phaser.Math.Angle.Between(
                enemy.x,
                enemy.y,
                this.player.x,
                this.player.y
            )

            enemy.setVelocity(
                Math.cos(chaseAngle) * this.enemySpeed,
                Math.sin(chaseAngle) * this.enemySpeed
            )

            enemy.setRotation(chaseAngle)
        })
    }

    shoot(pointer) {
        this.snd_gun.play()

        const bullet = this.bullets.create(
            this.player.x,
            this.player.y,
            'bullet'
        )

        bullet.setScale(0.01)

        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        )

        bullet.setVelocity(
            Math.cos(angle) * 600,
            Math.sin(angle) * 600
        )

        bullet.setRotation(angle)

        this.time.delayedCall(2000, () => {
            if (bullet.active) {
                bullet.destroy()
            }
        })
    }

    spawnEnemy() {
        const side = Phaser.Math.Between(0, 3)
        let x, y

        if (side === 0) {
            x = 0
            y = Phaser.Math.Between(0, 768)
        } else if (side === 1) {
            x = 1024
            y = Phaser.Math.Between(0, 768)
        } else if (side === 2) {
            x = Phaser.Math.Between(0, 1024)
            y = 0
        } else {
            x = Phaser.Math.Between(0, 1024)
            y = 768
        }

        const enemy = this.enemies.create(
            x,
            y,
            'enemy_move_0'
        )

        enemy.setScale(0.20)
        enemy.play('enemy_move')
    }

    hitEnemy(bullet, enemy) {
        this.snd_enemyDeath.play()

        this.enemyParticles.setPosition(enemy.x, enemy.y)
        this.enemyParticles.explode(10)

        bullet.destroy()
        enemy.destroy()

        this.score += 1
        this.scoreText.setText('Score: ' + this.score)

        if (this.score % 5 === 0) {
            if (this.enemySpeed < this.maxEnemySpeed) {
                this.enemySpeed += 20
            }

            if (this.enemySpawnDelay > 500) {
                this.enemySpawnDelay -= 200
            }

            this.spawnTimer.remove()

            this.spawnTimer = this.time.addEvent({
                delay: this.enemySpawnDelay,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            })
        }
    }

    hitPlayer(player, enemy) {
        if (!this.canTakeDamage) return

        this.playerHP -= 10
        this.hpText.setText('HP: ' + this.playerHP)

        this.canTakeDamage = false

        this.time.delayedCall(1000, () => {
            this.canTakeDamage = true
        })

        if (this.playerHP <= 0) {
            const finalScore = this.score
            this.snd_bgm.stop()
            this.scene.stop('GameScene')

            const highScore = localStorage.getItem('highScore') || 0
            if (finalScore > highScore) {
                localStorage.setItem('highScore', finalScore)
            }

            this.scene.start('GameOverScene', {
                score: finalScore,
                highScore: localStorage.getItem('highScore')
            })
        }
    }
}