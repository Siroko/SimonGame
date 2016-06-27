/**
 * Created by siroko on 5/30/16.
 * Developed by @jorgalga on 5/30/16.
 */

var THREE = require('three');
var TweenMax = require('gsap');
var threeText = require('../utils/THREE.Text');
var vs_text = require('../glsl/vs-text.glsl');
var fs_text = require('../glsl/fs-text.glsl');
var self;
var init=false;

var Hotspots = function(data, scene, camera, renderer,wmanager,dummyCamera) {
    this.data = data;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.wmanager = wmanager;
    this.dummyCamera = dummyCamera
    
    this.scale = 0.001;
    this.radius = 6371 * 1000 * this.scale;
    
    self = this;
    //Hotspots
    this.hpintersected = false;
    this.scaling = false;
    this.fadingout = false;
    this.planelocked = false;
    this.active_hotspot = undefined;
    this.currentPlane = undefined;
    this.HPArray = [];								// Hotspots ant its attached Planes
    this.HPgroup = new THREE.Object3D();
    this.Textos3D = new THREE.Object3D();
    this.planes3D = new THREE.Object3D();
    this.Textos = [];
    this.scalemultipler = 0;
    

    //Picking up stuff
    this.raycaster = new THREE.Raycaster();
    this.raycaster2 = new THREE.Raycaster();
    this.intersects = "";
    this.intersects2 = "";
    this.mouseVector = new THREE.Vector3();						
    this.timeactive = 1500;							// Time in milisecs a plane is opened when is not being looked at
    
    //fonts
    this.atlasRobotoCondensed = new THREE.FontAtlas( {
		renderer: this.renderer,
		fontName: 'Shadows Into Light',
		size: 150,
		src: 'https://fonts.googleapis.com/css?family=Shadows+Into+Light'
	}, this.checking );
};

/**
 * Launches the init funtion with the callback of the Font loading
 */
Hotspots.prototype.checking = function(){
    self.init();
};

/**
 * Init function
 */
Hotspots.prototype.init = function(){
    //this.createHotspots(1,2);//story 1 and zoom state 2
};

/**
 * Updating values function
 */
Hotspots.prototype.update = function(){
	if(init==true){
		this.raycasting();
		//Making the planes to stare at the camera
		for (var i = 0; i < this.planes3D.children.length; i++) {
			var plane = this.planes3D.children[i];
			plane.quaternion.copy( this.dummyCamera.quaternion );
			plane.rotateOnAxis( new THREE.Vector3(0,1,0),  Math.PI*0.7);
		}
	}
};


/**
 * Evaluation of the intersection between the POV of the camera and the Hotspots
 */
Hotspots.prototype.raycasting = function(){
    this.mouseVector.x = 0;
    this.mouseVector.y = 0;
    this.raycaster.setFromCamera( this.mouseVector, this.camera );
    this.raycaster2.setFromCamera( this.mouseVector, this.camera );
    this.intersects = this.raycaster.intersectObjects(this.HPgroup.children );
    this.intersects2 = this.raycaster2.intersectObjects(this.planes3D.children );
   

    
   if( this.scaling == false){
        if(this.intersects2.length > 0){  
           
            if(this.planelocked==false){
                this.planelocked=true;
          
                if(this.currentPlane !== undefined){
                    TweenMax.to(this.currentPlane.material, 0.2, {opacity: 1} );
                }
            }
        }
        else{
            if(this.planelocked==true){
                this.planelocked=false;
                if(this.currentPlane != undefined){
                    this.fadingout = true;
                    TweenMax.to(this.currentPlane.material, this.timeactive/1000, {opacity: 0, onComplete:this.disactAll } );     
                }
            }
        } 
   }
    
    

    if(this.intersects.length > 0){
        var intersection = this.intersects[ 0 ], obj = intersection.object;
        if( this.active_hotspot == undefined){
            if(this.hpintersected == false){
                
                console.log("undefined");
                this.hpintersected = true;
                this.active_hotspot = obj;               
                
                this.disActivatePlanes();
				this.activatePlaneById(obj.uuid);
            }
        }
        else{
            if(obj.uuid !== this.active_hotspot.uuid){this.hpintersected=false;}
             if(this.hpintersected == false){
                
                console.log("new hotspot");
                this.hpintersected = true;
                this.active_hotspot = obj;
                
                
                this.disActivatePlanes();
				this.activatePlaneById(obj.uuid);

        
            }
        }
    }
    else{
        
        if(this.currentPlane != undefined && this.intersects2.length == 0 &&  this.fadingout == false){
            console.log("plane opened but never stared at");
            this.fadingout = true;
            TweenMax.to(this.currentPlane.material, this.timeactive/1000, {opacity: 0, onComplete:this.disactAll } );  
        }
        
    }
   
};

