(function () {
    var c = document.getElementById('gameCanvas');
    var ctx = c.getContext('2d');

    var ball1;
    var ball2;

    var mouse = {
        x: 10,
        y: 10
    };

    function Ball(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.update = function() {
            this.draw();
        };

        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    function getDistance(x1, y1, x2, y2) {
        var xDistance = x2 - x1;
        var yDistance = y2 - y1;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    function updateCanvas() {
        ctx.canvas.width = window.innerHeight * 16 / 9;
        ctx.canvas.height = window.innerWidth * 9 / 16;
        init();
    }

    function init() {
        ball1 = new Ball(300, 300, 100, 'black');
        ball2 = new Ball(undefined, undefined, 30, 'red');
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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