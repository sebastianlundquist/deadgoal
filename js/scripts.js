(function () {
    var c = document.getElementById('gameCanvas');
    var ctx = c.getContext('2d');

    var balls;
    var gravity = 0.5;
    var dampening = 0.7;

    var mouse = {
        x: 10,
        y: 10
    };

    function Ball(x, y, radius, mass, color) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.radius = radius;
        this.mass = mass;
        this.color = color;

        this.update = function(balls) {
            this.draw();

            for(var i = 0; i < balls.length; i++) {
                if(this === balls[i]) continue;
                if(getDistance(this.x, this.y, balls[i].x, balls[i].y) - this.radius - balls[i].radius < 0) {
                    //console.log(this.color + " and " + i +" have collided at " + Math.round(this.x) + "," + Math.round(this.y));
                    resolveCollision(this, balls[i]);
                }
            }

            //if (this.velocity.x * x + this.velocity.y * y >= this.radius)
            if(this.x - this.radius <= 0 || this.x + this.radius >= ctx.canvas.width) {
                this.velocity.x = -dampening * this.velocity.x;
            }
            else if(this.y - this.radius <= 0 || this.y + this.radius >= ctx.canvas.height) {
                this.velocity.y = -dampening * this.velocity.y;
                this.velocity.x *= 0.97;
            }
            else {
                this.velocity.y += gravity;
            }

            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Nudging from edges
            if(this.x + this.radius > ctx.canvas.width) {
                this.x = ctx.canvas.width - this.radius;
                this.velocity.x *= 0.9;
            }
            else if(this.x < this.radius) {
                this.x = this.radius;
                this.velocity.x *= 0.9;
            }
            if(this.y + this.radius > ctx.canvas.height) {
                this.y = ctx.canvas.height - this.radius;
                this.velocity.y *= 0.9;
            }
            else if(this.y < this.radius) {
                this.y = this.radius;
                this.velocity.y *= 0.9;
            }

            if(Math.abs(this.velocity.x) < 0.1) {
                this.velocity.x = 0;
            }
            if(Math.abs(this.velocity.y) < 1 && this.y + this.radius >= ctx.canvas.height - 10) {
                this.velocity.y = 0;
            }

            console.log("y: " + this.y);
            console.log("v: " + this.velocity.y);
        };

        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    function rotate(velocity, angle) {
        return {
            x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
            y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
        };
    }

    function resolveCollision(ball, otherBall) {
        var xVelocityDiff = ball.velocity.x - otherBall.velocity.x;
        var yVelocityDiff = ball.velocity.y - otherBall.velocity.y;

        var xDist = otherBall.x - ball.x;
        var yDist = otherBall.y - ball.y;

        // Prevent accidental overlap of particles
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

            // Grab angle between the two colliding particles
            var angle = -Math.atan2(otherBall.y - ball.y, otherBall.x - ball.x);

            // Store mass in var for better readability in collision equation
            var m1 = ball.mass;
            var m2 = otherBall.mass;

            // Velocity before equation
            var u1 = rotate(ball.velocity, angle);
            var u2 = rotate(otherBall.velocity, angle);

            // Velocity after 1d collision equation
            var v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
            var v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

            // Final velocity after rotating axis back to original location
            var vFinal1 = rotate(v1, -angle);
            var vFinal2 = rotate(v2, -angle);

            // Swap ball velocities for realistic bounce effect
            ball.velocity.x = vFinal1.x;
            ball.velocity.y = vFinal1.y;

            otherBall.velocity.x = vFinal2.x;
            otherBall.velocity.y = vFinal2.y;
        }
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function getDistance(x1, y1, x2, y2) {
        var xDistance = x2 - x1;
        var yDistance = y2 - y1;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    function randIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function updateCanvas() {
        if(window.innerWidth >= window.innerHeight * 16 / 9) {
            ctx.canvas.width = window.innerHeight * 16 / 9;
            ctx.canvas.height = window.innerHeight;
        }
        else {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerWidth * 9 / 16;
        }
        init();
    }

    function init() {
        balls = [];
        for (var i = 0; i < 30; i++) {
            var width;
            var height;
            var radius = Math.floor((Math.random() * 20) + 10);
            var mass = 1;
            var color = getRandomColor();

            if(window.innerWidth >= window.innerHeight * 16 / 9) {
                width = window.innerHeight * 16 / 9;
                height = window.innerHeight;
            }
            else {
                width = window.innerWidth;
                height = window.innerWidth * 9 / 16;
            }

            var x = randIntBetween(radius, width - radius);
            var y = randIntBetween(radius, height - radius);

            // Makes sure no balls overlap when they are generated
            if(i !== 0) {
                for(var j = 0; j < balls.length; j++) {
                    if(getDistance(x, y, balls[j].x, balls[j].y) - radius - balls[j].radius < 0) {
                        x = randIntBetween(radius, width - radius);
                        y = randIntBetween(radius, height - radius);
                        j = -1;
                    }
                }
            }

            balls.push(new Ball(x, y, radius, mass, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        /*
        ball1.update();
        ball2.x = mouse.x;
        ball2.y = mouse.y;
        ball2.update();

        if(getDistance(ball1.x, ball1.y, ball2.x, ball2.y) < ball1.radius + ball2.radius) {
            ball1.color = 'red';
        }
        else {
            ball1.color = 'black';
        }

        console.log(getDistance(ball1.x, ball1.y, ball2.x, ball2.y));
        */
        for(var i = 0; i < balls.length; i++) {
            balls[i].update(balls);
        }
    }

    init();
    animate();
    updateCanvas();
    window.addEventListener('resize', updateCanvas);

    addEventListener('mousemove', function() {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
})();