Hotspots.prototype.disactAll = function(){
    self.fadingout = false;
    self.active_hotspot = undefined;
    self.hpintersected=false;
    self.disActivatePlanes();

};
    
Hotspots.prototype.defaultState = function(){
    self.scaling = false;
};

/**
 * Creates and add to the World the Hotsports of an story and its zoom level
 * @param {String} idhp is the unique id of the Hotspot
 * @param {Number} idhp is the unique id of the Hotspot
 */
Hotspots.prototype.createHotspots = function(storyid, zoom){
	this.wmanager.earthContainer.remove(this.HPgroup);
	this.wmanager.earthContainer.remove(this.planes3D);
	
	if( !storyid ){
		this.init = false;
		return;
    }

    var story;
	for(i=0; i<this.data.data.length; i++){
		if(this.data.data[i].id === storyid[0].id){
			story = i;
		}
    }
    
    this.HPgroup = new THREE.Object3D();
    this.planes3D = new THREE.Object3D();
    this.HPArray = [];
	
	this.g = new THREE.SphereBufferGeometry( 1000000 * this.scale, 10, 10 );
    this.m = new THREE.MeshNormalMaterial({});
	var storyhotspots = this.data.data[story].children[zoom-1].hotspots;
    this.scalemultipler = this.data.data[story].children[zoom-1].scale;
 

    var pos;
    this.renderer.sortObjects = false;

    for (var i = 0; i < storyhotspots.length; i++) {
		pos = this.calcPosFromLatLonRad( storyhotspots[i].lat, storyhotspots[i].long, this.radius  );
        var mesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 100000 * this.scale * this.scalemultipler, 10, 10 ), new THREE.MeshBasicMaterial( {
            color: 0xff00ff,
            transparent: true,
            opacity:0.0,
            depthTest: false,
            depthWrite: false}));
        mesh.position.x = pos[0];
        mesh.position.y = pos[1];
        mesh.position.z = pos[2];
        this.fadein(mesh,0.1,true);
        mesh.scale.set(0.001,0.001,0.001);
        TweenMax.to(mesh.scale, 1, {x: 1, y: 1, z: 1} );
        
        
		pos = this.calcPosFromLatLonRad( storyhotspots[i].lat, storyhotspots[i].long, this.radius   );
		var p_geometry = new THREE.PlaneGeometry(1, 1,1,1);
        var p_map = new THREE.TextureLoader().load("assets/Level2.png");
        p_map.wrapS = THREE.RepeatWrapping;
        p_map.wrapT = THREE.RepeatWrapping;
		p_map.repeat.set(1, 1 );
        p_map.depthWrite = false;
		var p_material = new THREE.MeshBasicMaterial({
            map : p_map,
            transparent: true,
            opacity:0.0,
            depthTest: false,
            depthWrite: false
        });
        var plane = new THREE.Mesh( p_geometry, p_material );
        plane.material.side = THREE.DoubleSide;
        plane.position.x = pos[0] + 250 * this.scalemultipler;
        plane.position.y = pos[1] + 2000 * this.scalemultipler -  0;
        plane.position.z = pos[2];
        plane.lookAt(this.wmanager.cameraDummy.position);
        
      
       
		var text = new THREE.Text( this.atlasRobotoCondensed, vs_text, fs_text);
        this.Textos.push(text);
		text.mesh.scale.set(-5000,5000,1);
        text.mesh.position.x = pos[0];
        text.mesh.position.y = pos[1];
        text.mesh.position.z = pos[2];
		text.mesh.lookAt(this.camera.position);


        this.HPgroup.add(mesh);
        //this.HPgroup.add(mesh2);
        this.planes3D.add(plane);
        //this.Textos3D.add(text.mesh);
		
		//Attaching Hotspot to Plane
		this.HPArray.push({meshid: mesh.uuid,planegeo: plane});
	}
	this.wmanager.earthContainer.add( this.HPgroup );
	this.wmanager.earthContainer.add( this.planes3D );
	init = true;
};

