/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

import * as THREE from "three";

const Vector3 = THREE.Vector3;
const Quaternion = THREE.Quaternion;

export class FlyControls {
    camera: THREE.Camera;
    domElement: HTMLCanvasElement;
    movementSpeed: number;
    rollSpeed: number;
    dragToLook: boolean;
    autoForward: boolean;
    tmpQuaternion: any;

    mouseStatus: number;

    moveState: any;
    moveVector: any;
    rotationVector: any;
    movementSpeedMultiplier: number;

    _mousemove: any;
    _mousedown: any;
    _mouseup: any;
    _keydown: any;
    _keyup: any;

    lastX: number;
    lastY: number;

    moving: boolean;

    constructor(camera: THREE.Camera, domElement: HTMLCanvasElement) {
        this.camera = camera;
        this.domElement = domElement;
        if (domElement) this.domElement.setAttribute('tabindex', "-1    ");

        this.lastX = 0;
        this.lastY = 0;

        // API

        this.movementSpeed = 1.0;
        this.rollSpeed = 0.005;

        this.dragToLook = false;
        this.autoForward = false;

        // disable default target object behavior

        // internals

        this.tmpQuaternion = new Quaternion();

        this.mouseStatus = 0;

        this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
        this.moveVector = new Vector3(0, 0, 0);
        this.rotationVector = new Vector3(0, 0, 0);
        this.movementSpeedMultiplier = 1;

        this._mousemove = this.bind(this, this.mousemove);
        this._mousedown = this.bind(this, this.mousedown);
        this._keydown = this.bind(this, this.keydown);
        this._keyup = this.bind(this, this.keyup);

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousemove', this._mousemove, false);
        this.domElement.addEventListener('mousedown', this._mousedown, false);
        this.domElement.addEventListener('mouseup', this._mouseup, false);

        window.addEventListener('keydown', this._keydown, false);
        window.addEventListener('keyup', this._keyup, false);

        this.updateMovementVector();
        this.updateRotationVector();

        this.moving = false;
    }

    keydown(event: any) {

        if (event.altKey) {

            return;

        }

        //event.preventDefault();

        switch (event.keyCode) {

            case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

            case 87: /*W*/ this.moveState.forward = 1; break;
            case 83: /*S*/ this.moveState.back = 1; break;

            case 65: /*A*/ this.moveState.left = 1; break;
            case 68: /*D*/ this.moveState.right = 1; break;

            case 82: /*R*/ this.moveState.up = 1; break;
            case 70: /*F*/ this.moveState.down = 1; break;

            case 38: /*up*/ this.moveState.pitchUp = 1; break;
            case 40: /*down*/ this.moveState.pitchDown = 1; break;

            case 37: /*left*/ this.moveState.yawLeft = 1; break;
            case 39: /*right*/ this.moveState.yawRight = 1; break;

            case 81: /*Q*/ this.moveState.rollLeft = 1; break;
            case 69: /*E*/ this.moveState.rollRight = 1; break;

        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    keyup(event: any) {

        switch (event.keyCode) {

            case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

            case 87: /*W*/ this.moveState.forward = 0; break;
            case 83: /*S*/ this.moveState.back = 0; break;

            case 65: /*A*/ this.moveState.left = 0; break;
            case 68: /*D*/ this.moveState.right = 0; break;

            case 82: /*R*/ this.moveState.up = 0; break;
            case 70: /*F*/ this.moveState.down = 0; break;

            case 38: /*up*/ this.moveState.pitchUp = 0; break;
            case 40: /*down*/ this.moveState.pitchDown = 0; break;

            case 37: /*left*/ this.moveState.yawLeft = 0; break;
            case 39: /*right*/ this.moveState.yawRight = 0; break;

            case 81: /*Q*/ this.moveState.rollLeft = 0; break;
            case 69: /*E*/ this.moveState.rollRight = 0; break;

        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    mousedown(event: any) {

        this.domElement.requestPointerLock();

        this.moving = true;

        event.preventDefault();
        event.stopPropagation();

    };

    mousemove(event: any) {

        if (this.moving) {

            var xAxis = new THREE.Vector3(1 ,0 ,0);
            var yAxis = new THREE.Vector3(0 ,1 ,0);

            this.camera.rotateOnAxis(xAxis, event.movementY * -0.005);
            this.camera.rotateOnWorldAxis(yAxis, event.movementX * -0.005);


            this.updateRotationVector();
        }

    };


    update(delta: any) {

        var moveMult = delta * this.movementSpeed;
        var rotMult = delta * this.rollSpeed;

        this.camera.translateX(this.moveVector.x * moveMult);
        this.camera.translateY(this.moveVector.y * moveMult);
        this.camera.translateZ(this.moveVector.z * moveMult);

        this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
        this.camera.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);


    };

    updateMovementVector() {
        var forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;

        this.moveVector.x = (- this.moveState.left + this.moveState.right);
        this.moveVector.y = (- this.moveState.down + this.moveState.up);
        this.moveVector.z = (- forward + this.moveState.back);
    };

    updateRotationVector() {
        this.rotationVector.x = (- this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (- this.moveState.yawRight + this.moveState.yawLeft);
        this.rotationVector.z = (- this.moveState.rollRight + this.moveState.rollLeft);
    };

    getContainerDimensions() {

        return {
            size: [window.innerWidth, window.innerHeight],
            offset: [0, 0]
        };

    };

    bind(scope: any, fn: any) {

        return function () {

            fn.apply(scope, arguments);

        };

    }

    contextmenu(event: any) {

        event.preventDefault();

    }

    dispose() {

        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this._mousedown, false);
        this.domElement.removeEventListener('mousemove', this._mousemove, false);

        window.removeEventListener('keydown', this._keydown, false);
        window.removeEventListener('keyup', this._keyup, false);

    };
}

