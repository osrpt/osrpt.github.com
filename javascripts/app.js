(function () {
    'use strict';

    function drawLogo (ctx, size, radius) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }


    window.App = {};
    window.App.drawLogo = function (el) {
        var ctx = el.getContext('2d');
        drawLogo(ctx, 36, 12);
    };
}());

