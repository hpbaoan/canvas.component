### Area canvas drawing component
Canvas area draw component for Angular 10+
Fell free to use, edit it to fix your tasks.

### Demo page
https://hpbaoan.github.io/canvas.component/

### Info
I post from those guys code for my project, thanks

https://github.com/sedrakpc/angular-canvas-area-draw
https://gitlab.com/fahrenheit/community/jquery-canvas-area-draw/-/blob/master/jquery.canvasAreaDraw.js


### Usage:
import to your module and add to declarations
```html
import { CanvasComponent } from './components/canvas-draw/canvas-draw.component';
@NgModule({
  declarations: [
    ...
    CanvasComponent,
    ...
  ],
  ...
```
Add component to html file
```html
 <draw-canvas pointsData="3,378,149,322,291,305,316,315,298,367,320,399,2,401" imageUrl="https://picsum.photos/id/1018/600/400" ></draw-canvas>
```

- Click center point to move all points.
- Click and drag any point to move one point.
- CLick any where on canvas to create new point
- Right click on exist point to delete
- Reset button use to clear all points.
- Label show current all points data

### Params:
 _Param name_    | _Description_ 
----------------|---------------
points          | Drawing polygons coordinates 
image-url       | background image url
width           | canvas use image width or this
height          | canvas use image height or this
