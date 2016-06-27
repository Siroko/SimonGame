/**
 * Created by siroko on 5/30/16.
 */

var THREE = require('three');

var ModelData = function(){
    this.data = [
        {
            id: "story1",
            long:  -3.515625,
            lat: 40.371659,
            children: [
                {
                    id: "zoom-state-1",
                    cameraRadius: 7500,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 1.2,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "centric-plane",
                            long: -5.976563,
                            lat: 37.081476
                        },
                        {
                            id: "hostpot2",
                            type: "generic",
                            long: 5.273438,
                            lat: 43.253205
                        },
                        {
                            id: "hostpot3",
                            type: "generic",
                            long: 1.054688,
                            lat: 29.142566
                        }
                    ]
                },
                {
                    id: "zoom-state-2",
                    cameraRadius: 3500,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.6,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "generic",
                            long: 0,
                            lat: 35.368895
                        },
                        {
                            id: "hostpot2",
                            type: "generic",
                            long: 1.757813,
                            lat: 41.424194
                        },
                        {
                            id: "hostpot3",
                            type: "generic",
                            long: -8.261719,
                            lat: 43.115019
                        }
                    ]

                },
                {
                    id: "zoom-state-3",
                    cameraRadius: 400,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.15,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "text",
                            long: -9.382324,
                            lat: 39.074111
                        },
                        {
                            id: "hostpot2",
                            type: "text",
                            long: -0.351563,
                            lat: 39.465354
                        },
                        {
                            id: "hostpot3",
                            type: "text",
                            long: -5.559082,
                            lat: 36.327850
                        }
                    ]
                },
                {
                    id: "zoom-state-4",
                    cameraRadius: 50,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.2,
                    hotspots: [
                    ]
                }
            ]
        },
        {
            id: "story3",
            long: 50.273438,
            lat: 46.490829,
            children: [
                {
                    id: "zoom-state-1",
                    cameraRadius: 7500,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 1.2,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "centric-plane",
                            long: 51.547852,
                            lat: 44.581665
                        },
                        {
                            id: "hostpot2",
                            type: "generic",
                            long: 48.823242,
                            lat: 39.290734
                        },
                        {
                            id: "hostpot3",
                            type: "generic",
                            long: 54.887695,
                            lat: 38.949797
                        }
                    ]
                },
                {
                    id: "zoom-state-2",
                    cameraRadius: 3500,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.6,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "generic",
                            long: 47.197266,
                            lat: 43.753241
                        },
                        {
                            id: "hostpot2",
                            type: "generic",
                            long: 27.597656,
                            lat: 42.664261
                        },
                        {
                            id: "hostpot3",
                            type: "generic",
                            long: 38.184228,
                            lat: 44.736328
                        }
                    ]

                },
                {
                    id: "zoom-state-3",
                    cameraRadius: 400,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.4,
                    hotspots: [

                    ]
                },
                {
                    id: "zoom-state-4",
                    cameraRadius: 50,
                    positionOffset: new THREE.Vector3( 10, 10, 0 ),
                    scale: 0.2,
                    hotspots: [
                        {
                            id: "hostpot1",
                            type: "text",
                            long: 47.197266,
                            lat: 43.753241
                        }
                    ]
                }
            ]
        }
    ];
};

module.exports = ModelData;