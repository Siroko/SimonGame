var THREE = require('three');
var TweenMax = require("gsap");
var _ = require("lodash");
var TimerGraphic = require('./TimerGraphic');

var Navigation = function( camera, dummyCamera, scene ){
  THREE.EventDispatcher.call( this );

  this.ON_NAVIGATION = 'onNav';
  this.active = true;
  this.scene = scene;
  this.dummyCamera = dummyCamera;
  this.camera = camera;
  this.unlocked = false;
  this.boxClicked = false;
  this.buttonsEnabled = false;

  this.center = new THREE.Vector3( 0, 0, 0 );
  this.offsets = new THREE.Vector4( 2, 0, 8, 0.5 );
  this.raycaster = new THREE.Raycaster();

  var textureButton = THREE.ImageUtils.loadTexture('assets/button_less.png');
  this.material = new THREE.MeshBasicMaterial({map: textureButton});
  this.material.transparent = true;

  var textureButton2 = THREE.ImageUtils.loadTexture('assets/button_selected.png');
  this.material2 = new THREE.MeshBasicMaterial({map: textureButton2});
  this.material2.transparent = true;

  var textureButton3 = THREE.ImageUtils.loadTexture('assets/button_more.png');
  this.material3 = new THREE.MeshBasicMaterial({map: textureButton3});
  this.material3.transparent = true;

  this.controlNav = [];
  this.timing = false;

  this.timer = 0;
  this.FocusLupa = 0;

  this.init();
  this.setup();
};
Navigation.prototype = Object.create( THREE.EventDispatcher.prototype );

Navigation.prototype.init = function() {
  this.panelNavigation = new THREE.Object3D();
  this.unlockBlock = new THREE.Object3D();
  this.pointer = new THREE.Object3D();

};

Navigation.prototype.setup = function(){
  this.scene.add( this.panelNavigation );
  this.panelNavigation.add(this.unlockBlock);

  var geometryCube = new THREE.PlaneGeometry( this.offsets.w, this.offsets.w, this.offsets.w );
  this.cubeMore = new THREE.Mesh( geometryCube, this.material3 );
  this.cubeMore.name = 'left';
  this.cubeMore.position.set( 0,1,-this.offsets.z );
  this.unlockBlock.add( this.cubeMore );

  this.cubeLess = new THREE.Mesh( geometryCube, this.material );
  this.cubeLess.position.set( 0,-1,-this.offsets.z );
  this.cubeLess.name = 'right';
  this.unlockBlock.add( this.cubeLess );

  var geometryArrow = new THREE.PlaneGeometry( 0.7, 0.7, 0.7 );
  var texture = THREE.ImageUtils.loadTexture('assets/background_arrows.png');
  this.materialBackground = new THREE.MeshBasicMaterial({map: texture, depthWrite: false, depthTest: false});
  this.materialBackground.transparent = true;
  var background = new THREE.Mesh( geometryArrow, this.materialBackground );
  background.position.set( 0,0,-this.offsets.z-1 );
  background.name = 'background';
  this.unlockBlock.add( background );
  this.scene.add( this.panelNavigation );

  this.cubeMore.position.y= 0;
  this.cubeLess.position.y= 0;
  this.createPointer();

  var geometry = new THREE.TorusGeometry( 30, 20, 16, 100 );
  this.materialTorus = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  this.materialTorus.transparent = true;
  this.materialTorus.opacity = 0;

  this.torus = new THREE.Mesh( geometry, this.materialTorus );
  this.torus.rotateX( Math.PI / 2 );
  this.torus.name = 'clickBox';
  this.torus.position.y -= 50;
  this.panelNavigation.add( this.torus );
  this.unlockBlock.traverse( function ( object ) { object.visible = false; } );
  this.hideNavigation();
};

Navigation.prototype.createPointer = function(){
  var geometryPointer = new THREE.SphereGeometry( 0.05, 32, 32 );
  var materialPointer =  new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var point = new THREE.Mesh( geometryPointer, materialPointer );
  point.position.set( 0, 0, -this.offsets.z );
  this.pointer.add( point );
  this.camera.add( this.pointer );

  this.timerGraphic = new TimerGraphic();
  point.add( this.timerGraphic.planeMesh );

};

