/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var destinationPosition;
var destinationBearing;

var positionTimerId;
var currentPosition;
var prevPosition;
var prevPositionError;      

var compassTimerId;
var currentHeading;
var prevHeading;
var prevCompassErrorCode;

function watchPosition(){
            if(positionTimerId) navigator.geolocation.clearWatch(positionTimerId); 
            positionTimerId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
                enableHighAccuracy: true,
                timeout: 1000,
                maxiumumAge: 0
            });
        }

        function watchCompass(){
            if(compassTimerId) navigator.compass.clearWatch(compassTimerId);
            compassTimerId = navigator.compass.watchHeading(onCompassUpdate, onCompassError, {
                frequency: 100 // Update interval in ms
            });
        }

function onPositionUpdate(position){
            if(position.coords.accuracy > minPositionAccuracy) return;

            prevPosition = currentPosition;
            currentPosition = new LatLon(position.coords.latitude, position.coords.longitude);

            if(prevPosition && prevPosition.distanceTo(currentPosition)*1000 < minUpdateDistance) return;

            updatePositions();
        }

function onPositionError(error){
            watchPosition();

            if(prevPositionError && prevPositionError.code == error.code && prevPositionError.message == error.message) return; 

            $error.html("Error while retrieving current position. <br/>Error code: " + error.code + "<br/>Message: " + error.message);

            if(!$error.is(":visible")){
                $error.show();
                $results.hide();
            }

            prevPositionError = {
                code: error.code,
                message: error.message
            };
        }

        function onCompassUpdate(heading){
            prevHeading = currentHeading;
            currentHeading = heading.trueHeading >= 0 ? Math.round(heading.trueHeading) : Math.round(heading.magneticHeading);

            if(currentHeading == prevHeading) return;

            updateHeading();
        }

        function onCompassError(error){
            watchCompass();

            if(prevCompassErrorCode && prevCompassErrorCode == error.code) return; 

            var errorType;
            switch(error.code){
                case 1:
                    errorType = "Compass not supported";
                    break;
                case 2:
                    errorType = "Compass internal error";
                    break;
                default:
                    errorType = "Unknown compass error";
            }

            $error.html("Error while retrieving compass heading: "+errorType);

            if(!$error.is(":visible")){
                $error.show();
                $results.hide();
            }

            prevCompassErrorCode = error.code;
        }

        function updateDestination(){
            destinationPosition = new LatLon($targetLat.val(), $targetLon.val());
            updatePositions();
        }       


        function updatePositions(){
            if(!currentPosition) return;

            if(!$results.is(":visible")){
                $results.show();
                $error.hide();
            }

            destinationBearing = Math.round(currentPosition.bearingTo(destinationPosition)); 

            $distance.html(Math.round(currentPosition.distanceTo(destinationPosition)*1000));           
            $bearing.html(destinationBearing);

            updateDifference(); 
        }

        function updateHeading(){
            $heading.html(currentHeading);
            updateDifference();
        }

        function updateDifference(){
            var diff = destinationBearing - currentHeading;
            $difference.html(diff);         
            $arrow.css("-webkit-transform", "rotate("+diff+"deg)");         
        }

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        //document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    onLoadReady: function() {
        //alert('load');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //alert(id);
        //console.log('Received Event: ' + id);        
        
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        */
        minPositionAccuracy = 50; // Minimum accuracy in metres to accept as a reliable position
        minUpdateDistance = 1; // Minimum number of metres to move before updating distance to destination

        $targetLat = $('#target-lat');
        $targetLon = $('#target-lon');
        $error = $('#error');           
        $results = $('#results');
        $distance = $('#distance');
        $bearing = $('#bearing');
        $heading = $('#heading');
        $difference = $('#difference');
        $arrow = $('#arrow');


        watchPosition();
        watchCompass();

        // Set destination
        $targetLat.change(updateDestination);
        $targetLon.change(updateDestination);
        updateDestination();
    },
    watchPosition: function(){
        if(positionTimerId) navigator.geolocation.clearWatch(positionTimerId); 
            positionTimerId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
                enableHighAccuracy: true,
                timeout: 1000,
                maxiumumAge: 0
            });
    },
    watchCompass: function(){
        if(compassTimerId) navigator.compass.clearWatch(compassTimerId);
            compassTimerId = navigator.compass.watchHeading(onCompassUpdate, onCompassError, {
                frequency: 100 // Update interval in ms
            });
    },

};

app.initialize();