/**
 * Provides the Plane attache to the ide of a Hotspot
 * @param {String} idhp is the unique id of the Hotspot
 * @return {Object}
 */
Hotspots.prototype.getPlaneById = function( idhp ) {
	for(i=0; i < this.HPArray.length ; i++ ){
		if(this.HPArray[i].meshid ===  idhp){
			return this.HPArray[i].planegeo;
		}
	}	
};

/**
 * Activates the plane attached to a Hotspot
 * @param {String} idhp is the unique id of the Hotspot
 */
Hotspots.prototype.activatePlaneById = function( idhp ) {
	for(i=0; i < this.HPArray.length ; i++ ){
		if(this.HPArray[i].meshid ===  idhp){
			this.HPArray[i].planegeo.scale.x = 4000*this.scalemultipler;
			//this.HPArray[i].planegeo.scale.y = 4000*this.scalemultipler;
			this.HPArray[i].planegeo.scale.y = 0.001;
			this.currentPlane = this.HPArray[i].planegeo;
			this.fadein(this.currentPlane,0.15,false);
            this.currentPlane.position.y += -4000/2*this.scalemultipler;
            var destinationy = this.currentPlane.position.y + 4000/2*this.scalemultipler;
            
            this.scaling = true;
            
            TweenMax.to(this.currentPlane.position, 0.4, {y: destinationy} );
            TweenMax.to(this.currentPlane.scale, 0.4, {y: (4000*this.scalemultipler) , onComplete: this.defaultState  } );
		}
	}
};

/**
 * Disactivates all the planes on the scene
 */
Hotspots.prototype.disActivatePlanes = function( ) {
	if( (this.planelocked==false || this.hpintersected == true)  ){
		for(i=0; i < this.HPArray.length ; i++ ){
			this.HPArray[i].planegeo.scale.x = 0.001;
			this.HPArray[i].planegeo.scale.y = 0.001;
			this.HPArray[i].planegeo.material.opacity = 0.0;
		}
		this.currentPlane = undefined;
	}
};

/**
 * Provides the xyz position over the surface of an earth
 * @param {Nomber} lat is the lattitude parameter
 * @param {Number} long is the longitude parameter
 * @param {Nomber} radius is the radius of the earth
 * @return {Array}
 */
Hotspots.prototype.calcPosFromLatLonRad = function( lat,lon,radius ) {
    var phi   = (90-lat)*(Math.PI/180);
    var theta = (lon+180)*(Math.PI/180);
    var x = -((radius) * Math.sin(phi)*Math.cos(theta));
    var z = ((radius) * Math.sin(phi)*Math.sin(theta));
    var y = ((radius) * Math.cos(phi));

    return [x,y,z];
};


/**
 * Recursive function for fadein in an element
 * @param {Object} mesh Three.js object over the transition is applied 
 * @param {Number} offset for the amount of opacity added
 * @param {Boolean} depth brings back the object to logical rendering order
 */
Hotspots.prototype.fadein = function( mesh, offset, depth ) {
	if(mesh.material.opacity >= 1){
		mesh.material.opacity = 1;
        if(depth)
		{
        	mesh.material.transparent = false;
        	mesh.material.depthTest = true;
        	mesh.material.depthWrite = true;
        }
        return;
    }
    else{
		mesh.material.opacity = mesh.material.opacity + offset;
		setTimeout(function() {
			self.fadein(mesh,offset,depth);
		}, 50);
    }
};

module.exports = Hotspots;