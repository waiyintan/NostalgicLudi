import Phaser, { Tilemaps } from "phaser";
import ludi from "./assets/ludi.png";
import ground from "./assets/ground.png";
import fox from "./assets/fox.png";
import star from "./assets/candy.png";
import bomb from "./assets/ilbi.png";
import buttons from "./assets/buttons.png";
import gameOverPic from "./assets/gameover.png";
import platform from "./assets/platform.png";
import platform2 from "./assets/platform2.png";
import steps from "./assets/steps.png";


class MyGame extends Phaser.Scene {
  constructor() {
    super();
    this.face = "right";
    this.score = 0;
    this.gameOver = false;
  }

  preload() {
    console.log(this);
    this.load.audio("aquarium", require("./assets/Aquarium.mp3"));
    this.load.image("ludi", ludi);
    this.load.image("ground", ground);
    this.load.image("steps", steps);
    this.load.image("platform", platform);
    this.load.image("platform2", platform2);
    this.load.image("star", star);
    this.load.image("bomb", bomb);
    this.load.image("buttons", buttons);
    this.load.image("gameOverPic", gameOverPic);

    this.load.spritesheet("fox", fox, {
      frameWidth: 47.5,
      frameHeight: 50,
    });
  }

  create() {
    //music
    let music;
    if(this.sound.sounds.length >=1) {
      this.sound.get("aquarium").play({loop:true})
    } else {
      music = this.sound.add("aquarium")
      music.play({loop:true})
    }

    this.add.image(400, 270, "ludi").setScale(0.6);
    const platforms = this.physics.add.staticGroup();
    //platforms
    platforms.create(400, 570, "ground").refreshBody();
    platforms.create(380, 280, "steps");
    platforms.create(420, 450, "steps");
    platforms.create(550, 220, "steps");
    platforms.create(600, 380, "platform");
    platforms.create(50, 220, "platform2");
    platforms.create(750, 150, "platform");

    this.player = this.physics.add.sprite(100, 450, "fox");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    //animations
    this.anims.create({
      key: "face-left",
      frames: [{ key: "fox", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "face-right",
      frames: [{ key: "fox", frame: 9 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("fox", { start: 5, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("fox", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    //stars
    const stars = this.physics.add.group({
      key: "star",
      repeat: 7,
    });

    stars.children.iterate(function (child) {
      child.setPosition(
        Phaser.Math.Between(0, game.config.width),
        Phaser.Math.Between(0, game.config.height / 2)
      );
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(this.player, stars, collectStar, null, this);

    //bombs
    const bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(this.player, bombs, bombTouched, null, this);

    function bombTouched(player, bomb) {
      this.physics.pause();
      this.player.setTint(0xff000);
      this.player.anims.play("face-left");
      this.score = 0
      this.gameOver = true;

      let gameOverText = this.add
        .image(game.config.width / 2, game.config.height / 3, "gameOverPic")
        .setScale(0.1)
        .setOrigin(0.5);

      this.button = this.add
        .image(game.config.width / 2, game.config.height / 1.8, "buttons")
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => this.button.setScale(0.11))
        .on("pointerout", () => this.button.setScale(0.1))
        .on("pointerdown", () => this.button.setScale(0.1))
        .on("pointerup", () => {
          this.button.setScale(0.11);
          this.gameOver = false;
          this.scene.restart();
        });
    }
    //score text

    const scoreText = this.add.text(15, 15, "Score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    //stars collision
    function collectStar(player, star) {
      star.disableBody(true, true);
      this.score += 10;
      scoreText.setText("Score:" + this.score);

      if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });

        var x =
          player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        const bomb = bombs.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-100, 100), 20);
      }
    }
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (this.gameOver) {
      this.sound.get("aquarium").stop()
      return;
    }

    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
      this.face = "left";
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
      this.face = "right";
    } else if (this.face === "right") {
      this.player.setVelocityX(0);
      this.player.anims.play("face-right");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("face-left");
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-310);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 459 },
      debug: false,
    },
  },
  scene: MyGame,
};

const game = new Phaser.Game(config);
