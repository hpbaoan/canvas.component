import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'draw-canvas',
  template: `<canvas #canvas></canvas>
  <hr />
    <button type="button" class="btn btn-primary" (click)="reset()">Reset</button>
    <label class="" >{{record()}}</label>
  `,
  styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas')
  public canvas!: ElementRef;

  @Input() public width = 600;
  @Input() public height = 400;
  @Input() public imageUrl!: string;
  @Input() public pointsData!: string;

  subscription: Subscription;
  activePoint:number = 0;
  points: Array<any> = [3,378,149,322,291,305,316,315,298,367,320,399,2,401];
  startpoint: any;

  private ctx: CanvasRenderingContext2D;
  private canvasEl: HTMLCanvasElement;

  constructor() {

  }

  public ngAfterViewInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.ctx = this.canvasEl.getContext('2d');

    if (!this.imageUrl) {
      // Demo only
      this.imageUrl = "https://picsum.photos/id/1018/600/400";
    }

    if(this.pointsData) {
      var v = this.pointsData.replace(/[^0-9\,]/ig, '');
      if (v.length) {
          this.points = v.split(',').map(function (point) {
              return parseInt(point, 10);
          });
      } else {
          this.points = [];
      }
    } else {
      // Demo only
      this.points = [3,378,149,322,291,305,316,315,298,367,320,399,2,401];
    }

    this.captureEvents(this.canvasEl);
    console.log(this.canvasEl);

    let image = new Image();
    image.src = this.imageUrl;

    let that = this;
    image.onload = function() {
      that.canvasEl.height = image.height || that.width;
      that.canvasEl.width = image.width || that.height;
      that.canvasEl.style.background = 'url('+image.src+')';
      that.canvasEl.style.backgroundSize = 'contain';

      that.draw();
    };

  }

  captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown').subscribe((event) => { this.mousedown(event); });
    fromEvent(canvasEl, 'contextmenu').subscribe((event) => { this.rightclick(event); });
    fromEvent(canvasEl, 'mouseup').subscribe((event) => { this.stopdrag(event); });
  }

  //-----------
  dotLineLength(x, y, x0, y0, x1, y1, o) {
    function lineLength(x, y, x0, y0){
        return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    }
    if(o && !(o = function(x, y, x0, y0, x1, y1){
            if(!(x1 - x0)) return {x: x0, y: y};
            else if(!(y1 - y0)) return {x: x, y: y0};
            var left, tg = -1 / ((y1 - y0) / (x1 - x0));
            return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
        }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
        var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
        return l1 > l2 ? l2 : l1;
    }
    else {
        var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
        return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
    }
  };

  //-----------
  move (e) {
    if (!e.offsetX) {
      e.offsetX = (e.pageX - this.canvasEl.offsetLeft);
      e.offsetY = (e.pageY - this.canvasEl.offsetTop);

    }

    this.points[this.activePoint] = Math.round(e.offsetX);
    this.points[this.activePoint + 1] = Math.round(e.offsetY);

    this.draw();
  };

  moveall (e) {
    if (!e.offsetX) {
        e.offsetX = (e.pageX - this.canvasEl.offsetLeft);
        e.offsetY = (e.pageY - this.canvasEl.offsetTop);
    }
    if (!this.startpoint) {
      this.startpoint = {x: Math.round(e.offsetX), y: Math.round(e.offsetY)};
    }
    var sdvpoint = {x: Math.round(e.offsetX), y: Math.round(e.offsetY)};
    for (var i = 0; i < this.points.length; i++) {
      this.points[i] = (sdvpoint.x - this.startpoint.x) + this.points[i];
      this.points[++i] = (sdvpoint.y - this.startpoint.y) + this.points[i];
    }
    this.startpoint = sdvpoint;
    this.draw();
  };

  stopdrag(e) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.record();
    this.activePoint = null;
  };

  rightclick(e) {
    e.preventDefault();
    if (!e.offsetX) {
        e.offsetX = (e.pageX - this.canvasEl.offsetLeft);
        e.offsetY = (e.pageY - this.canvasEl.offsetLeft);
    }
    var x = e.offsetX, y = e.offsetY;
    for (var i = 0; i < this.points.length; i += 2) {
        let dis = Math.sqrt(Math.pow(x - this.points[i], 2) + Math.pow(y - this.points[i + 1], 2));
        if (dis < 6) {
          this.points.splice(i, 2);
          this.draw();
          this.record();
          return false;
        }
    }
    return false;

  };

  mousedown(e) {
    var x, y, dis, lineDis, insertAt = this.points.length;

    if (e.which === 3) {
        return false;
    }

    e.preventDefault();
    if (!e.offsetX) {
      e.offsetX = (e.pageX - this.canvasEl.offsetLeft);
      e.offsetY = (e.pageY - this.canvasEl.offsetTop);
    }
    x = e.offsetX;
    y = e.offsetY;

    if (this.points.length >= 6) {
        var c = this.getCenter();
        this.ctx.fillRect(c.x - 4, c.y - 4, 8, 8);
        dis = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
        if (dis < 6) {
          this.startpoint = null;
          this.subscription = fromEvent(this.canvasEl, 'mousemove').subscribe((event) => { this.moveall(event); });
          return false;
        }
    }

    for (var i = 0; i < this.points.length; i += 2) {
        dis = Math.sqrt(Math.pow(x - this.points[i], 2) + Math.pow(y - this.points[i + 1], 2));
        if (dis < 6) {
          this.activePoint = i;

          this.subscription = fromEvent(this.canvasEl, 'mousemove').subscribe((event) => { this.move(event); });
          return false;
        }
    }

    for (var i = 0; i < this.points.length; i += 2) {
        if (i > 1) {
            lineDis = this.dotLineLength(
                x, y,
                this.points[i], this.points[i + 1],
                this.points[i - 2], this.points[i - 1],
                true
            );
            if (lineDis < 6) {
                insertAt = i;
            }
        }
    }

    this.points.splice(insertAt, 0, Math.round(x), Math.round(y));
    this.activePoint = insertAt;

    this.subscription = fromEvent(this.canvasEl, 'mousemove').subscribe((event) => { this.move(event); });

    this.draw();
    this.record();

    return false;

  };

  reset () {
    this.points = [];
    this.draw();
  };

  getCenter () {
    var ptc = [];
    for (i = 0; i < this.points.length; i++) {
        ptc.push({x: this.points[i], y: this.points[++i]});
    }
    var first = ptc[0], last = ptc[ptc.length - 1];
    if (first.x != last.x || first.y != last.y) ptc.push(first);
    var twicearea = 0,
        x = 0, y = 0,
        nptc = ptc.length,
        p1, p2, f;
    for (var i = 0, j = nptc - 1; i < nptc; j = i++) {
        p1 = ptc[i];
        p2 = ptc[j];
        f = p1.x * p2.y - p2.x * p1.y;
        twicearea += f;
        x += ( p1.x + p2.x ) * f;
        y += ( p1.y + p2.y ) * f;
    }
    f = twicearea * 3;
    return {x: x / f, y: y / f};
  };


  draw() {
    this.ctx.canvas.width = this.ctx.canvas.width;  // ?

    this.record();
    if (this.points.length < 2) {
        return;
    }
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.strokeStyle = 'rgb(255,20,20)';
    this.ctx.lineWidth = 1;
    if (this.points.length >= 6) {
        var c = this.getCenter();
        this.ctx.fillRect(c.x - 4, c.y - 4, 8, 8);
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0], this.points[1]);
    for (var i = 0; i < this.points.length; i += 2) {
      this.ctx.fillRect(this.points[i] - 2, this.points[i + 1] - 2, 4, 4);
      this.ctx.strokeRect(this.points[i] - 2, this.points[i + 1] - 2, 4, 4);
        if (this.points.length > 2 && i > 1) {
          this.ctx.lineTo(this.points[i], this.points[i + 1]);
        }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
    this.ctx.fill();
    this.ctx.stroke();

  };

  record () {
    return this.points.join(',');
  };

}