Navigation.prototype.update = function(story) {
  if(story!==null && this.active === true){
    this.raycaster.setFromCamera( this.center, this.camera );
    this.intersects = this.raycaster.intersectObjects(this.panelNavigation.children,true );
    if(this.intersects.length > 0){
      console.log(this.intersects[0].object.name);
      if(this.unlocked === false && this.intersects[0].object.name!='clickBox' && this.intersects[0].object.name!='background' && this.boxClicked===true){
        if(this.buttonsEnabled===true){
          if(this.intersects[0].object.name=='left'){
            this.dispatchEvent({type:this.ON_NAVIGATION,move: 'DOWN'});
            this.unlocked = true;
          }
          if(this.intersects[0].object.name=='right'){
            this.dispatchEvent({type:this.ON_NAVIGATION,move: 'UP'});
            this.unlocked = true;
          }
        }
      }else{
        if(this.boxClicked===false && this.intersects[0].object.name=='clickBox'){
          this.boxClicked = true;
          this.showNavigation();
          this.FocusLupa = {var:0};
          this.timer = TweenMax.to(this.FocusLupa , 1, {
            var: 1,
            onUpdate: _.bind(function(){
              //this.clearNavigation();
              if(this.intersects.length > 0){
                if(this.intersects[0].object.name!='background'){
                  this.timer.progress(0);
                }
              }else{
                this.clearNavigation();
              }
              //console.log(this.intersects[0].object.name,this.timer.progress());
              this.timerGraphic.progress(this.timer.progress());
              //console.log(this.timer.progress());
            }, this),
            onComplete: _.bind(function(){
              console.log('FINISH');
              this.timerGraphic.progress(0);
              this.showButtons();
            },this)
            });
          }
        }
    }

    this.panelNavigation.position.copy( this.dummyCamera.position );
  }

};

Navigation.prototype.showNavigation = function(){
  console.log('Show Navigation');
  this.panelNavigation.position.copy( this.dummyCamera.position );
  this.unlockBlock.rotation.copy( this.camera.rotation );
  this.unlockBlock.traverse(
    function ( object ) {
      console.log(object.name);
      if(object.name!='left' && object.name!='right'){ object.visible = true; }
    }
  );
  this.material.opacity = 0;
  this.material3.opacity = 0;
  this.materialBackground.opacity = 0;
  TweenMax.to(this.materialBackground, 1, {opacity: 1} );
};

Navigation.prototype.showButtons = function () {
  this.unlockBlock.traverse( function ( object ) { object.visible = true; } );
  TweenMax.to(this.cubeMore.position, 1, {
      y: 1,
      onComplete: _.bind(
        function(){
          this.buttonsEnabled = true;
          this.timing = setTimeout(_.bind(function(){
            this.clearNavigation();
          }, this), 2000);
        }, this)
  } );
  TweenMax.to(this.cubeLess.position, 1, {
      y: -1,
  } );
  TweenMax.to(this.material, 1, {opacity: 1} );
  TweenMax.to(this.material3, 1, {opacity: 1} );
};

Navigation.prototype.hideNavigation = function(){
  console.log('Hide Navigation');
  TweenMax.to(this.cubeMore.position, 1, {
      y: 0,
      onComplete: _.bind(function(){
        this.unlockBlock.traverse( function ( object ) { object.visible = false; } );
        this.buttonsEnabled = false;
      }, this)
  } );
  TweenMax.to(this.cubeLess.position, 1, {
      y: 0
  } );

  TweenMax.to(this.material, 0.5, {opacity: 0} );
  TweenMax.to(this.material3, 0.5, {opacity: 0} );
  TweenMax.to(this.materialBackground, 1, {opacity: 0} );
};

Navigation.prototype.clearNavigation = function(){
  console.log('CLEAR');
  this.controlNav = [];
  this.unlocked = false;
  this.boxClicked = false;
  this.timing = false;
  this.buttonsEnabled = false;
  this.timerGraphic.progress(0);
  this.timer.kill();
  this.hideNavigation();
};

module.exports = Navigation;
