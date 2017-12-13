'use strict';
var width = window.innerWidth;
var height = window.innerHeight;

var candy;
var Wrap = Wrap || {};
Wrap.gameplay = function (game) { };
Wrap.gameplay.prototype = {
    preload: function () {      
        this.timer = 0;
        this.score = 0;
        this.total = 0;

        /*backgroung*/
        this.back = this.add.tileSprite(0, 0, width, height, "Fon");
        this.back.position.setTo(0, 0, 1);
        this.back.anchor.setTo(0);

        /*score*/
        this.scoreText = this.add.text(32, 32, 'Score : ' + this.score, { font: "bold 32px SouthPark", fill: "#000" });
        this.scoreText.position.setTo(5);

        /*enemy*/
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        
        /*boss*/
        this.boss = this.add.group();
        this.boss.enableBody = true;
        this.boss.physicsBodyType = Phaser.Physics.ARCADE;

        /*player*/
        this.player = this.add.sprite(400, 0, "Player");
        this.player.anchor.setTo(0.5);
        // this.player.smoothed = false;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(this.player);
        this.player.body.collideWorldBounds = true;

        this.add.tween(this.player).to({ y: 500 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);
        //this.physics.arcade.gravity.y = 40000;
        //this.physics.arcade.TITLE_BIAS = 32;
        //this.player.body.mass = 40;
        //this.player.body.angularVelocity = 200;
        //this.player.body.bounce.x = 0.35;
        //walk
        this.player.animations.add("WalkRight", [], 5, false, true);

        /*move*/
        this.cursor = this.input.keyboard.createCursorKeys();
        /*bullet*/
        this.bulletTimer = 0;

        this.bullets = customMethods.newGroup(16, "Bullet");
        this.bullets.setAll("outOfBoundsKill", true);
        this.bullets.setAll("checkWorldBounds", true);
        /*health*/
        this.player.health = this.player.maxHealth = 10;
        this.input.keyboard.addKey(Phaser.Keyboard.B).onDown.add(this.damagePlayer, this);
        this.emptyHB = this.add.sprite((width - 195), 5, "HealthEmpty");
        this.fullHB = this.add.sprite((width - 195), 5, "HealthFull", 1);
        this.life = this.add.sprite((this.emptyHB.x - 15), 15, "Life", 2);
        this.HBRect = new Phaser.Rectangle(0, 0, this.emptyHB.width, this.emptyHB.height);
        /*end of game*/
        this.gameOver = this.add.text(this.game.width * 0.5, this.game.height * 0.5, "Game Over", { font: "bold 100px SouthPark", fill: "crimson" })
        this.gameOver.stroke = "#000000";
        this.gameOver.strokeThickness = 20;
        this.gameOver.setShadow(2, 2, "#DCB8BF", 2, true, true);
        this.gameOver.exists = false;
        this.gameOver.visible = false;
        this.gameOver.anchor.setTo(0.5);

        // this.camera.follow(this.player,Phaser.Camera.FOLLOW_TOPDOWN,1,1);
        /*game control*/
        //this.pauseButton = this.add.button(this.game.height * 0.5,(this.game.height * 0.5)-55,"Button",this.pauseGame,this,1, 2, 0);

        this.pauseText = this.add.text(this.game.width * 0.5, (this.game.height * 0.5) - 55, "Pause", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.unPauseText = this.add.text(this.pauseText.x, (this.game.height * 0.5), "P/Esc", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.restartText = this.add.text(this.pauseText.x, (this.game.height * 0.5) + 55, "R-Restart", { font: "bold 60px SouthPark", fill: "#A0D631" });
        this.pauseText.visible = this.unPauseText.visible = this.restartText.visible = false;
        this.pauseText.anchor.setTo(0.5);
        this.unPauseText.anchor.setTo(0.5);
        this.restartText.anchor.setTo(0.5);


        this.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(this.pauseGame, this);
        this.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(this.pauseGame, this);
        this.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(this.restartGame, this);

        //won text
        this.stateText = this.add.text(this.game.width * 0.5, this.game.height * 0.5, ' ', { font: '84px SouthPark', fill: '#fff' });
        this.stateText.stroke = "#A0D631";
        this.stateText.strokeThickness = 16;
        this.stateText.setShadow(2, 2, "#333333", 2, true, true);
        this.stateText.anchor.setTo(0.5);
        this.stateText.visible = false;

        /*audio*/
        this.music = this.add.audio('Music', 1, true, true);
        //this.music.play('',0 ,1,true);
        this.music.volume = 0.5;
        this.voiceKill = this.add.audio('Killed', 1, true, true);
        this.voiceDamage = this.add.audio('Damage', 1, true, true);
        this.inSmallBoss = this.add.audio('Fight', 1, true, true);
        this.deathSmallBoss = this.add.audio('DeathSmallBoss', 1, true, true);
        this.inBigBoss = this.add.audio('BigBoss', 10000, true, true);
        this.playerWound = this.add.audio('Wound', 1, true, true);
        this.playerCry = this.add.audio('Cry', 1, true, true);


    },
    createNewEnemy: function () {
        var leftEnemyConfig = {
            startPoint: { x: width + 170, y: this.world.randomY * 0.3 + 300},
            endPoint: {x: -170 }
        };

        var rightEnemyConfig = {
            startPoint: { x: -170, y: this.world.randomY * 0.3 + 300 },
            endPoint: {x: width + 200}
        };
        
        var currentConfig;

        if (this.game.rnd.integerInRange(0, 1) == 1) {
            currentConfig = leftEnemyConfig;
        } else {
            currentConfig = rightEnemyConfig;
        };

        var enemy = this.enemies.create(currentConfig.startPoint.x, currentConfig.startPoint.y, 'Enemy');

        enemy.animations.add('walk');
        enemy.animations.play('walk', 10, true);

        this.add.tween(enemy).to(currentConfig.endPoint, 30000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        return enemy;
    },
    createEnemies: function () {
        this.createNewEnemy();
        // var enemy = this.enemies.create(width + 50, this.world.randomY * 0.3 + 400, 'Enemy');
        // var enemy2 = this.enemies.create(- 50, this.world.randomY * 0.25 + 450, 'Enemy');

        
        // enemy.animations.add('walk');
        // enemy.animations.play('walk', 10, true);
        // enemy2.animations.add('walk');
        // enemy2.animations.play('walk', 10, true);
        // this.add.tween(enemy).to({ x: -60  }, 30000, Phaser.Easing.Lin;8ear.None, true, 0, 1000, true);
        // this.add.tween(enemy2).to({ x: width + 5  }, 35000, Phaser.Easing.Linear.None, true, 0, 8000, true);
               
        this.total++;
        this.timer = this.time.now + this.game.rnd.integerInRange(500, 2000);
        // enemy.scale.setTo(0.4);
        // console.log(enemy.y);
        // if(enemy.y > 500 || enemy2.y > 500) {
        //     enemy.scale.setTo(0.8);
        //     enemy2.scale.setTo(0.8);;8
        // }
        // else if (enemy.y < 500 || enemy2.y < 500) {
        //     enemy.scale.setTo(0.2);
        //     enemy2.scale.setTo(0.2);
        // }
        
        // enemy.body.moves = enemy2.body.moves = false;
        // enemy.body.immovable = enemy2.body.immovable = true;
        // enemy.body.collideWorldBounds = enemy2.body.collideWorldBounds = true;

    },
    damageEnemy: function (bullet, enemy) {

        bullet.kill();
        enemy.kill();
        this.score++;
        this.scoreText.text = "Score : " + this.score;
        if (this.enemies.countLiving() == 0) {
            this.createSmallBoss();
            this.createCandy();
            this.voiceKill.play("", 0, 0.5, false);
            //this.voiceKill.volume = 0.5;
        }


    },
    createSmallBoss: function () {

        var smallBoss = this.boss.create(width + 5, this.world.randomY * 0.3 + 400, 'SmallBoss');
        smallBoss.animations.add('walk');
        smallBoss.animations.play('walk', 10, true);
        this.add.tween(smallBoss).to({ x: 0 }, 5000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        smallBoss.health = 15;

        // this.inSmallBoss.fadeIn(1000);
        // this.inSmallBoss.fadeOut(2000);

    },
    createBigBoss: function () {

        var bigBoss = this.boss.create(width + 5, this.world.randomY * 0.4 + 400, 'BigBoss');
        bigBoss.animations.add('walk');
        bigBoss.animations.play('walk', 10, true);
        this.add.tween(bigBoss).to({ x: 0 }, 4000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        bigBoss.health = 25;
        bigBoss.body.immovable = true;
        bigBoss.body.collideWorldBounds = true;
        bigBoss.body.bounce.setTo(1, 1);

        // this.inBigBoss.fadeIn(2000);
        // this.inBigBoss.fadeOut(2000);

    },

    damageSmallBoss: function (bullet, boss) {
        var bosses = this.boss.getFirstExists();
        bosses.damage(2);
            var health = bosses.health;
            this.score += 2;
        if (bosses.key === 'SmallBoss') {

            if (health <= 0) {
                this.deathSmallBoss.play('',0,0.75,false);
                this.createBigBoss();
            }
            console.log('kenny',bosses.health);
        }
        if (bosses.key === 'BigBoss') {
            
            if (health <= 0) {
                this.stateText.text = ' You Won, \n Click "R" \n to restart';
                this.player.kill();
                candy.kill();
                this.stateText.visible = true;
                this.music.fadeOut(1000);
            }
            console.log('chief',bosses.health);
        }
        bullet.kill();


        this.scoreText.text = "Score : " + this.score;
    },
    createCandy: function () {
        candy = this.add.sprite(200, 450, 'Candy');
        this.add.tween(candy).to({ y: 550 }, 1000, Phaser.Easing.Quadratic.In, true, 0, 0, false);

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(candy);
        candy.body.collideWorldBounds = true;
        // candy.body.moves = false;
        // candy.body.immovable = true;
        candy.body.collideWorldBounds = true;
    },
    takeCandy: function () {
        candy.kill();
        if (this.player.health < 10) {
            this.player.health = 10
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);
        }
    },

    create: function () {
        // this.bg = this.add.tileSprite(0, 0,width,height,"fon")
        this.input.mouse.capture = true;
    },
    update: function () {
        this.back.tilePosition.x -= 0.25;

        //keyboard
        this.player.body.velocity.setTo(0);
        var upperBound = 450;
        if ((this.cursor.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.UP)) && (this.player.y > upperBound)) {
            this.player.body.velocity.y = -200;
        }
        else if (this.cursor.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.body.velocity.y = 200;
        }
        if (this.cursor.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.body.velocity.x = -200;
        }
        else if (this.cursor.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.body.velocity.x = 200;
            this.player.animations.play("WalkRight", true);
        }
        else if (this.cursor.right.isDown || this.input.mousePointer.isDown) {
            this.player.animations.play("WalkRight", true);
            if (this.player.alive) {
                this.fire();
            }
        }
        
    if (this.total < 4 && (this.timer == 0 || this.time.now > this.timer)) {
            this.createEnemies();
        }

        this.physics.arcade.collide(this.player, [this.enemies, this.boss], this.damagePlayer, null, this);
        this.physics.arcade.overlap(this.player, candy, this.takeCandy, null, this);
        this.physics.arcade.overlap(this.bullets, this.boss, this.damageSmallBoss, null, this);
        this.physics.arcade.overlap(this.bullets, this.enemies, this.damageEnemy, null, this);

        this.enemies.sort('y', Phaser.Group.SORT_ASCENDING);
    },
    fire: function () {
        if (this.time.now > this.bulletTimer) {
            var bullet = this.bullets.getFirstExists(false, false, this.player.x, this.player.y);
            if (bullet) {
                bullet.angle = this.player.angle + 50;
                this.physics.arcade.moveToPointer(bullet, customValues.bulletProjectileSpeed);
                this.bulletTimer = this.time.now + customValues.playerFireRate;
            }
        }
    },
    damagePlayer: function (player, villains) {
        villains.y = villains.y + 5;
        if (villains.key == "Enemy") {
            player.damage(2);
            this.playerWound.play("", 0, 0.5, false);
            this.voiceDamage.play("", 0, 0.5, false);
        }
        if (villains.key == "SmallBoss") {
            player.damage(3);
        }
        if (villains.key == "BigBoss") {
            player.damage(10);
        }
        if (!this.game.paused || this.enemies.countLiving() > 0) {
            //this.player.y = this.player.y - 40;
            this.HBRect.width = Math.floor((this.player.health / this.player.maxHealth) * this.emptyHB.width);
            this.fullHB.crop(this.HBRect);

            // this.emptyHB.exists = this.fullHB.exists = this.life.exists = (this.player.health > 0);
            this.gameOver.exists = (this.player.health <= 0);

        }
        if (this.gameOver.exists) {
            //this.camera.fade(0x000000,2000,true);
            this.music.fadeOut(2000);
            this.enemies.kill();
            this.voiceDamage.stop();
            this.playerCry.fadeIn(1000);
        }

    },

    pauseGame: function () {
        if (this.enemies.countLiving() > 0 && !this.gameOver.exists) {
            this.game.paused = !this.game.paused;
            this.pauseText.visible = this.unPauseText.visible = this.restartText.visible = this.game.paused;
        }
    },
    restartGame: function () {
        this.state.start("Gameplay");
        this.game.paused = false;
    }
};